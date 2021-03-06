import { HttpStatus } from '@nestjs/common';
import { request, spec } from 'pactum';

import {
  loginFixture,
  registerFixture,
  updateFixture,
} from '@/auth/fixtures/auth.fixture';
import { isoDateRegex, uuidRegex } from '@/common/test-helpers';

describe('AuthController (e2e)', () => {
  const credentials = {
    email: 'john@doe.me',
    username: 'john-doe',
    password: 'Th€Pa$$w0rd!',
  };
  let tokenCookie: string;

  beforeAll(() => {
    request.setBaseUrl('http://localhost:3000');
  });

  beforeEach(async () => {
    tokenCookie = await spec()
      .post('/auth/login')
      .withBody(credentials)
      .returns(({ res }) => res.headers['set-cookie'])
      .toss();
  });

  it('register a new user', async () => {
    const data = await registerFixture().execute();

    await spec()
      .post('/auth/register')
      .withBody(data)
      .expectStatus(HttpStatus.CREATED)
      .expectCookiesLike({
        token: 'typeof $V === "string"',
        // eslint-disable-next-line unicorn/no-null
        HttpOnly: null,
        SameSite: 'Strict',
      })
      .expectJsonLike({
        email: data.email,
        username: data.username,
        image: '',
        bio: '',
        id: uuidRegex,
        createdAt: isoDateRegex,
        updatedAt: isoDateRegex,
      })
      .toss();
  });

  it('validate the register data', async () => {
    await spec()
      .name('register-errors')
      .post('/auth/register')
      .withBody({})
      .expectStatus(HttpStatus.UNPROCESSABLE_ENTITY)
      .expectJsonSnapshot()
      .toss();
  });

  it('avoid to register a duplicate user', async () => {
    const data = await registerFixture({
      email: credentials.email,
      username: credentials.username,
    }).execute();

    await spec()
      .post('/auth/register')
      .withBody(data)
      .expectStatus(HttpStatus.UNPROCESSABLE_ENTITY)
      .expectJsonLike({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: [
          `email «${credentials.email}» is already registered`,
          `username «${credentials.username}» is already registered`,
        ],
        error: 'Unprocessable Entity',
      })
      .toss();
  });

  it('login an existing user', async () => {
    await spec()
      .post('/auth/login')
      .withBody(credentials)
      .expectStatus(HttpStatus.OK)
      .expectCookiesLike({
        token: 'typeof $V === "string"',
        // eslint-disable-next-line unicorn/no-null
        HttpOnly: null,
        SameSite: 'Strict',
      })
      .expectJsonLike({
        email: credentials.email,
        username: credentials.username,
        image: 'typeof $V === "string"',
        bio: 'typeof $V === "string"',
        id: uuidRegex,
        createdAt: isoDateRegex,
        updatedAt: isoDateRegex,
      })
      .toss();
  });

  it('validate the login data', async () => {
    await spec()
      .name('login-errors')
      .post('/auth/login')
      .withBody({})
      .expectStatus(HttpStatus.UNPROCESSABLE_ENTITY)
      .expectJsonSnapshot()
      .toss();
  });

  it('validate the login credentials', async () => {
    const data = await loginFixture({
      username: credentials.username,
    }).execute();

    await spec()
      .post('/auth/login')
      .withBody(data)
      .expectStatus(HttpStatus.UNPROCESSABLE_ENTITY)
      .expectJsonLike({
        error: 'Unprocessable Entity',
        message: ['password is incorrect'],
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
      .toss();
  });

  it('get current authenticated user', async () => {
    await spec()
      .get('/auth/me')
      .withHeaders('Cookie', tokenCookie)
      .expectStatus(HttpStatus.OK)
      .expect(({ res }) => {
        expect(res.headers).not.toHaveProperty('set-cookie');

        expect(res.json).toMatchObject({
          email: credentials.email,
          username: credentials.username,
          image: expect.any(String),
          bio: expect.any(String),
          id: expect.stringMatching(uuidRegex),
          createdAt: expect.stringMatching(isoDateRegex),
          updatedAt: expect.stringMatching(isoDateRegex),
        });
      })
      .toss();
  });

  it("fail to get current user when it's unauthenticated", async () => {
    await spec()
      .get('/auth/me')
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson({
        message: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED,
      })
      .toss();
  });

  it('update current user info', async () => {
    const data = await updateFixture({
      ...credentials,
      newPassword: credentials.password,
    }).execute();

    await spec()
      .patch('/auth/me')
      .withHeaders('Cookie', tokenCookie)
      .withBody(data)
      .expectStatus(HttpStatus.OK)
      .expect(({ res }) => {
        expect(res.headers).not.toHaveProperty('set-cookie');

        expect(res.body).toHaveProperty('bio', data.bio);
        expect(res.body).toHaveProperty('image', data.image);
        expect(res.body).not.toHaveProperty('password');
      })
      .toss();
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
    const data = await updateFixture(override).execute();

    await spec()
      .patch('/auth/me')
      .withHeaders('Cookie', tokenCookie)
      .withBody(data)
      .expectStatus(HttpStatus.UNPROCESSABLE_ENTITY)
      .expectJsonLike({
        error: 'Unprocessable Entity',
        message: 'Array.isArray($V)',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
      .toss();
  });

  it("fail to update current user when it's unauthenticated", async () => {
    const data = await updateFixture().execute();

    await spec()
      .patch('/auth/me')
      .withBody(data)
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson({
        message: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED,
      })
      .toss();
  });
});
