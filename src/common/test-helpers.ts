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
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { DataType, newDb } from 'pg-mem';
import type { DataSource } from 'typeorm';
import {
  Builder,
  fixturesIterator,
  Loader,
  Parser,
  Resolver,
} from 'typeorm-fixtures-cli';

import type { LoginUser } from '@/auth/dto/login-user.dto';
import { User } from '@/auth/entities/user.entity';
import { Article } from '@/blog/entities/article.entity';
import { Comment } from '@/blog/entities/comment.entity';
import { CreateUser1637703183543 } from '@/migrations/1637703183543-create-user';
import { CreateArticleComment1651517018946 } from '@/migrations/1651517018946-create-article-comment';

// eslint-disable-next-line security/detect-unsafe-regex
export const uuidRegex = /[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}/;

export const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;

export const database = newDb({
  autoCreateForeignKeyIndices: true,
});

database.public.registerFunction({
  name: 'current_database',
  implementation: () => 'test',
});
database.public.registerFunction({
  name: 'uuid_generate_v4',
  returns: DataType.uuid,
  implementation: () => randomUUID(),
  impure: true,
});

export async function buildTestApplication(
  ...modules: Array<
    Type<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >
): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRootAsync({
        useFactory: () => ({
          type: 'postgres',
          migrations: [
            CreateUser1637703183543,
            CreateArticleComment1651517018946,
          ],
          entities: [User, Article, Comment],
          migrationsRun: true,
          autoLoadEntities: true,
        }),
        dataSourceFactory: async (options) => {
          const dataSource = (await database.adapters.createTypeormDataSource(
            options,
          )) as DataSource;

          // await  dataSource.initialize();
          // await dataSource.runMigrations();

          return dataSource;
        },
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
  app.use(cookieParser(process.env.SECRET));
  useContainer(module, { fallbackOnErrors: true });

  return app.init();
}

export async function loadFixtures(dataSource: DataSource) {
  const loader = new Loader();
  const resolver = new Resolver();

  loader.load(path.resolve(process.cwd(), 'fixtures'));

  const fixtures = resolver.resolve(loader.fixtureConfigs);
  const builder = new Builder(dataSource, new Parser(), true);

  for (const fixture of fixturesIterator(fixtures)) {
    const entity = await builder.build(fixture);
    await dataSource.getRepository(entity.constructor.name).save(entity);
  }
}

export const credentials = Object.freeze<LoginUser>({
  password: 'Th€Pa$$w0rd!',
  username: 'john-doe',
});

export const PASSWORD_HASHES = `
01B0E792722BA73BB221BB447CAD2E95B5A:21
01D9ACFB1F9BDF8593B2A35F043745AD9FB:1
040911493F28B1CD9EFDBECB96CE2A94324:6
074B0C6691134C16E0603ABE4C776EEB75C:42
076FBD9B37A06158F72C7B0B1118A9535BD:26
098FA0B1B16B20E37E8B3E829C692C50B2A:1205
1631F412B2136652FD8A11060E324B11F9B:3
164C1011FEF7893941E58C62666827BD879:15
1E4C9B93F3F0682250B6CF8331B7EE68FD8:9545824
A8B6421D0C680037FA68FE7FD266C4FE2F5:1805
`;
