import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { type UpdateUser } from '~auth/dto/update-user.dto';
import invariant from 'tiny-invariant';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

@Injectable()
export class SwapPasswordPipe implements PipeTransform {
  transform(
    value: Record<string, unknown>,
    metadata: ArgumentMetadata,
  ): Record<string, unknown> {
    if (metadata.type !== 'body') return value;

    if (this.#want2ChangePassword(value)) {
      invariant(value.newPassword);
      value.password = value.newPassword;
      delete value.newPassword;
    } else {
      delete value.password;
    }

    return value;
  }

  #want2ChangePassword(
    value: Record<string, unknown>,
  ): value is Writeable<UpdateUser> {
    return typeof value['newPassword'] === 'string';
  }
}
