import { Test } from '@nestjs/testing';
import { User } from '~auth/entities/user.entity';
import { ArticleController } from '~blog/controllers/article.controller';
import { type CreateArticle } from '~blog/dto/create-article.dto';
import { type UpdateArticle } from '~blog/dto/update-article.dto';
import { Article } from '~blog/entities/article.entity';
import { ArticleService } from '~blog/services/article.service';
import { createMockInstance } from 'jest-create-mock-instance';

describe('ArticleController', () => {
  let controller: ArticleController;
  let mockedArticleService: jest.Mocked<ArticleService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ArticleController],
    })
      .useMocker((token) => {
        if (token === ArticleService) {
          return createMockInstance(ArticleService);
        }

        return undefined;
      })
      .compile();

    controller = module.get(ArticleController);
    mockedArticleService = module.get(ArticleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should save the new article', async () => {
    const newArticle: CreateArticle = {
      author: new User(),
      content: `Laboris occaecat reprehenderit ut id irure duis.
Dolor consequat labore elit velit proident do qui non reprehenderit occaecat occaecat tempor fugiat officia.
Veniam non nulla aliquip ut non irure sunt nostrud dolor dolore elit mollit aliqua laboris ad.
Commodo sit excepteur ipsum.
Irure velit sunt voluptate et amet nisi.
Consequat ad velit elit.`,
      title:
        'Exercitation nisi anim enim pariatur eu eu laboris veniam anim elit consequat tempor eu',
    };
    mockedArticleService.create.mockResolvedValue(
      Object.assign(new Article(), newArticle),
    );

    await expect(controller.create(newArticle)).resolves.toBeInstanceOf(
      Article,
    );
    expect(mockedArticleService.create).toHaveBeenCalledWith(newArticle);
  });

  it('should get one article', () => {
    const article = new Article();

    expect(controller.getOne(article)).toEqual(article);
  });

  it('should get all articles by page', async () => {
    mockedArticleService.findBy.mockResolvedValue({
      items: [new Article()],
      meta: {
        currentPage: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalItems: 1,
        totalPages: 1,
      },
    });

    await expect(
      controller.getAll({ limit: 10, page: 1 }),
    ).resolves.toMatchObject({
      items: expect.arrayContaining([expect.any(Article)]),
      meta: {
        currentPage: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalItems: 1,
        totalPages: 1,
      },
    });
  });

  it('should update an article', async () => {
    const article = new Article();
    const changes: UpdateArticle = {
      content: `Commodo ea reprehenderit aliqua ea.
Proident esse deserunt sint do eu ullamco aliquip reprehenderit qui et Lorem proident.
Exercitation ut esse aute minim tempor non exercitation qui amet laborum incididunt est minim in.`,
      title: 'Sint minim magna irure officia irure commodo.',
    };

    mockedArticleService.update.mockResolvedValue(
      Object.assign(article, changes),
    );

    await expect(controller.update(article, changes)).resolves.toBeInstanceOf(
      Article,
    );
  });

  it('should remove an article', async () => {
    const article = new Article();

    mockedArticleService.remove.mockResolvedValue(
      Object.assign(article, { deletedAt: new Date() }),
    );

    await expect(controller.remove(article)).resolves.toBeInstanceOf(Article);
    expect(mockedArticleService.remove).toHaveBeenCalledWith(article);
  });
});
