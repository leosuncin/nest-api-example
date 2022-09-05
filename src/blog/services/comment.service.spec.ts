import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from 'ts-auto-mock';
import { type SelectQueryBuilder, Repository } from 'typeorm';

import { User } from '~auth/entities/user.entity';
import type { CreateComment } from '~blog/dto/create-comment';
import { Article } from '~blog/entities/article.entity';
import { Comment } from '~blog/entities/comment.entity';
import { CommentService } from '~blog/services/comment.service';

describe('CommentService', () => {
  let mockedCommentRepository: jest.Mocked<Repository<Comment>>;
  let service: CommentService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CommentService],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(Comment)) {
          const mock = createMock<Repository<Comment>>({
            create: jest
              .fn()
              .mockImplementation((dto: CreateComment) =>
                Object.assign(new Comment(), dto),
              ),
            save: jest
              .fn()
              .mockImplementation((comment: Comment) =>
                Promise.resolve(comment),
              ),
          });

          Object.setPrototypeOf(mock, Repository.prototype);

          return mock;
        }

        return;
      })
      .compile();

    service = module.get(CommentService);
    mockedCommentRepository = module.get(getRepositoryToken(Comment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save a new comment', async () => {
    const newComment: CreateComment = {
      body: 'In fugiat consequat culpa labore eiusmod minim',
      article: new Article(),
      author: new User(),
    };

    await expect(service.create(newComment)).resolves.toBeInstanceOf(Comment);
    expect(mockedCommentRepository.create).toHaveBeenCalledWith(newComment);
    expect(mockedCommentRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should paginate the comments', async () => {
    const queryBuilder = createMock<SelectQueryBuilder<Article>>({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      cache: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([new Comment()]),
      getRawOne: jest.fn().mockResolvedValue({ value: '1' }),
    }) as unknown as jest.Mocked<SelectQueryBuilder<Comment>>;
    const article = Object.assign(new Article(), {
      id: 'a832e632-0335-4191-8469-4d849bbb72be',
    });

    queryBuilder.clone.mockReturnValue(queryBuilder);
    // @ts-expect-error mock connection
    queryBuilder.connection = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    mockedCommentRepository.createQueryBuilder.mockReturnValue(
      queryBuilder as SelectQueryBuilder<Comment>,
    );

    await expect(
      service.findBy({ limit: 10, page: 1 }, { article }),
    ).resolves.toMatchObject({
      items: expect.arrayContaining([expect.any(Comment)]),
      meta: {
        currentPage: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalItems: 1,
        totalPages: 1,
      },
    });
  });

  it('should soft remove one comment', async () => {
    const id = 'a832e632-0335-4191-8469-4d849bbb72be';

    mockedCommentRepository.softDelete.mockResolvedValueOnce({
      generatedMaps: [],
      raw: [],
      affected: 1,
    });

    await expect(service.remove(id)).resolves.toBeDefined();
    expect(mockedCommentRepository.softDelete).toHaveBeenCalledWith({ id });
  });
});
