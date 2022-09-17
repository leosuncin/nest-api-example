import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { AuthenticationService } from '~auth/services/authentication.service';

@Injectable()
@ValidatorConstraint({ name: 'credential', async: true })
export class ValidateCredentialConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly authenticationService: AuthenticationService) {}

  validate(_: unknown, { object, property }: ValidationArguments) {
    if (!this.hasCredentials(object)) return false;

    return this.authenticationService.verifyCredentials(object, property);
  }

  defaultMessage(): string {
    return '$property is incorrect';
  }

  private hasCredentials(object: object): object is {
    username: string;
    password: string;
    id?: string;
    [key: string]: unknown;
  } {
    return (
      object.hasOwnProperty('username') || object.hasOwnProperty('password')
    );
  }
}

export function ValidateCredential(options: ValidationOptions = {}) {
  return function (object: object, propertyName: 'username' | 'password') {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: ValidateCredentialConstraint,
    });
  };
}
