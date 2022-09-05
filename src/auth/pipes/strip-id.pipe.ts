import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import type { UpdateUser } from '~auth/dto/update-user.dto';

@Injectable()
export class StripIdPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): UpdateUser | unknown {
    if (metadata.type !== 'body') return value;

    delete (value as UpdateUser).id;

    return value;
  }
}
