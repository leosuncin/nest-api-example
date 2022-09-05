import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

import { AppModule } from '~app/app.module';
import type { ConfigObject } from '~config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<ConfigObject, true>>(ConfigService);

  app.useGlobalPipes(new ValidationPipe(config.get('validation')));
  app.use(cookieParser(config.getOrThrow('secret')));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(config.get('port'));
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void bootstrap();
