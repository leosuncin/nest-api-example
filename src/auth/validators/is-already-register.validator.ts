import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import type { User } from '~auth/entities/user.entity';
import { AuthenticationService } from '~auth/services/authentication.service';

@Injectable()
@ValidatorConstraint({ name: 'isAlreadyRegister', async: true })
export class IsAlreadyRegisterConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly authenticationService: AuthenticationService) {}

  validate(value: string, { object, property }: ValidationArguments) {
    if (!this.isValidProperty(property)) return false;

    return this.authenticationService.userNotExistWith(
      property,
      value,
      // @ts-expect-error object has an id property and it's defined
      object.id as unknown,
    );
  }

  defaultMessage(): string {
    return '$property «$value» is already registered';
  }

  private isValidProperty(
    property: string,
  ): property is keyof Pick<User, 'email' | 'username'> {
    return property === 'email' || property === 'username';
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
