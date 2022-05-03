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
});
