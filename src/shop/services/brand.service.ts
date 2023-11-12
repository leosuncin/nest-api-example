import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type IPaginationOptions,
  paginate,
  type Pagination,
} from 'nestjs-typeorm-paginate';
import type { Repository } from 'typeorm';

import { Brand } from '~shop/entities/brand.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  create(newBrand: Pick<Brand, 'name'>): Promise<Brand> {
    const brand = this.brandRepository.create(newBrand);

    return this.brandRepository.save(brand);
  }

  find(options: IPaginationOptions): Promise<Pagination<Brand>> {
    return paginate(this.brandRepository, options);
  }

  get(id: Brand['id']): Promise<Brand | null> {
    return this.brandRepository.findOneBy({ id });
  }

  update(brand: Brand, changes: Partial<Exclude<Brand, 'id'>>): Promise<Brand> {
    this.brandRepository.merge(brand, changes);

    return this.brandRepository.save(brand);
  }

  remove(brand: Brand): Promise<Brand> {
    return this.brandRepository.softRemove(brand);
  }
}
