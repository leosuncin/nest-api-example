import { type InjectionToken } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Test } from '@nestjs/testing';
import { User } from '~auth/entities/user.entity';
import { john as user } from '~auth/fixtures/users';
import { Entities } from '~blog/constants/entity.enum';
import { type Article } from '~blog/entities/article.entity';
import { type Comment } from '~blog/entities/comment.entity';
import { articleByJohn as article } from '~blog/fixtures/articles';
import { commentByJaneOnArticleByJohn as comment } from '~blog/fixtures/comments';
import { IsAuthorGuard } from '~blog/guards/is-author.guard';
import { ArticleService } from '~blog/services/article.service';
import { CommentService } from '~blog/services/comment.service';
import { createMockInstance } from 'jest-create-mock-instance';
import { createMocks } from 'node-mocks-http';

describe('IsAuthorGuard', () => {
  let mockedReflector: jest.Mocked<Reflector>;
  let guard: IsAuthorGuard;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ModuleRef,
          useValue: {
            get: jest.fn().mockImplementation((typeOrToken: InjectionToken) => {
              let mock;

              if (typeOrToken === ArticleService) {
                mock = createMockInstance(ArticleService);
                mock.getById.mockImplementation((id: Article['id']) =>
                  Promise.resolve(id === article.id ? article : null),
                );
              }

              if (typeOrToken === CommentService) {
                mock = createMockInstance(CommentService);
                mock.getById.mockImplementation((id: Comment['id']) =>
                  Promise.resolve(id === comment.id ? comment : null),
                );
              }

              return mock;
            }),
          },
        },
        {
          provide: Reflector,
          useValue: createMockInstance(Reflector),
        },
        IsAuthorGuard,
      ],
    }).compile();

    guard = module.get(IsAuthorGuard);
    mockedReflector = module.get(Reflector);
    comment.author = user;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it.each`
    id                                        | entity              | description
    ${article.id}                             | ${Entities.ARTICLE} | ${'article by id exist'}
    ${article.slug}                           | ${Entities.ARTICLE} | ${'article by slug exist'}
    ${'mLDYhAjz213rjfHRJwqUES'}               | ${Entities.ARTICLE} | ${'article by short id exist'}
    ${comment.id}                             | ${Entities.COMMENT} | ${'comment by id exist'}
    ${'013cd55e-aed5-4201-a2cd-1458b0c9523b'} | ${Entities.ARTICLE} | ${'article by id not exist'}
    ${'188580f8-e3ff-43d8-ac37-f3063477db53'} | ${Entities.COMMENT} | ${'comment by id not exist'}
  `(
    'should authorize when $description',
    async function ({ id, entity }: { entity: Entities; id: string }) {
      const { req, res } = createMocks({
        params: { id },
        user,
      });
      const context = new ExecutionContextHost([req, res]);

      mockedReflector.get.mockReturnValueOnce(entity);

      await expect(guard.canActivate(context)).resolves.toBe(true);
    },
  );

  it.each([
    { entity: Entities.ARTICLE, id: article.id },
    { entity: Entities.COMMENT, id: comment.id },
  ])(
    'should throw when the current user is not the author of the $entity',
    async ({ id, entity }) => {
      const { req, res } = createMocks({
        params: { id },
        user: User.fromPartial({ id: '63770485-6ee9-4a59-b374-3f194091e2e1' }),
      });
      const context = new ExecutionContextHost([req, res]);

      mockedReflector.get.mockReturnValueOnce(entity);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    },
  );
});
