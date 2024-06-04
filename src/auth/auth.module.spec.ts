import { type INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AuthModule } from '~auth/auth.module';
import { TOKEN_COOKIE_NAME } from '~auth/constants';
import { type User } from '~auth/entities/user.entity';
import { loginUserFactory } from '~auth/factories/login-user.factory';
import { registerUserFactory } from '~auth/factories/register-user.factory';
import { updateUserFactory } from '~auth/factories/update-user.factory';
import { login as credentials } from '~auth/fixtures/credentials';
import { AuthenticationService } from '~auth/services/authentication.service';
import { buildTestApplication } from '~common/build-test-application';
import { database } from '~common/database';
import { isoDateRegex, uuidRegex } from '~common/test-matchers';
import request, { agent } from 'supertest';
import { runSeeders } from 'typeorm-extension';

const unprocessableError = {
  error: 'Unprocessable Entity',
  message: expect.arrayContaining([expect.any(String)]),
  statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
};
// eslint-disable-next-line security/detect-non-literal-regexp
const cookieRegex = new RegExp(`${TOKEN_COOKIE_NAME}=`, 'iu');

describe('Auth module', () => {
  const password = credentials.password;
  let app: INestApplication;
  let user: User;
  let jwt: string;

  beforeAll(async () => {
    app = await buildTestApplication(AuthModule);
    const jwtService = app.get(JwtService);
    const authenticationService = app.get(AuthenticationService);
    const dataSource = app.get(getDataSourceToken());
    user = await authenticationService.register(
      registerUserFactory.buildOne({ password }),
    );
    jwt = jwtService.sign({ sub: user.id });
    await runSeeders(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('register a new user', async () => {
    const data = registerUserFactory.buildOne();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(data)
      .expect(HttpStatus.CREATED)
      .expect('set-cookie', cookieRegex)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          bio: '',
          createdAt: expect.stringMatching(isoDateRegex),
          email: data.email,
          id: expect.stringMatching(uuidRegex),
          image: '',
          updatedAt: expect.stringMatching(isoDateRegex),
          username: data.username,
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
        expect(body).toMatchObject(unprocessableError);
      });
  });

  it('avoid to register a duplicate user', async () => {
    const data = registerUserFactory.buildOne({
      email: user.email,
      username: user.username,
    });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(data)
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          error: 'Unprocessable Entity',
          message: [
            `email «${user.email}» is already registered`,
            `username «${user.username}» is already registered`,
          ],
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      });
  });

  it('login an existing user', async () => {
    const data = {
      password,
      username: user.username,
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(HttpStatus.OK)
      .expect('set-cookie', cookieRegex)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          bio: user.bio,
          createdAt: expect.stringMatching(isoDateRegex),
          email: user.email,
          id: user.id,
          image: user.image,
          updatedAt: expect.stringMatching(isoDateRegex),
          username: user.username,
        });
      });
  });

  it('validate the login data', async () => {
    const data = loginUserFactory.buildOne();

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .expect(({ body }) => {
        expect(body).toMatchObject(unprocessableError);
      });
  });

  it('validate the login credentials', async () => {
    const data = loginUserFactory.buildOne({ username: user.username });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .expect(({ body }) => {
        expect(body).toMatchObject(unprocessableError);
      });
  });

  it('get current authenticated user', async () => {
    const client = agent(app.getHttpServer());

    await client
      .post('/auth/login')
      .send({ password, username: user.username })
      .expect(HttpStatus.OK)
      .expect('set-cookie', cookieRegex);

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

  it('update current user info', async () => {
    const data = updateUserFactory.buildOne({ password });
    const backup = database.backup();

    await request(app.getHttpServer())
      .patch('/auth/me')
      .set('Authorization', `Bearer ${jwt}`)
      .send(data)
      .expect(HttpStatus.OK)
      .expect(({ body, headers }) => {
        expect(headers).not.toHaveProperty('set-cookie');

        expect(body).toHaveProperty('email', data.email);
        expect(body).toHaveProperty('username', data.username);
        expect(body).toHaveProperty('bio', data.bio);
        expect(body).toHaveProperty('image', data.image);
        expect(body).not.toHaveProperty('password');
      });

    backup.restore();
  });

  it.each([
    /* wrong current password */
    { password: 'ji32k7au4a83' },
    /* email is already used by another user */
    { email: 'jane@doe.me' },
    /* username is already used by another user */
    { username: 'jane-doe' },
    /* wrong url due its protocol */
    { image: 'ftp://localhost/avatar.png' },
  ])('validate the update of current user', async (override) => {
    const data = updateUserFactory.buildOne(override);

    await request(app.getHttpServer())
      .patch('/auth/me')
      .set('Authorization', `Bearer ${jwt}`)
      .send(data)
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .expect(({ body }) => {
        expect(body).toMatchObject(unprocessableError);
      });
  });

  it("should not overrite user's password accidentally", async () => {
    const data = {
      image: 'https://thispersondoesnotexist.com/image',
      password: 'ji32k7au4a83',
    };
    const client = agent(app.getHttpServer());

    await client
      .post('/auth/login')
      .send({ password, username: user.username })
      .expect(HttpStatus.OK)
      .expect('set-cookie', cookieRegex);

    await client
      .patch('/auth/me')
      .send(data)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toHaveProperty('image', data.image);
      });

    await client
      .post('/auth/login')
      .send({ password: data.password, username: user.username })
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .expect(({ body }) => {
        expect(body).toEqual({
          error: 'Unprocessable Entity',
          message: ['password is incorrect'],
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      });

    await client
      .post('/auth/login')
      .send({ password, username: user.username })
      .expect(HttpStatus.OK);

    await client
      .get('/auth/me')
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toHaveProperty('image', data.image);
      });
  });

  it("fail to update current user when it's unauthenticated", async () => {
    const data = updateUserFactory.buildOne();

    await request(app.getHttpServer())
      .patch('/auth/me')
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect(({ body }) => {
        expect(body).toEqual({
          message: 'Unauthorized',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      });
  });
});
