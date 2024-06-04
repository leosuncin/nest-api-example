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
import { PWNED_PASSWORD } from '~auth/providers/pwned-password.provider';
import { database } from '~common/database';
import { type ConfigObject, configuration } from '~config/configuration';
import { dataSource } from '~config/data-source';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { type DataSource } from 'typeorm';

export async function buildTestApplication(
  ...modules: Array<
    Type<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >
): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        expandVariables: true,
        isGlobal: true,
        load: [configuration],
      }),
      TypeOrmModule.forRootAsync({
        dataSourceFactory: (options) =>
          database.adapters.createTypeormDataSource(
            options,
          ) as Promise<DataSource>,
        imports: [ConfigModule.forFeature(dataSource)],
        inject: [ConfigService],
        useFactory(config: ConfigService) {
          return config.getOrThrow('data-source');
        },
      }),
      ...modules,
    ],
  })
    .overrideProvider(PWNED_PASSWORD)
    .useValue((password: string) =>
      Promise.resolve(password === 'password' ? 9_545_824 : 0),
    )
    .compile();
  const app = module.createNestApplication();
  const configService = app.get<ConfigService<ConfigObject>>(ConfigService);

  app.useGlobalPipes(new ValidationPipe(configService.get('validation')));
  app.use(cookieParser(configService.get('secret', 's€cr3to')));
  useContainer(module, { fallbackOnErrors: true });

  return app.init();
}
