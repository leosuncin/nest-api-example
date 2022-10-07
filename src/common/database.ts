import { randomUUID } from 'node:crypto';

import { DataType, newDb } from 'pg-mem';

export const database = newDb({
  autoCreateForeignKeyIndices: true,
});

database.public.registerFunction({
  name: 'current_database',
  implementation: () => 'test',
});

database.public.registerFunction({
  name: 'version',
  implementation: () => 'PostgreSQL 14.0',
});

database.public.registerFunction({
  name: 'uuid_generate_v4',
  returns: DataType.uuid,
  implementation: () => randomUUID(),
  impure: true,
});
