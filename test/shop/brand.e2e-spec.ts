// cSpell:ignore Lqsg, RGOCEFQ
import { HttpStatus } from '@nestjs/common';
import { e2e, spec } from 'pactum';

import { login as credentials } from '~auth/fixtures/credentials';
import { isoDateRegex, unauthorizedError } from '~common/test-matchers';
import { createBrandFactory } from '~shop/factories/create-brand.factory';

const notFoundError = {
  error: 'Not Found',
  message: /The brand with id brand_.+/,
  statusCode: HttpStatus.NOT_FOUND,
};

describe('BrandController (e2e)', () => {
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

  it('create a new brand', async () => {
    const data = createBrandFactory.buildOne();

    await testCase
      .step('Create brand')
      .spec()
      .post('/brands')
      .withHeaders('Cookie', tokenCookie)
      .withJson(data)
      .expectStatus(HttpStatus.CREATED)
      .expectJsonLike({
        id: /brand_[\dA-Za-z]{24}/,
        name: data.name,
        createdAt: isoDateRegex,
        updatedAt: isoDateRegex,
        // eslint-disable-next-line unicorn/no-null
        deletedAt: null,
      })
      .stores('brand', '.')
      .clean()
      .delete('/brands/{id}')
      .withPathParams('id', '$S{brand.id}')
      .withHeaders('Cookie', tokenCookie)
      .expectStatus(HttpStatus.OK);
  });

  it('require authentication to create a brand', async () => {
    const data = createBrandFactory.buildOne();

    await spec()
      .post('/brands')
      .withBody(data)
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson(unauthorizedError);
  });

  it('get a brand by id', async () => {
    await testCase
      .step('Get brand')
      .spec()
      .get('/brands/{id}')
      .withPathParams('id', '$S{brand.id}')
      .expectStatus(HttpStatus.OK)
      .expectJsonLike({
        id: '$S{brand.id}',
        name: '$S{brand.name}',
        createdAt: isoDateRegex,
        updatedAt: isoDateRegex,
        // eslint-disable-next-line unicorn/no-null
        deletedAt: null,
      });
  });

  it('fail to get when the brand does not exist', async () => {
    await spec()
      .get('/brands/brand_zhKnPnRo6tLqsgRGOCEFQsdb')
      .expectStatus(HttpStatus.NOT_FOUND)
      .expectJsonLike(notFoundError);
  });

  it('get all brands', async () => {
    await spec()
      .get('/brands')
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

  it('update a brand', async () => {
    const data = createBrandFactory.buildOne();

    await testCase
      .step('Update brand')
      .spec()
      .patch('/brands/{id}')
      .withPathParams('id', '$S{brand.id}')
      .withHeaders('Cookie', tokenCookie)
      .withJson(data)
      .expectStatus(HttpStatus.OK)
      .expectJsonLike({
        id: '$S{brand.id}',
        name: data.name,
        createdAt: isoDateRegex,
        updatedAt: isoDateRegex,
        // eslint-disable-next-line unicorn/no-null
        deletedAt: null,
      })
      .stores('brand', '.');
  });

  it('require authentication to update a brand', async () => {
    const data = createBrandFactory.buildOne();

    await spec()
      .patch('/brands/{id}')
      .withPathParams('id', '$S{brand.id}')
      .withJson(data)
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson(unauthorizedError);
  });

  it('fail to update when the brand does not exist', async () => {
    const data = createBrandFactory.buildOne();

    await spec()
      .patch('/brands/brand_ZhKnPnRo6tLqsgRGOCEFQsdb')
      .withHeaders('Cookie', tokenCookie)
      .withJson(data)
      .expectStatus(HttpStatus.NOT_FOUND)
      .expectJsonLike(notFoundError);
  });

  it('require authentication to delete a brand', async () => {
    await spec()
      .delete('/brands/{id}')
      .withPathParams('id', '$S{brand.id}')
      .expectStatus(HttpStatus.UNAUTHORIZED)
      .expectJson(unauthorizedError);
  });

  it('fail to delete when the brand does not exist', async () => {
    await spec()
      .delete('/brands/brand_ZhKnPnRo6tLqsgRGOCEFQsdb')
      .withHeaders('Cookie', tokenCookie)
      .expectStatus(HttpStatus.NOT_FOUND)
      .expectJsonLike(notFoundError);
  });
});
