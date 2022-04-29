import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class RemovePasswordPipe implements PipeTransform {
  transform(
    value: Record<string, unknown>,
    metadata: ArgumentMetadata,
  ): Record<string, unknown> {
    if (metadata.type !== 'body') return value;

    if (value.hasOwnProperty('password')) {
      delete value.password;
    }

    return value;
  }
}
