import { HttpStatus } from '@nestjs/common';
import { TOKEN_COOKIE_NAME } from '~auth/constants';
import { loginUserFactory } from '~auth/factories/login-user.factory';
import { registerUserFactory } from '~auth/factories/register-user.factory';
import { updateUserFactory } from '~auth/factories/update-user.factory';
import { register as credentials } from '~auth/fixtures/credentials';
import { isoDateRegex, uuidRegex } from '~common/test-matchers';
import { spec } from 'pactum';

describe('AuthController (e2e)', () => {
  let tokenCookie: string;

  beforeEach(async () => {
    tokenCookie = await spec()
      .post('/auth/login')
      .withBody(credentials)
      .returns(({ res }) => res.headers['set-cookie'])
      .toss();
  });

  it('register a new user', async () => {
    const data = registerUserFactory.buildOne();

    await spec()
      .post('/auth/register')
      .withBody(data)
      .expectStatus(HttpStatus.CREATED)
      .expectCookiesLike({
        HttpOnly: null,

        SameSite: 'Strict',
        [TOKEN_COOKIE_NAME]: 'typeof $V === "string"',
      })
      .expectJsonLike({
        bio: '',
        createdAt: isoDateRegex,
        email: data.email,
        id: uuidRegex,
        image: '',
        updatedAt: isoDateRegex,
        username: data.username,
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
    const data = registerUserFactory.buildOne({
      email: credentials.email,
      username: credentials.username,
    });

    await spec()
      .post('/auth/register')
      .withBody(data)
      .expectStatus(HttpStatus.UNPROCESSABLE_ENTITY)
      .expectJsonLike({
        error: 'Unprocessable Entity',
        message: [
          `email «${credentials.email}» is already registered`,
          `username «${credentials.username}» is already registered`,
        ],
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
      .toss();
  });

  it('login an existing user', async () => {
    await spec()
      .post('/auth/login')
      .withBody(credentials)
      .expectStatus(HttpStatus.OK)
      .expectCookiesLike({
        HttpOnly: null,

        SameSite: 'Strict',
        [TOKEN_COOKIE_NAME]: 'typeof $V === "string"',
      })
      .expectJsonLike({
        bio: 'typeof $V === "string"',
        createdAt: isoDateRegex,
        email: credentials.email,
        id: uuidRegex,
        image: 'typeof $V === "string"',
        updatedAt: isoDateRegex,
        username: credentials.username,
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
    const data = loginUserFactory.buildOne({
      username: credentials.username,
    });

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
          bio: expect.any(String),
          createdAt: expect.stringMatching(isoDateRegex),
          email: credentials.email,
          id: expect.stringMatching(uuidRegex),
          image: expect.any(String),
          updatedAt: expect.stringMatching(isoDateRegex),
          username: credentials.username,
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
    const data = updateUserFactory.buildOne({
      ...credentials,
      newPassword: credentials.password,
    });

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
    const data = updateUserFactory.buildOne(override);

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
    const data = updateUserFactory.buildOne();

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
