import { HttpStatus } from '@nestjs/common';
import { e2e, spec } from 'pactum';

import { login as credentials } from '~auth/fixtures/credentials';
import { createCommentFactory } from '~blog/factories/create-comment.factory';
import { articleByJohn } from '~blog/fixtures/articles';
import {
  commentByJaneOnArticleByJohn,
  commentByJohnOnArticleByJane,
} from '~blog/fixtures/comments';
import {
  forbiddenError,
  isoDateRegex,
  unauthorizedError,
  uuidRegex,
} from '~common/test-matchers';

describe('CommentController (e2e)', () => {
  const testCase = e2e('Comment CRUD');
  const articleId = articleByJohn.id;
  let tokenCookie: string;

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
    const data = createCommentFactory.buildOne();

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
      .clean()
      .delete('/articles/{articleId}/comments/{commentId}')
      .withPathParams('articleId', articleId)
      .withPathParams('commentId', '$S{comment.id}')
      .withHeaders('Cookie', tokenCookie)
      .expectStatus(HttpStatus.NO_CONTENT)
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
    const data = createCommentFactory.buildOne();

    await spec()
      .post('/articles/{articleId}/comments')
      .withPathParams('articleId', articleId)
      .withJson(data)
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson(unauthorizedError)
      .toss();
  });

  it.each([
    { limit: 10, page: 1 },
    { limit: 5, page: 3 },
    { page: 2 },
    { limit: 20 },
  ])('paginate all of the comment by %O', async (query) => {
    const currentPage = query.page ?? 1;
    const itemsPerPage = query.limit ?? 10;

    await spec()
      .get('/articles/{articleId}/comments')
      .withPathParams('articleId', articleId)
      .withQueryParams(query)
      .expectStatus(HttpStatus.OK)
      .expect(({ res: { body } }) => {
        expect(body).toHaveProperty(
          'items',
          expect.arrayContaining([expect.any(Object)]),
        );
        expect(body).toHaveProperty(
          'meta',
          expect.objectContaining({
            currentPage,
            itemCount: expect.any(Number),
            itemsPerPage,
            totalItems: expect.any(Number),
            totalPages: expect.any(Number),
          }),
        );
      })
      .toss();
  });

  it('require to be authenticated to remove a comment from an article', async () => {
    await spec()
      .delete(
        `/articles/${articleId}/comments/${commentByJohnOnArticleByJane.id}`,
      )
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson(unauthorizedError)
      .toss();
  });

  it('allow only the author to remove a comment from an article', async () => {
    await spec()
      .delete(
        `/articles/${articleId}/comments/${commentByJaneOnArticleByJohn.id}`,
      )
      .withHeaders('Cookie', tokenCookie)
      .expectStatus(HttpStatus.FORBIDDEN)
      .expectJson(forbiddenError)
      .toss();
  });
});
