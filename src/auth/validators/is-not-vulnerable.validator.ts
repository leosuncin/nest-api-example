import CachedLookup, { type LookupHandler } from 'cached-lookup';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { pwnedPassword } from 'hibp';

const hasPasswordBeenPwned = (password: string) => pwnedPassword(password);

const hibpCache = new CachedLookup(
  hasPasswordBeenPwned as LookupHandler<number>,
);

@ValidatorConstraint({ name: 'isNotVulnerable', async: true })
class IsNotVulnerableConstraint implements ValidatorConstraintInterface {
  #exposedTimes!: number;

  async validate(value: string): Promise<boolean> {
    if (typeof value !== 'string' || value.length === 0) {
      // Other validators check if it is a valid password
      return true;
    }

    this.#exposedTimes = await hibpCache.cached(60e3, value);

    return this.#exposedTimes === 0;
  }

  defaultMessage() {
    return `$property is vulnerable, it has been publicly exposed in ${
      this.#exposedTimes
    } data breaches`;
  }
}

export function IsNotVulnerable(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: IsNotVulnerableConstraint,
    });
  };
}
