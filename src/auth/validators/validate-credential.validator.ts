import { Injectable } from '@nestjs/common';
import {
  isString,
  isUUID,
  matches,
  maxLength,
  minLength,
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
    if (!this.hasCredentials(object)) return true;

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
    const { id, password, username } = object as Record<string, unknown>;
    const isValidId = isString(id) && isUUID(id, '4');
    const isValidPassword =
      isString(password) && minLength(password, 8) && maxLength(password, 30);
    const isValidUsername =
      isString(username) &&
      maxLength(username, 30) &&
      matches(username, /^[\w.-]+$/i);

    if (isValidId && isValidPassword) return true;
    if (isValidPassword && isValidUsername) return true;

    return false;
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
