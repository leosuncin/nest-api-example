import { HttpStatus, type ValidationPipeOptions } from '@nestjs/common';
import invariant from 'tiny-invariant';

export type ConfigObject = ReturnType<typeof configuration>;

export function configuration() {
  invariant(process.env.SECRET, 'SECRET is missing');

  return {
    port: Number.parseInt(process.env.PORT, 10) || 3000,
    secret: process.env.SECRET,
    validation: {
      transform: true,
      whitelist: true,
      forbidUnknownValues: false,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    } as ValidationPipeOptions,
  };
}
