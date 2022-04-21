import { HttpStatus } from '@nestjs/common';
import { request, spec } from 'pactum';

describe('AppController (e2e)', () => {
  beforeAll(() => {
    request.setBaseUrl('http://localhost:3000');
  });

  it('/ (GET)', async () => {
    await spec()
      .get('/')
      .expectStatus(HttpStatus.OK)
      .expectBody('Hello World!')
      .toss();
  });
});
