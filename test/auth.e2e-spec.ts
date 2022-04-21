import { HttpStatus } from '@nestjs/common';
import { request, spec } from 'pactum';

import { registerFixture } from '@/auth/fixtures/user.fixture';
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
    const data = {};

    await spec()
      .post('/auth/register')
      .withBody(data)
      .expectStatus(HttpStatus.UNPROCESSABLE_ENTITY)
      .expectJsonLike({
        error: 'Unprocessable Entity',
        message: 'Array.isArray($V) ',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
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
});
