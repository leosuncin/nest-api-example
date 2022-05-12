import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockInstance } from 'jest-create-mock-instance';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { User } from '@/auth/entities/user.entity';
import { CreateComment } from '@/blog/dto/create-comment';
import { Article } from '@/blog/entities/article.entity';
import { Comment } from '@/blog/entities/comment.entity';
import { CommentService } from '@/blog/services/comment.service';

describe('CommentService', () => {
  let mockCommentRepository: jest.Mocked<Repository<Comment>>;
  let service: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentService],
    })
      .useMocker(() => {
        const mock: jest.Mocked<Repository<Comment>> = Object.assign(
          Object.create(Repository.prototype),
          createMockInstance(Repository),
        );

        mock.create.mockImplementation((dto) =>
          Object.assign(new Comment(), dto),
        );
        mock.save.mockImplementation((comment) =>
          Promise.resolve(comment as Comment),
        );

        return mock;
      })
      .compile();

    mockCommentRepository = module.get<
      Repository<Comment>,
      jest.Mocked<Repository<Comment>>
    >(getRepositoryToken(Comment));
    service = module.get<CommentService>(CommentService);
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
    expect(mockCommentRepository.create).toHaveBeenCalledWith(newComment);
    expect(mockCommentRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should paginate the comments', async () => {
    const queryBuilder = createMockInstance(SelectQueryBuilder);
    const article = Object.assign(new Article(), {
      id: 'a832e632-0335-4191-8469-4d849bbb72be',
    });

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
    queryBuilder.clone.mockReturnValue(queryBuilder);
    queryBuilder.getMany.mockResolvedValue([new Comment()]);
    queryBuilder.getRawOne.mockResolvedValue({ value: '1' });
    // @ts-expect-error mock connection
    queryBuilder.connection = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    mockCommentRepository.createQueryBuilder.mockReturnValue(
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
});
