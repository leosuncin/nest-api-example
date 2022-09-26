import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockInstance } from 'jest-create-mock-instance';
import { Repository, SelectQueryBuilder } from 'typeorm';

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
        let mock;

        if (token === getRepositoryToken(Comment)) {
          mock = createMockInstance<Repository<Comment>>(Repository);
          mock.create.mockImplementation((dto) => Comment.fromPartial(dto));
          mock.save.mockImplementation((comment) =>
            Promise.resolve(comment as Comment),
          );
        }

        return mock;
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
    const queryBuilder =
      createMockInstance<SelectQueryBuilder<Comment>>(SelectQueryBuilder);
    queryBuilder.where.mockReturnThis();
    queryBuilder.orderBy.mockReturnThis();
    queryBuilder.limit.mockReturnThis();
    queryBuilder.offset.mockReturnThis();
    queryBuilder.skip.mockReturnThis();
    queryBuilder.take.mockReturnThis();
    queryBuilder.cache.mockReturnThis();
    queryBuilder.select.mockReturnThis();
    queryBuilder.from.mockReturnThis();
    queryBuilder.setParameters.mockReturnThis();
    queryBuilder.clone.mockReturnThis();
    queryBuilder.getMany.mockResolvedValue([new Comment()]);
    queryBuilder.getRawOne.mockResolvedValue({ value: '1' });
    const article = Article.fromPartial({
      id: 'a832e632-0335-4191-8469-4d849bbb72be',
    });

    queryBuilder.clone.mockReturnValue(queryBuilder);
    // @ts-expect-error mock connection
    queryBuilder.connection = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    mockedCommentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

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
