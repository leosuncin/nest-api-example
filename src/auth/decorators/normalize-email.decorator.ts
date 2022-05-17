import { Transform } from 'class-transformer';
import normalizeEmail from 'normalize-email';

export const NormalizeEmail = () =>
  Transform(
    ({ value }): string =>
      typeof value === 'string' ? normalizeEmail(value) : value,
    { toClassOnly: true },
  );
