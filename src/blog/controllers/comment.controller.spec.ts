import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';

import { User } from '@/auth/entities/user.entity';
import { CommentController } from '@/blog/controllers/comment.controller';
import { CreateComment } from '@/blog/dto/create-comment';
import { Article } from '@/blog/entities/article.entity';
import { Comment } from '@/blog/entities/comment.entity';
import { CommentService } from '@/blog/services/comment.service';

describe('CommentController', () => {
  const mockCommentService = mock<CommentService>();
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
    }).compile();

    controller = module.get<CommentController>(CommentController);
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
});
