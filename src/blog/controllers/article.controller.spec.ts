import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';

import { User } from '@/auth/entities/user.entity';
import { ArticleController } from '@/blog/controllers/article.controller';
import { CreateArticle } from '@/blog/dto/create-article.dto';
import { Article } from '@/blog/entities/article.entity';
import { ArticleService } from '@/blog/services/article.service';

describe('ArticleController', () => {
  let controller: ArticleController;
  const mockArticleService = mock<ArticleService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: ArticleService,
          useValue: mockArticleService,
        },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
  });

  afterEach(() => {
    mockReset(mockArticleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should save the new article', async () => {
    const newArticle: CreateArticle = {
      title:
        'Exercitation nisi anim enim pariatur eu eu laboris veniam anim elit consequat tempor eu',
      content: `Laboris occaecat reprehenderit ut id irure duis.
Dolor consequat labore elit velit proident do qui non reprehenderit occaecat occaecat tempor fugiat officia.
Veniam non nulla aliquip ut non irure sunt nostrud dolor dolore elit mollit aliqua laboris ad.
Commodo sit excepteur ipsum.
Irure velit sunt voluptate et amet nisi.
Consequat ad velit elit.`,
      author: new User(),
    };
    mockArticleService.create.mockImplementation((newArticle) =>
      Promise.resolve(Object.assign(new Article(), newArticle)),
    );

    await expect(controller.create(newArticle)).resolves.toBeInstanceOf(
      Article,
    );
    expect(mockArticleService.create).toHaveBeenCalledWith(newArticle);
  });
});
