import { Test, TestingModule } from '@nestjs/testing';
import { type MockProxy, mock } from 'jest-mock-extended';

import { User } from '@/auth/entities/user.entity';
import { CommentController } from '@/blog/controllers/comment.controller';
import { CreateComment } from '@/blog/dto/create-comment';
import { Article } from '@/blog/entities/article.entity';
import { Comment } from '@/blog/entities/comment.entity';
import { ArticleService } from '@/blog/services/article.service';
import { CommentService } from '@/blog/services/comment.service';

describe('CommentController', () => {
  let mockCommentService: MockProxy<CommentService>;
  let controller: CommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
      ],
    })
      .useMocker((token) => {
        if (Object.is(token, CommentService)) {
          return mock<CommentService>();
        }

        if (Object.is(token, ArticleService)) {
          return mock<ArticleService>();
        }
      })
      .compile();

    controller = module.get<CommentController>(CommentController);
    mockCommentService = module.get<CommentService, MockProxy<CommentService>>(
      CommentService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new comment', async () => {
    const newComment: CreateComment = {
      body: 'In fugiat consequat culpa labore eiusmod minim',
      article: new Article(),
      author: new User(),
    };

    mockCommentService.create.mockImplementation((dto) =>
      Promise.resolve(Object.assign(new Comment(), dto)),
    );

    await expect(controller.create(newComment)).resolves.toBeInstanceOf(
      Comment,
    );
  });

  it('should get all comments by page', async () => {
    mockCommentService.findBy.mockResolvedValue({
      items: [new Comment()],
      meta: {
        currentPage: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalItems: 1,
        totalPages: 1,
      },
    });

    await expect(
      controller.getAll({ limit: 10, page: 1 }, new Article()),
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
    const commentId = 'a832e632-0335-4191-8469-4d849bbb72be';

    mockCommentService.remove.mockResolvedValueOnce({
      generatedMaps: [],
      raw: [],
      affected: 1,
    });

    await expect(controller.remove(commentId)).resolves.toBeDefined();
    expect(mockCommentService.remove).toHaveBeenCalledWith(commentId);
  });
});
