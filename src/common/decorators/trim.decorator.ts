import { Transform } from 'class-transformer';

export const Trim = () =>
  Transform(({ value }): string =>
    typeof value === 'string' ? value.trim() : value,
  );
