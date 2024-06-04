import { HttpStatus } from '@nestjs/common';
import { spec } from 'pactum';

describe('HealthController (e2e)', () => {
  it('/health (GET)', async () => {
    await spec()
      .get('/health')
      .expectStatus(HttpStatus.OK)
      .expectJson({
        details: {
          database: {
            status: 'up',
          },
          mem_heap: {
            status: 'up',
          },
          mem_rss: {
            status: 'up',
          },
        },
        error: {},
        info: {
          database: {
            status: 'up',
          },
          mem_heap: {
            status: 'up',
          },
          mem_rss: {
            status: 'up',
          },
        },
        status: 'ok',
      })
      .toss();
  });
});
