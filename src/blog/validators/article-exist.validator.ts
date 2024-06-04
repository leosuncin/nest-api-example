import { Injectable } from '@nestjs/common';
import { ArticleService } from '~blog/services/article.service';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ async: true, name: 'articleExist' })
export class ArticleExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly articleService: ArticleService) {}

  validate(value: string): Promise<boolean> {
    return this.articleService.checkExist(value);
  }

  defaultMessage() {
    return '$property with id «$value» does not exist';
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
