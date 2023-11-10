import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import type { UpdateUser } from '~auth/dto/update-user.dto';

@Injectable()
export class StripIdPipe implements PipeTransform {
  transform(value: UpdateUser, metadata: ArgumentMetadata): UpdateUser {
    if (metadata.type !== 'body') return value;

    delete value.id;

    return value;
  }
}
