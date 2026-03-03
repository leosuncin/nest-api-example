import { Inject } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  type hasPasswordBeenPwned,
  PWNED_PASSWORD,
} from '~auth/providers/pwned-password.provider';

@ValidatorConstraint({ async: true, name: 'isNotVulnerable' })
export class IsNotVulnerableConstraint implements ValidatorConstraintInterface {
  #exposedTimes!: number;

  #formatter = new Intl.NumberFormat();

  @Inject(PWNED_PASSWORD)
  private readonly pwnedPassword!: typeof hasPasswordBeenPwned;

  defaultMessage() {
    return `$property is vulnerable, it has been publicly exposed in ${this.#formatter.format(
      this.#exposedTimes,
    )} data breaches`;
  }

  async validate(value: string): Promise<boolean> {
    if (typeof value !== 'string' || value.length === 0) {
      // Other validators check if it is a valid password
      return true;
    }

    this.#exposedTimes = await this.pwnedPassword(value);

    return this.#exposedTimes === 0;
  }
}

export function IsNotVulnerable(options: ValidationOptions = {}) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      options,
      propertyName,
      target: object.constructor,
      validator: IsNotVulnerableConstraint,
    });
  };
}
