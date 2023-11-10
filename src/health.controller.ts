import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  type HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mem: MemoryHealthIndicator,
    private readonly orm: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  healthCheck(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.orm.pingCheck('database'),
      () => this.mem.checkRSS('mem_rss', 768 * 2 ** 20 /* 768 MB */),
      () => this.mem.checkHeap('mem_heap', 512 * 2 ** 20 /* 512 MB */),
    ]);
  }
}
