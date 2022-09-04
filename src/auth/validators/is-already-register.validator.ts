import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Equal, Not, Repository } from 'typeorm';

import { User } from '@/auth/entities/user.entity';

@Injectable()
@ValidatorConstraint({ name: 'isAlreadyRegister', async: true })
export class IsAlreadyRegisterConstraint
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
    const count = await this.userRepository.count({
      where: {
        [property]: Equal(value),
        ...(this.hasId(object) ? { id: Not(object.id) } : {}),
      },
    });

    return count === 0;
  }

  defaultMessage(): string {
    return '$property «$value» is already registered';
  }

  private hasId(
    object: object,
  ): object is { id: string; [key: string]: unknown } {
    // @ts-expect-error object has an id property and it's defined
    return object.hasOwnProperty('id') && object.id !== undefined;
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
