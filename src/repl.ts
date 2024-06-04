import { repl } from '@nestjs/core';
import { AppModule } from '~app/app.module';

async function bootstrap() {
  await repl(AppModule);
}

void bootstrap();
