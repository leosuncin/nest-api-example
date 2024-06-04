import { randomUUID } from 'node:crypto';
import { DataType, newDb } from 'pg-mem';

export const database = newDb({
  autoCreateForeignKeyIndices: true,
});

database.public.registerFunction({
  implementation: () => 'test',
  name: 'current_database',
});

database.public.registerFunction({
  implementation: () => 'PostgreSQL 14.0',
  name: 'version',
});

database.public.registerFunction({
  implementation: () => randomUUID(),
  impure: true,
  name: 'uuid_generate_v4',
  returns: DataType.uuid,
});
