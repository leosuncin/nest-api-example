import { HttpStatus } from '@nestjs/common';
import { request, spec } from 'pactum';

import { createArticleFixture } from '@/blog/fixtures/article.fixture';
import { isoDateRegex, uuidRegex } from '@/common/test-helpers';

const credentials = {
  username: 'john-doe',
  password: 'Th€Pa$$w0rd!',
};

describe('ArticleController (e2e)', () => {
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

  it('create a new article', async () => {
    const data = await createArticleFixture().execute();

    await spec()
      .post('/articles')
      .withHeaders('Cookie', tokenCookie)
      .withBody(data)
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
      .toss();
  });

  it('require to be authenticated to create a new article', async () => {
    const data = await createArticleFixture().execute();

    await spec()
      .post('/articles')
      .withBody(data)
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson({
        message: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED,
      })
      .toss();
  });

  it.each([
    'a832e632-0335-4191-8469-4d849bbb72be',
    'however-wolfs-have-begun-to-rent-blueberries-over-the-past-few-months-specifically-for-lions-associated-with-their-puppies-mLDYhAjz213rjfHRJwqUES',
    'mLDYhAjz213rjfHRJwqUES',
  ])('get one article by id "%s"', async (id) => {
    await spec()
      .get(`/articles/${id}`)
      .expectStatus(HttpStatus.OK)
      .expectJsonLike({
        author: 'typeof $V === "object"',
        content: 'typeof $V === "string"',
        createdAt: isoDateRegex,
        id: 'a832e632-0335-4191-8469-4d849bbb72be',
        slug: 'however-wolfs-have-begun-to-rent-blueberries-over-the-past-few-months-specifically-for-lions-associated-with-their-puppies-mLDYhAjz213rjfHRJwqUES',
        title:
          'However, wolfs have begun to rent blueberries over the past few months, specifically for lions associated with their puppies?',
        updatedAt: isoDateRegex,
      })
      .toss();
  });

  it("fail to get an article when it doesn't exist", async () => {
    await spec()
      .get('/articles/not-exists-ert')
      .expectStatus(HttpStatus.NOT_FOUND)
      .expectJson({
        error: 'Not Found',
        message: 'The article was not found',
        statusCode: HttpStatus.NOT_FOUND,
      })
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
});
