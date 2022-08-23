import { createPlugin } from 'fluse';
import type { DataSource, EntityManager } from 'typeorm';
import { CommandUtils } from 'typeorm/commands/CommandUtils';

export interface TypeORMPluginOptions {
  dataSource?: DataSource | string;
  transaction?: boolean;
  synchronize?: boolean;
  dropBeforeSync?: boolean;
}

export interface TypeORMContext {
  dataSource: DataSource;
  entityManager: EntityManager;
}

export function typeORMPlugin(defaultOptions?: TypeORMPluginOptions) {
  return createPlugin<TypeORMContext, TypeORMPluginOptions>({
    name: 'typeorm',
    version: '^1.0.0',
    async execute(next, options) {
      const _options = Object.assign({}, defaultOptions, options);
      const dataSource = await loadDataSource(_options.dataSource);

      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }

      if (_options.synchronize) {
        await dataSource.synchronize(_options.dropBeforeSync);
      }

      if (_options.transaction) {
        return dataSource.transaction((entityManager) => {
          return next({ dataSource, entityManager });
        });
      }

      const entityManager = dataSource.createEntityManager();

      return next({ dataSource, entityManager });
    },
  });
}

async function loadDataSource(
  dataSource: TypeORMPluginOptions['dataSource'],
): Promise<DataSource> {
  if (typeof dataSource === 'string') {
    return CommandUtils.loadDataSource(dataSource);
  }

  if (!dataSource) {
    return CommandUtils.loadDataSource('src/data-source.ts');
  }

  return dataSource;
}
