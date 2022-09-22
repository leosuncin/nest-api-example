import { HttpStatus } from '@nestjs/common';
import { e2e, spec } from 'pactum';

import { login as credentials } from '~auth/fixtures/credentials';
import { createArticleFactory } from '~blog/factories/create-article.factory';
import { updateArticleFactory } from '~blog/factories/update-article.factory';
import { articleByJane, articleByJohn } from '~blog/fixtures/articles';
import { isoDateRegex, uuidRegex } from '~common/test-matchers';

const unauthorizedError = {
  message: 'Unauthorized',
  statusCode: HttpStatus.UNAUTHORIZED,
};
const notFoundError = {
  error: 'Not Found',
  message: 'The article was not found',
  statusCode: HttpStatus.NOT_FOUND,
};
const forbiddenError = {
  error: 'Forbidden',
  message: 'You are not the author of the article',
  statusCode: HttpStatus.FORBIDDEN,
};

describe('ArticleController (e2e)', () => {
  const testCase = e2e('Article CRUD');
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

  it('create a new article', async () => {
    const data = createArticleFactory.buildOne();

    await testCase
      .step('Create article')
      .spec()
      .post('/articles')
      .withHeaders('Cookie', tokenCookie)
      .withJson(data)
      .expectStatus(HttpStatus.CREATED)
      .expectJsonLike({
        author: 'typeof $V === "object"',
        content: data.content,
        createdAt: isoDateRegex,
        id: uuidRegex,
        slug: 'typeof $V === "string"',
        title: data.title,
        updatedAt: isoDateRegex,
      })
      .stores('article', '.')
      .clean()
      .delete('/articles/{id}')
      .withPathParams('id', '$S{article.id}')
      .withHeaders('Cookie', tokenCookie)
      .expectStatus(HttpStatus.NO_CONTENT)
      .toss();
  });

  it('require to be authenticated to create a new article', async () => {
    const data = createArticleFactory.buildOne();

    await spec()
      .post('/articles')
      .withBody(data)
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson(unauthorizedError)
      .toss();
  });

  it.each([articleByJohn.id, articleByJohn.slug, 'mLDYhAjz213rjfHRJwqUES'])(
    'get one article by id "%s"',
    async (id) => {
      await spec()
        .get('/articles/{id}')
        .withPathParams('id', id)
        .expectStatus(HttpStatus.OK)
        .expectJsonLike({
          author: 'typeof $V === "object"',
          content: 'typeof $V === "string"',
          createdAt: isoDateRegex,
          id: articleByJohn.id,
          slug: articleByJohn.slug,
          title: articleByJohn.title,
          updatedAt: isoDateRegex,
        })
        .toss();
    },
  );

  it("fail to get an article when it doesn't exist", async () => {
    await spec()
      .get('/articles/not-exists-ert')
      .expectStatus(HttpStatus.NOT_FOUND)
      .expectJson(notFoundError)
      .toss();
  });

  it.each([
    { limit: 10, page: 1 },
    { limit: 5, page: 3 },
    { page: 2 },
    { limit: 20 },
  ])('paginate all of the articles by %O', async (query) => {
    await spec()
      .get('/articles')
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
            currentPage: query.page ?? 1,
            itemCount: query.limit ?? 10,
            itemsPerPage: query.limit ?? 10,
            totalItems: expect.any(Number),
            totalPages: expect.any(Number),
          }),
        );
        expect((body as Record<'items' | 'meta', unknown>).items).toHaveLength(
          query.limit ?? 10,
        );
      })
      .toss();
  });

  it('validate the pagination query', async () => {
    await spec()
      .get('/articles')
      .withQueryParams({ limit: -10, page: -2 })
      .expectStatus(HttpStatus.UNPROCESSABLE_ENTITY)
      .expectJson({
        error: 'Unprocessable Entity',
        message: [
          'limit must be a positive number',
          'page must be a positive number',
        ],
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
      .toss();
  });

  it.each(['id', 'slug'])('update one article by %s', async (property) => {
    const title = 'Aute pariatur ad sit id nostrud qui est nulla consectetur';
    const data = updateArticleFactory.buildOne({ title });
    const slug: string = title.toLowerCase().replace(/\s+/g, '-');

    await testCase
      .step('Update article')
      .spec()
      .patch('/articles/{id}')
      .withPathParams('id', `$S{article.${property}}`)
      .withHeaders('Cookie', tokenCookie)
      .withBody(data)
      .expectStatus(HttpStatus.OK)
      .expect(({ res: { body } }) => {
        expect(body).toHaveProperty('title', title);
        expect(body).toHaveProperty('slug', expect.stringContaining(slug));
      })
      .stores('article', '.')
      .toss();
  });

  it('require to be authenticated to update an article', async () => {
    const data = updateArticleFactory.buildOne();

    await spec()
      .patch('/articles/{slug}')
      .withPathParams('slug', '$S{article.slug}')
      .withBody(data)
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson(unauthorizedError)
      .toss();
  });

  it('allow only the author to update an article', async () => {
    const data = updateArticleFactory.buildOne();

    await spec()
      .patch(`/articles/${articleByJane.id}`)
      .withHeaders('Cookie', tokenCookie)
      .withBody(data)
      .expectStatus(HttpStatus.FORBIDDEN)
      .expectJson(forbiddenError)
      .toss();
  });

  it('require to be authenticated to remove an article', async () => {
    await spec()
      .delete('/articles/{slug}')
      .withPathParams('slug', '$S{article.slug}')
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson(unauthorizedError)
      .toss();
  });

  it('allow only the author to remove an article', async () => {
    await spec()
      .delete(`/articles/${articleByJane.id}`)
      .withHeaders('Cookie', tokenCookie)
      .expectStatus(HttpStatus.FORBIDDEN)
      .expectJson(forbiddenError)
      .toss();
  });
});
