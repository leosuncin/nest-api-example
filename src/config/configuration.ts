import { HttpStatus, type ValidationPipeOptions } from '@nestjs/common';
import invariant from 'tiny-invariant';

export type ConfigObject = ReturnType<typeof configuration>;

export function configuration() {
  invariant(process.env.SECRET, 'SECRET is missing');

  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    port: Number.parseInt(process.env.PORT!, 10) || 3_000,
    secret: process.env.SECRET,
    validation: {
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      forbidUnknownValues: false,
      transform: true,
      whitelist: true,
    } as ValidationPipeOptions,
  };
}
