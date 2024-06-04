import { Injectable } from '@nestjs/common';
import { AuthenticationService } from '~auth/services/authentication.service';
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

@Injectable()
@ValidatorConstraint({ async: true, name: 'credential' })
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
    [key: string]: unknown;
    id?: string;
    password: string;
    username: string;
  } {
    const { id, password, username } = object as Record<string, unknown>;
    const isValidId = isString(id) && isUUID(id, '4');
    const isValidPassword =
      isString(password) && minLength(password, 8) && maxLength(password, 30);
    const isValidUsername =
      isString(username) &&
      maxLength(username, 30) &&
      matches(username, /^[\w.-]+$/u);

    if (isValidId && isValidPassword) return true;
    if (isValidPassword && isValidUsername) return true;

    return false;
  }
}

export function ValidateCredential(options: ValidationOptions = {}) {
  return function (object: object, propertyName: 'username' | 'password') {
    registerDecorator({
      options,
      propertyName,
      target: object.constructor,
      validator: ValidateCredentialConstraint,
    });
  };
}
