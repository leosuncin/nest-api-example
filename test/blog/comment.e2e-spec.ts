import { HttpStatus } from '@nestjs/common';
import { e2e, request, spec } from 'pactum';

import { createCommentFixture } from '@/blog/fixtures/comment.fixture';
import { credentials, isoDateRegex, uuidRegex } from '@/common/test-helpers';

const unauthorizedError = {
  message: 'Unauthorized',
  statusCode: HttpStatus.UNAUTHORIZED,
};

describe('CommentController (e2e)', () => {
  const testCase = e2e('Comment CRUD');
  const articleId = 'a832e632-0335-4191-8469-4d849bbb72be';
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

  afterAll(async () => {
    await testCase.cleanup();
  });

  it('add a new comment to an article', async () => {
    const data = await createCommentFixture().execute();

    await testCase
      .step('Create comment')
      .spec()
      .post('/articles/{articleId}/comments')
      .withPathParams('articleId', articleId)
      .withHeaders('Cookie', tokenCookie)
      .withJson(data)
      .expectStatus(HttpStatus.CREATED)
      .expectJsonLike({
        article: uuidRegex,
        author: 'typeof $V === "object"',
        body: data.body,
        createdAt: isoDateRegex,
        id: uuidRegex,
        updatedAt: isoDateRegex,
      })
      .stores('comment', '.')
      .toss();
  });

  it('validate the creation of a new comment', async () => {
    const data = {};

    await spec()
      .post('/articles/00000000-0000-0000-0000-000000000000/comments')
      .withHeaders('Cookie', tokenCookie)
      .withJson(data)
      .expectStatus(HttpStatus.UNPROCESSABLE_ENTITY)
      .expectJson({
        error: 'Unprocessable Entity',
        message: [
          'body should not be null or undefined',
          'body should not be empty',
          'body must be a string',
          'article with id «00000000-0000-0000-0000-000000000000» does not exist',
        ],
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
      .toss();
  });

  it('require to be authenticated to add a new comment to an article', async () => {
    const data = await createCommentFixture().execute();

    await spec()
      .post('/articles/{articleId}/comments')
      .withPathParams('articleId', articleId)
      .withJson(data)
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson(unauthorizedError)
      .toss();
  });
});
