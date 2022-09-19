import { Injectable } from '@nestjs/common';
import {
  isEmpty,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { AuthenticationService } from '~auth/services/authentication.service';

@Injectable()
@ValidatorConstraint({ name: 'isAlreadyRegister', async: true })
export class IsAlreadyRegisterConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly authenticationService: AuthenticationService) {}

  async validate(value: string, { object, property }: ValidationArguments) {
    if (isEmpty(value)) return true;

    const userExist = await this.authenticationService.isRegistered({
      [property]: value,
      // @ts-expect-error object has an id property and it's defined
      id: object.id as unknown,
    });

    return !userExist;
  }

  defaultMessage(): string {
    return '$property «$value» is already registered';
  }
}

export function IsAlreadyRegister(options: ValidationOptions = {}) {
  return function (object: object, propertyName: 'username' | 'email') {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: IsAlreadyRegisterConstraint,
    });
  };
}
