import { Inject } from '@nestjs/common';
import {
  type hasPasswordBeenPwned,
  PWNED_PASSWORD,
} from '~auth/providers/pwned-password.provider';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true, name: 'isNotVulnerable' })
export class IsNotVulnerableConstraint implements ValidatorConstraintInterface {
  #formatter = new Intl.NumberFormat();

  #exposedTimes!: number;

  @Inject(PWNED_PASSWORD)
  private readonly pwnedPassword!: typeof hasPasswordBeenPwned;

  async validate(value: string): Promise<boolean> {
    if (typeof value !== 'string' || value.length === 0) {
      // Other validators check if it is a valid password
      return true;
    }

    this.#exposedTimes = await this.pwnedPassword(value);

    return this.#exposedTimes === 0;
  }

  defaultMessage() {
    return `$property is vulnerable, it has been publicly exposed in ${this.#formatter.format(
      this.#exposedTimes,
    )} data breaches`;
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
