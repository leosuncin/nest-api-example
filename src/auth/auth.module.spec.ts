import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getConnectionToken } from '@nestjs/typeorm';
import request, { agent } from 'supertest';

import { AuthModule } from '@/auth/auth.module';
import type { User } from '@/auth/entities/user.entity';
import { loginFixture, registerFixture } from '@/auth/fixtures/auth.fixture';
import { userFixture } from '@/auth/fixtures/user.fixture';
import {
  buildTestApplication,
  isoDateRegex,
  uuidRegex,
} from '@/common/test-helpers';

describe('Auth module', () => {
  let app: INestApplication;
  let user: User;
  let jwt: string;

  beforeAll(async () => {
    app = await buildTestApplication(AuthModule);
    user = await userFixture({ password: 'Th€Pa$$w0rd!' }).execute({
      orm: { connection: app.get(getConnectionToken()) },
    });
    const jwtService = app.get(JwtService);
    jwt = jwtService.sign({ sub: user.id });
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

  it('login an existing user', async () => {
    const data = {
      username: user.username,
      password: 'Th€Pa$$w0rd!',
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(HttpStatus.OK)
      .expect('set-cookie', /token=/)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          email: user.email,
          username: user.username,
          image: user.image,
          bio: user.bio,
          id: user.id,
          createdAt: expect.stringMatching(isoDateRegex),
          updatedAt: expect.stringMatching(isoDateRegex),
        });
      });
  });

  it('validate the login data', async () => {
    const data = await loginFixture().execute();

    await request(app.getHttpServer())
      .post('/auth/login')
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

  it('validate the login credentials', async () => {
    const data = await loginFixture({ username: user.username }).execute();

    await request(app.getHttpServer())
      .post('/auth/login')
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

  it('get current authenticated user', async () => {
    const client = agent(app.getHttpServer());

    await client
      .post('/auth/login')
      .send({ username: user.username, password: 'Th€Pa$$w0rd!' })
      .expect(HttpStatus.OK)
      .expect('set-cookie', /token=/);

    await client
      .get('/auth/me')
      .expect(HttpStatus.OK)
      .expect(({ body, headers }) => {
        expect(headers).not.toHaveProperty('set-cookie');

        expect(body).toHaveProperty('id', user.id);
        expect(body).toHaveProperty('email', user.email);
        expect(body).toHaveProperty('username', user.username);
        expect(body).toHaveProperty('image', user.image);
        expect(body).toHaveProperty('bio', user.bio);
        expect(body).not.toHaveProperty('password');
        expect(body).toHaveProperty(
          'createdAt',
          expect.stringMatching(isoDateRegex),
        );
        expect(body).toHaveProperty(
          'updatedAt',
          expect.stringMatching(isoDateRegex),
        );
      });
  });

  it('get current user from JWT', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(HttpStatus.OK)
      .expect(({ body, headers }) => {
        expect(headers).not.toHaveProperty('set-cookie');

        expect(body).toHaveProperty('id', user.id);
        expect(body).toHaveProperty('email', user.email);
        expect(body).toHaveProperty('username', user.username);
        expect(body).toHaveProperty('image', user.image);
        expect(body).toHaveProperty('bio', user.bio);
        expect(body).not.toHaveProperty('password');
        expect(body).toHaveProperty(
          'createdAt',
          expect.stringMatching(isoDateRegex),
        );
        expect(body).toHaveProperty(
          'updatedAt',
          expect.stringMatching(isoDateRegex),
        );
      });
  });

  it("fail to get current user when it's unauthenticated", async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .expect(HttpStatus.UNAUTHORIZED)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          message: 'Unauthorized',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      });
  });
});
