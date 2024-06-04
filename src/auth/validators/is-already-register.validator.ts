import { Injectable } from '@nestjs/common';
import { AuthenticationService } from '~auth/services/authentication.service';
import {
  isEmpty,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ async: true, name: 'isAlreadyRegister' })
export class IsAlreadyRegisterConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly authenticationService: AuthenticationService) {}

  async validate(value: string, { object, property }: ValidationArguments) {
    if (isEmpty(value)) return true;

    const userExist = await this.authenticationService.isRegistered({
      // @ts-expect-error object has an id property and it's defined
      id: object.id as unknown,

      [property]: value,
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
      options,
      propertyName,
      target: object.constructor,
      validator: IsAlreadyRegisterConstraint,
    });
  };
}
