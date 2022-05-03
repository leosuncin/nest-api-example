import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getConnectionToken } from '@nestjs/typeorm';
import request from 'supertest';

import { AuthModule } from '@/auth/auth.module';
import { BlogModule } from '@/blog/blog.module';
import { createArticleFixture } from '@/blog/fixtures/article.fixture';
import {
  buildTestApplication,
  isoDateRegex,
  loadFixtures,
  uuidRegex,
} from '@/common/test-helpers';

describe('AuthModule', () => {
  let app: INestApplication;
  let jwt: string;

  beforeAll(async () => {
    app = await buildTestApplication(AuthModule, BlogModule);
    const jwtService = app.get(JwtService);
    const connection = app.get(getConnectionToken());
    jwt = jwtService.sign({ sub: '63770485-6ee9-4a59-b374-3f194091e2e1' });
    await loadFixtures(connection);
  });

  it('create a new article', async () => {
    const data = await createArticleFixture().execute();

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
    const data = await createArticleFixture().execute();

    await request(app.getHttpServer())
      .post('/articles')
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect({
        message: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
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
      .expect({
        error: 'Not Found',
        message: 'The article was not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
  });
});
