import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { runSeeders } from 'typeorm-extension';

import { AuthModule } from '@/auth/auth.module';
import { BlogModule } from '@/blog/blog.module';
import { createArticleFactory } from '@/blog/factories/create-article.factory';
import { createCommentFactory } from '@/blog/factories/create-comment.factory';
import { updateArticleFactory } from '@/blog/factories/update-article.factory';
import { buildTestApplication } from '@/common/build-test-application';
import { database } from '@/common/database';
import { isoDateRegex, uuidRegex } from '@/common/test-matchers';

const unauthorizedError = {
  message: 'Unauthorized',
  statusCode: HttpStatus.UNAUTHORIZED,
};
const notFoundError = {
  error: 'Not Found',
  message: 'The article was not found',
  statusCode: HttpStatus.NOT_FOUND,
};
const forbiddenError = {
  error: 'Forbidden',
  message: 'You are not the author of the article',
  statusCode: HttpStatus.FORBIDDEN,
};

describe('AuthModule', () => {
  let app: INestApplication;
  let jwt: string;

  beforeAll(async () => {
    app = await buildTestApplication(AuthModule, BlogModule);
    const jwtService = app.get(JwtService);
    const dataSource = app.get(getDataSourceToken());
    jwt = jwtService.sign({ sub: '63770485-6ee9-4a59-b374-3f194091e2e1' });
    await runSeeders(dataSource);
  });

  it('create a new article', async () => {
    const data = createArticleFactory.buildOne();

    await request(app.getHttpServer())
      .post('/articles')
      .set('Authorization', `Bearer ${jwt}`)
      .send(data)
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          author: expect.anything(),
          content: data.content,
          createdAt: expect.stringMatching(isoDateRegex),
          id: expect.stringMatching(uuidRegex),
          slug: expect.any(String),
          title: data.title,
          updatedAt: expect.stringMatching(isoDateRegex),
        });
      });
  });

  it('require to be authenticated to create a new article', async () => {
    const data = createArticleFactory.buildOne();

    await request(app.getHttpServer())
      .post('/articles')
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect(unauthorizedError);
  });

  it.each([
    'a832e632-0335-4191-8469-4d849bbb72be',
    'however-wolfs-have-begun-to-rent-blueberries-over-the-past-few-months-specifically-for-lions-associated-with-their-puppies-mLDYhAjz213rjfHRJwqUES',
    'mLDYhAjz213rjfHRJwqUES',
  ])('get one article by id "%s"', async (id) => {
    await request(app.getHttpServer())
      .get(`/articles/${id}`)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          author: expect.anything(),
          content: expect.any(String),
          createdAt: expect.stringMatching(isoDateRegex),
          id: 'a832e632-0335-4191-8469-4d849bbb72be',
          slug: 'however-wolfs-have-begun-to-rent-blueberries-over-the-past-few-months-specifically-for-lions-associated-with-their-puppies-mLDYhAjz213rjfHRJwqUES',
          title:
            'However, wolfs have begun to rent blueberries over the past few months, specifically for lions associated with their puppies?',
          updatedAt: expect.stringMatching(isoDateRegex),
        });
      });
  });

  it("fail to get an article when it doesn't exist", async () => {
    await request(app.getHttpServer())
      .get('/articles/not-exists-ert')
      .expect(HttpStatus.NOT_FOUND)
      .expect(notFoundError);
  });

  it.each([
    { limit: 10, page: 1 },
    { limit: 5, page: 3 },
    { page: 2 },
    { limit: 20 },
  ])('paginate all of the articles by %O', async (query) => {
    await request(app.getHttpServer())
      .get('/articles')
      .query(query)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toHaveProperty(
          'items',
          expect.arrayContaining([expect.any(Object)]),
        );
        expect(body).toHaveProperty(
          'meta',
          expect.objectContaining({
            currentPage: query.page ?? 1,
            itemCount: query.limit ?? 10,
            itemsPerPage: query.limit ?? 10,
            totalItems: expect.any(Number),
            totalPages: expect.any(Number),
          }),
        );
        expect((body as Record<'items' | 'meta', unknown>).items).toHaveLength(
          query.limit ?? 10,
        );
      });
  });

  it('validate the pagination query', async () => {
    await request(app.getHttpServer())
      .get('/articles')
      .query({ limit: -10, page: -2 })
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .expect({
        error: 'Unprocessable Entity',
        message: [
          'limit must be a positive number',
          'page must be a positive number',
        ],
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
  });

  it.each([
    '31a10506-c334-4841-97a6-144a55bf4ebb',
    'though-we-assume-the-latter-however-blueberries-have-begun-to-rent-currants-over-the-past-few-months-specifically-for-eagles-associated-with-their-lemons-78rW4UUH2Ekokt36qUGxqP',
    '78rW4UUH2Ekokt36qUGxqP',
  ])('update one article by id %s', async (id) => {
    const backup = database.backup();
    const title = 'Proident officia do ea pariatur laborum';
    const data = updateArticleFactory.buildOne({ title });

    await request(app.getHttpServer())
      .patch(`/articles/${id}`)
      .set('Authorization', `Bearer ${jwt}`)
      .send(data)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        const slug: string = title.toLowerCase().replace(/\s+/g, '-');

        expect(body).toHaveProperty('title', title);
        expect(body).toHaveProperty('slug', expect.stringContaining(slug));
      });

    backup.restore();
  });

  it('require to be authenticated to update an article', async () => {
    const data = updateArticleFactory.buildOne();

    await request(app.getHttpServer())
      .patch('/articles/31a10506-c334-4841-97a6-144a55bf4ebb')
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect(unauthorizedError);
  });

  it('allow only the author to update an article', async () => {
    const data = updateArticleFactory.buildOne();

    await request(app.getHttpServer())
      .patch('/articles/a832e632-0335-4191-8469-4d849bbb72be')
      .set('Authorization', `Bearer ${jwt}`)
      .send(data)
      .expect(HttpStatus.FORBIDDEN)
      .expect(forbiddenError);
  });

  it.each([
    '31a10506-c334-4841-97a6-144a55bf4ebb',
    'though-we-assume-the-latter-however-blueberries-have-begun-to-rent-currants-over-the-past-few-months-specifically-for-eagles-associated-with-their-lemons-78rW4UUH2Ekokt36qUGxqP',
    '78rW4UUH2Ekokt36qUGxqP',
  ])('remove one article by id %s', async (id) => {
    const backup = database.backup();

    await request(app.getHttpServer())
      .delete(`/articles/${id}`)
      .set('Authorization', `Bearer ${jwt}`)
      .expect(HttpStatus.NO_CONTENT)
      .expect(({ noContent }) => {
        expect(noContent).toBe(true);
      });

    backup.restore();
  });

  it('require to be authenticated to remove an article', async () => {
    await request(app.getHttpServer())
      .delete('/articles/31a10506-c334-4841-97a6-144a55bf4ebb')
      .expect(HttpStatus.UNAUTHORIZED)
      .expect(unauthorizedError);
  });

  it('allow only the author to remove an article', async () => {
    await request(app.getHttpServer())
      .delete('/articles/a832e632-0335-4191-8469-4d849bbb72be')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(HttpStatus.FORBIDDEN)
      .expect(forbiddenError);
  });

  it('add a new comment to an article', async () => {
    const data = createCommentFactory.buildOne();

    await request(app.getHttpServer())
      .post('/articles/a832e632-0335-4191-8469-4d849bbb72be/comments')
      .set('Authorization', `Bearer ${jwt}`)
      .send(data)
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          article: expect.stringMatching(uuidRegex),
          author: expect.anything(),
          body: data.body,
          createdAt: expect.stringMatching(isoDateRegex),
          id: expect.stringMatching(uuidRegex),
          updatedAt: expect.stringMatching(isoDateRegex),
        });
      });
  });

  it('validate the creation of a new comment', async () => {
    const data = {};

    await request(app.getHttpServer())
      .post('/articles/00000000-0000-0000-0000-000000000000/comments')
      .set('Authorization', `Bearer ${jwt}`)
      .send(data)
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          error: 'Unprocessable Entity',
          message: [
            'body should not be null or undefined',
            'body should not be empty',
            'body must be a string',
            'article with id «00000000-0000-0000-0000-000000000000» does not exist',
          ],
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      });
  });

  it('require to be authenticated to add a new comment to an article', async () => {
    const data = createCommentFactory.buildOne();

    await request(app.getHttpServer())
      .post('/articles/a832e632-0335-4191-8469-4d849bbb72be/comments')
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect(unauthorizedError);
  });

  it.each([
    { limit: 10, page: 1 },
    { limit: 5, page: 3 },
    { page: 2 },
    { limit: 20 },
  ])('paginate all of the comment by %O', async (query) => {
    const defaultLimit = 10;
    const totalItems = 15;
    const currentPage = query.page ?? 1;
    const itemsPerPage = query.limit ?? defaultLimit;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    await request(app.getHttpServer())
      .get('/articles/31a10506-c334-4841-97a6-144a55bf4ebb/comments')
      .query(query)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toHaveProperty(
          'items',
          expect.arrayContaining([expect.any(Object)]),
        );
        expect(body).toHaveProperty(
          'meta',
          expect.objectContaining({
            currentPage,
            itemCount: expect.any(Number),
            itemsPerPage,
            totalItems,
            totalPages,
          }),
        );
      });
  });

  it('remove a comment from an article', async () => {
    const backup = database.backup();

    await request(app.getHttpServer())
      .delete(
        '/articles/a832e632-0335-4191-8469-4d849bbb72be/comments/9395e782-367b-4487-a048-242e37169109',
      )
      .set('Authorization', `Bearer ${jwt}`)
      .expect(HttpStatus.NO_CONTENT);

    backup.restore();
  });

  it('require to be authenticated to remove a comment from an article', async () => {
    const backup = database.backup();

    await request(app.getHttpServer())
      .delete(
        '/articles/a832e632-0335-4191-8469-4d849bbb72be/comments/9395e782-367b-4487-a048-242e37169109',
      )
      .expect(HttpStatus.UNAUTHORIZED)
      .expect(unauthorizedError);

    backup.restore();
  });

  it('allow only the author to remove a comment from an article', async () => {
    const backup = database.backup();

    await request(app.getHttpServer())
      .delete(
        '/articles/a832e632-0335-4191-8469-4d849bbb72be/comments/2cce7079-b434-42fb-85e3-8d1aadd7bb8a',
      )
      .set('Authorization', `Bearer ${jwt}`)
      .expect(HttpStatus.FORBIDDEN)
      .expect({
        error: 'Forbidden',
        message: 'You are not the author of the comment',
        statusCode: HttpStatus.FORBIDDEN,
      });

    backup.restore();
  });
});
