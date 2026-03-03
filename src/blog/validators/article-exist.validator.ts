import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ArticleService } from '~blog/services/article.service';

@Injectable()
@ValidatorConstraint({ async: true, name: 'articleExist' })
export class ArticleExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly articleService: ArticleService) {}

  defaultMessage() {
    return '$property with id «$value» does not exist';
  }

  validate(value: string): Promise<boolean> {
    return this.articleService.checkExist(value);
  }
}

export function ArticleExist(options: ValidationOptions = {}) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      options,
      propertyName,
      target: object.constructor,
      validator: ArticleExistConstraint,
    });
}
