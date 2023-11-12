// cSpell:ignore Gdil
import { HttpStatus } from '@nestjs/common';
import { e2e, spec } from 'pactum';

import { login as credentials } from '~auth/fixtures/credentials';
import { isoDateRegex, unauthorizedError } from '~common/test-matchers';
import { createCategoryFactory } from '~shop/factories/create-category.factory';

const notFoundError = {
  error: 'Not Found',
  message: /The category with id category_.+/,
  statusCode: HttpStatus.NOT_FOUND,
};

describe('CategoryController (e2e)', () => {
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

  it('create a new category', async () => {
    const data = createCategoryFactory.buildOne();

    await testCase
      .step('Create category')
      .spec()
      .post('/categories')
      .withHeaders('Cookie', tokenCookie)
      .withJson(data)
      .expectStatus(HttpStatus.CREATED)
      .expectJsonLike({
        id: /category_[\dA-Za-z]{24}/,
        name: data.name,
        createdAt: isoDateRegex,
        updatedAt: isoDateRegex,
        // eslint-disable-next-line unicorn/no-null
        deletedAt: null,
      })
      .stores('category', '.')
      .clean()
      .delete('/categories/{id}')
      .withPathParams('id', '$S{category.id}')
      .withHeaders('Cookie', tokenCookie)
      .expectStatus(HttpStatus.OK);
  });

  it('require authentication to create a category', async () => {
    const data = createCategoryFactory.buildOne();

    await spec()
      .post('/categories')
      .withBody(data)
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson(unauthorizedError);
  });

  it('get a category by id', async () => {
    await testCase
      .step('Get category')
      .spec()
      .get('/categories/{id}')
      .withPathParams('id', '$S{category.id}')
      .expectStatus(HttpStatus.OK)
      .expectJsonLike({
        id: '$S{category.id}',
        name: '$S{category.name}',
        createdAt: isoDateRegex,
        updatedAt: isoDateRegex,
        // eslint-disable-next-line unicorn/no-null
        deletedAt: null,
      });
  });

  it('fail to get when the category does not exist', async () => {
    await spec()
      .get('/categories/category_YYGdil9vC88Zv55cTWc2TuXk')
      .expectStatus(HttpStatus.NOT_FOUND)
      .expectJsonLike(notFoundError);
  });

  it('get all categories', async () => {
    await spec()
      .get('/categories')
      .expectStatus(HttpStatus.OK)
      .expect(({ res: { body } }) => {
        expect(body).toHaveProperty(
          'items',
          expect.arrayContaining([expect.any(Object)]),
        );
        expect(body).toHaveProperty(
          'meta',
          expect.objectContaining({
            currentPage: 1,
            itemCount: expect.any(Number),
            itemsPerPage: 10,
            totalItems: expect.any(Number),
            totalPages: expect.any(Number),
          }),
        );
      });
  });

  it('update a category', async () => {
    const data = createCategoryFactory.buildOne();

    await testCase
      .step('Update category')
      .spec()
      .patch('/categories/{id}')
      .withPathParams('id', '$S{category.id}')
      .withHeaders('Cookie', tokenCookie)
      .withJson(data)
      .expectStatus(HttpStatus.OK)
      .expectJsonLike({
        id: '$S{category.id}',
        name: data.name,
        createdAt: isoDateRegex,
        updatedAt: isoDateRegex,
        // eslint-disable-next-line unicorn/no-null
        deletedAt: null,
      })
      .stores('category', '.');
  });

  it('require authentication to update a category', async () => {
    const data = createCategoryFactory.buildOne();

    await spec()
      .patch('/categories/{id}')
      .withPathParams('id', '$S{category.id}')
      .withJson(data)
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson(unauthorizedError);
  });

  it('fail to update when the category does not exist', async () => {
    const data = createCategoryFactory.buildOne();

    await spec()
      .patch('/categories/category_YYGdil9vC88Zv55cTWc2TuXk')
      .withHeaders('Cookie', tokenCookie)
      .withJson(data)
      .expectStatus(HttpStatus.NOT_FOUND)
      .expectJsonLike(notFoundError);
  });

  it('require authentication to delete a category', async () => {
    await spec()
      .delete('/categories/{id}')
      .withPathParams('id', '$S{category.id}')
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson(unauthorizedError);
  });

  it('fail to delete when the category does not exist', async () => {
    await spec()
      .delete('/categories/category_YYGdil9vC88Zv55cTWc2TuXk')
      .withHeaders('Cookie', tokenCookie)
      .expectStatus(HttpStatus.NOT_FOUND)
      .expectJsonLike(notFoundError);
  });
});
