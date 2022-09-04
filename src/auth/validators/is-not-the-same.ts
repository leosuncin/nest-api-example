import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNotTheSame' })
export class IsNotTheSameConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, validationArguments: ValidationArguments): boolean {
    const [property] = validationArguments.constraints as [string];
    const object = validationArguments.object as Record<string, unknown>;

    // eslint-disable-next-line security/detect-object-injection
    return !Object.is(object[property], value);
  }

  defaultMessage({ constraints }: ValidationArguments) {
    const [property] = constraints as [string];

    return `$property must be different than ${property}`;
  }
}

export function IsNotTheSame<Type>(
  property: keyof Type,
  validationOptions: ValidationOptions = {},
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsNotTheSameConstraint,
    });
  };
}
