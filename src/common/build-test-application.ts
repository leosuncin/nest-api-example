import {
  type DynamicModule,
  type ForwardReference,
  type INestApplication,
  type Type,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import type { DataSource } from 'typeorm';

import { database } from '~common/database';
import { type ConfigObject, configuration } from '~config/configuration';
import { dataSource } from '~config/data-source';

export async function buildTestApplication(
  ...modules: Array<
    Type<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >
): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        expandVariables: true,
        load: [configuration],
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule.forFeature(dataSource)],
        inject: [ConfigService],
        useFactory(config: ConfigService) {
          return config.getOrThrow('data-source');
        },
        dataSourceFactory: (options) =>
          database.adapters.createTypeormDataSource(
            options,
          ) as Promise<DataSource>,
      }),
      ...modules,
    ],
  }).compile();
  const app = module.createNestApplication();
  const config = app.get<ConfigService<ConfigObject>>(ConfigService);

  app.useGlobalPipes(new ValidationPipe(config.get('validation')));
  app.use(cookieParser(config.get('secret', 's€cr3to')));
  useContainer(module, { fallbackOnErrors: true });

  return app.init();
}
