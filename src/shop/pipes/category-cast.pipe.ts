import {
  Injectable,
  NotFoundException,
  type PipeTransform,
} from '@nestjs/common';

import type { Category } from '~shop/entities/category.entity';
import { CategoryService } from '~shop/services/category.service';

@Injectable()
export class CategoryCastPipe implements PipeTransform {
  constructor(private readonly categoryService: CategoryService) {}

  async transform(value: Category['id']): Promise<Category> {
    const category = await this.categoryService.get(value);

    if (!category) {
      throw new NotFoundException(`The category with id ${value}`);
    }

    return category;
  }
}
