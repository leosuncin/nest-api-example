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
    options: ValidationArguments,
  ): Promise<boolean> {
    const count = await this.userRepository.count({
      where: {
        [options.property]: value,
      },
    });

    return count === 0;
  }

  defaultMessage(): string {
    return '$property «$value» is already registered';
  }
}

export function IsAlreadyRegister(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: IsAlreadyRegisterConstraint,
    });
  };
}
