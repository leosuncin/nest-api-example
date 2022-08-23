import { repl } from '@nestjs/core';

import { AppModule } from '@/app.module';

async function bootstrap() {
  await repl(AppModule);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void bootstrap();
