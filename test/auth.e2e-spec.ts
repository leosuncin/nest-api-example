import { HttpStatus } from '@nestjs/common';
import { request, spec } from 'pactum';

import { loginFixture, registerFixture } from '@/auth/fixtures/auth.fixture';
import { isoDateRegex, uuidRegex } from '@/common/test-helpers';

describe('AuthController (e2e)', () => {
  const user = {
    email: 'john@doe.me',
    username: 'john-doe',
  };

  beforeAll(() => {
    request.setBaseUrl('http://localhost:3000');
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
      email: user.email,
      username: user.username,
    }).execute();

    await spec()
      .post('/auth/register')
      .withBody(data)
      .expectStatus(HttpStatus.UNPROCESSABLE_ENTITY)
      .expectJsonLike({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: [
          `email «${user.email}» is already registered`,
          `username «${user.username}» is already registered`,
        ],
        error: 'Unprocessable Entity',
      })
      .toss();
  });

  it('login an existing user', async () => {
    const data = {
      username: user.username,
      password: 'Th€Pa$$w0rd!',
    };

    await spec()
      .post('/auth/login')
      .withBody(data)
      .expectStatus(HttpStatus.OK)
      .expectCookiesLike({
        token: 'typeof $V === "string"',
        // eslint-disable-next-line unicorn/no-null
        HttpOnly: null,
        SameSite: 'Strict',
      })
      .expectJsonLike({
        email: user.email,
        username: user.username,
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
    const data = await loginFixture({ username: user.username }).execute();

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
});
