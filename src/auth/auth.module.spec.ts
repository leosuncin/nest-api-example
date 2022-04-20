import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/typeorm';
import request from 'supertest';

import { AuthModule } from '@/auth/auth.module';
import type { User } from '@/auth/entities/user.entity';
import { registerFixture, userFixture } from '@/auth/fixtures/user.fixture';
import {
  buildTestApplication,
  isoDateRegex,
  uuidRegex,
} from '@/common/test-helpers';

describe('Auth module', () => {
  let app: INestApplication;
  let user: User;

  beforeAll(async () => {
    app = await buildTestApplication(AuthModule);
    user = await userFixture().execute({
      orm: { connection: app.get(getConnectionToken()) },
    });
  });

  it('register a new user', async () => {
    const data = await registerFixture().execute();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(data)
      .expect(HttpStatus.CREATED)
      .expect('set-cookie', /token=/)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          email: data.email,
          username: data.username,
          image: '',
          bio: '',
          id: expect.stringMatching(uuidRegex),
          createdAt: expect.stringMatching(isoDateRegex),
          updatedAt: expect.stringMatching(isoDateRegex),
        });
      });
  });

  it('validate the register data', async () => {
    const data = {};

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(data)
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          error: 'Unprocessable Entity',
          message: expect.arrayContaining([expect.any(String)]),
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      });
  });

  it('avoid to register a duplicate user', async () => {
    const data = await registerFixture({
      email: user.email,
      username: user.username,
    }).execute();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(data)
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: [
            `email «${user.email}» is already registered`,
            `username «${user.username}» is already registered`,
          ],
          error: 'Unprocessable Entity',
        });
      });
  });
});
