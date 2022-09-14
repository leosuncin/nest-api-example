import {
  HealthCheckService,
  HealthIndicatorFunction,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { type TestingModule, Test } from '@nestjs/testing';
import { createMock } from 'ts-auto-mock';

import { HealthController } from '~app/health.controller';

function getStatus(key: string): HealthIndicatorResult {
  return { [key]: { status: 'up' } };
}

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    })
      .useMocker((token) => {
        if (token === HealthCheckService) {
          return createMock<HealthCheckService>({
            check: jest
              .fn()
              .mockImplementation((indicators: HealthIndicatorFunction[]) =>
                Promise.all(indicators.map((indicator) => indicator())),
              ),
          });
        }

        if (token === TypeOrmHealthIndicator) {
          return createMock<TypeOrmHealthIndicator>({
            pingCheck: jest.fn().mockImplementation(getStatus),
          });
        }

        if (token === MemoryHealthIndicator) {
          return createMock<MemoryHealthIndicator>({
            checkHeap: jest.fn().mockImplementation(getStatus),
            checkRSS: jest.fn().mockImplementation(getStatus),
          });
        }

        return;
      })
      .compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be an instance of HealthController', () => {
    expect(controller).toBeInstanceOf(HealthController);
  });

  it('should check the health', async () => {
    await expect(controller.healthCheck()).resolves.toMatchInlineSnapshot(`
      [
        {
          "database": {
            "status": "up",
          },
        },
        {
          "mem_rss": {
            "status": "up",
          },
        },
        {
          "mem_heap": {
            "status": "up",
          },
        },
      ]
    `);
  });
});
