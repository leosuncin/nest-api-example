import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import type { Repository } from 'typeorm';

import { User } from '~auth/entities/user.entity';

@Injectable()
@ValidatorConstraint({ name: 'credential', async: true })
export class ValidateCredentialConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validate(
    value: string,
    { object, property }: ValidationArguments,
  ): Promise<boolean> {
    if (!this.hasCredentials(object)) return false;

    const user = await this.userRepository.findOne({
      where: {
        ...(object.id ? { id: object.id } : { username: object.username }),
      },
      cache: true,
    });

    if (!user) return false;

    if (property !== 'password') return true;

    return user.checkPassword(value);
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
