import { ForbiddenException, InjectionToken } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Test } from '@nestjs/testing';
import { createMocks } from 'node-mocks-http';
import { createMock } from 'ts-auto-mock';

import { User } from '@/auth/entities/user.entity';
import { Entities } from '@/blog/constants/entity.enum';
import { Article } from '@/blog/entities/article.entity';
import { Comment } from '@/blog/entities/comment.entity';
import { IsAuthorGuard } from '@/blog/guards/is-author.guard';
import { ArticleService } from '@/blog/services/article.service';
import { CommentService } from '@/blog/services/comment.service';

const user = User.fromPartial({ id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5' });
const article: Article = Object.create(Article.prototype, {
  id: { value: 'a832e632-0335-4191-8469-4d849bbb72be' },
  slug: {
    value:
      'however-wolfs-have-begun-to-rent-blueberries-over-the-past-few-months-specifically-for-lions-associated-with-their-puppies-mLDYhAjz213rjfHRJwqUES',
  },
  author: { value: user },
});
const comment: Comment = Object.create(Comment.prototype, {
  id: { value: '9395e782-367b-4487-a048-242e37169109' },
  article: { value: article },
  author: { value: user },
});

describe('IsAuthorGuard', () => {
  let mockedReflector: jest.Mocked<Reflector>;
  let guard: IsAuthorGuard;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ModuleRef,
          useValue: createMock<ModuleRef>({
            get: jest.fn().mockImplementation((typeOrToken: InjectionToken) => {
              if (typeOrToken === ArticleService) {
                return createMock<ArticleService>({
                  getById: jest.fn().mockImplementation((id: Article['id']) =>
                    // eslint-disable-next-line unicorn/no-null
                    id === article.id ? article : null,
                  ),
                });
              }

              if (typeOrToken === CommentService) {
                return createMock<CommentService>({
                  getById: jest.fn().mockImplementation((id: Comment['id']) =>
                    // eslint-disable-next-line unicorn/no-null
                    id === comment.id ? comment : null,
                  ),
                });
              }
            }),
          }),
        },
        {
          provide: Reflector,
          useValue: createMock<Reflector>(),
        },
        IsAuthorGuard,
      ],
    }).compile();

    guard = module.get(IsAuthorGuard);
    mockedReflector = module.get(Reflector);
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
    async function ({ id, entity }: { id: string; entity: Entities }) {
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
    { id: article.id, entity: Entities.ARTICLE },
    { id: comment.id, entity: Entities.COMMENT },
  ])(
    'should throw when the current user is not the author of the $entity',
    async ({ id, entity }) => {
      const { req, res } = createMocks({
        user: User.fromPartial({ id: '63770485-6ee9-4a59-b374-3f194091e2e1' }),
        params: { id },
      });
      const context = new ExecutionContextHost([req, res]);

      mockedReflector.get.mockReturnValueOnce(entity);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    },
  );
});
