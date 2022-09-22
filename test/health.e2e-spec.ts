import { HttpStatus } from '@nestjs/common';
import { spec } from 'pactum';

describe('HealthController (e2e)', () => {
  it('/health (GET)', async () => {
    await spec()
      .get('/health')
      .expectStatus(HttpStatus.OK)
      .expectJson({
        status: 'ok',
        info: {
          database: {
            status: 'up',
          },
          mem_rss: {
            status: 'up',
          },
          mem_heap: {
            status: 'up',
          },
        },
        error: {},
        details: {
          database: {
            status: 'up',
          },
          mem_rss: {
            status: 'up',
          },
          mem_heap: {
            status: 'up',
          },
        },
      })
      .toss();
  });
});
