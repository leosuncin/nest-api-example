import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type IPaginationOptions,
  paginate,
  type Pagination,
} from 'nestjs-typeorm-paginate';
import type { Repository } from 'typeorm';

import { Category } from '~shop/entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  create(newCategory: Pick<Category, 'name'>): Promise<Category> {
    const category = this.categoryRepository.create(newCategory);

    return this.categoryRepository.save(category);
  }

  find(options: IPaginationOptions): Promise<Pagination<Category>> {
    return paginate(this.categoryRepository, options);
  }

  get(id: Category['id']): Promise<Category | null> {
    return this.categoryRepository.findOneBy({ id });
  }

  update(
    category: Category,
    changes: Partial<Exclude<Category, 'id'>>,
  ): Promise<Category> {
    this.categoryRepository.merge(category, changes);

    return this.categoryRepository.save(category);
  }

  remove(category: Category): Promise<Category> {
    return this.categoryRepository.softRemove(category);
  }
}
