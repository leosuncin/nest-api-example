import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { ArticleService } from '@/blog/services/article.service';

@Injectable()
@ValidatorConstraint({ name: 'articleExist', async: true })
export class ArticleExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly articleService: ArticleService) {}

  validate(value: string): Promise<boolean> {
    return this.articleService.checkExist(value);
  }

  defaultMessage() {
    return '$property with id «$value» does not exist';
  }
}

export function ArticleExist(options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: ArticleExistConstraint,
    });
}
