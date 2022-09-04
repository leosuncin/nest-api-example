import {
  type DynamicModule,
  type ForwardReference,
  type INestApplication,
  type Type,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import type { DataSource } from 'typeorm';

import { database } from '@/common/database';
import { dataSourceOptions } from '@/data-source';

export async function buildTestApplication(
  ...modules: Array<
    Type<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >
): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRootAsync({
        // @ts-expect-error for testing purpose only
        useFactory: () => ({
          ...dataSourceOptions,
          url: undefined,
          migrationsRun: true,
          autoLoadEntities: true,
        }),
        dataSourceFactory: (options): Promise<DataSource> =>
          database.adapters.createTypeormDataSource(
            options,
          ) as Promise<DataSource>,
      }),
      ...modules,
    ],
  }).compile();
  const app = module.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );
  app.use(cookieParser(process.env['SECRET']));
  useContainer(module, { fallbackOnErrors: true });

  return app.init();
}
