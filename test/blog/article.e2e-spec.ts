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
});
