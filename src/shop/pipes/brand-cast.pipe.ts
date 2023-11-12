import {
  Injectable,
  NotFoundException,
  type PipeTransform,
} from '@nestjs/common';

import type { Brand } from '~shop/entities/brand.entity';
import { BrandService } from '~shop/services/brand.service';

@Injectable()
export class BrandCastPipe implements PipeTransform {
  constructor(private readonly brandService: BrandService) {}

  async transform(value: Brand['id']): Promise<Brand> {
    const brand = await this.brandService.get(value);

    if (!brand) {
      throw new NotFoundException(`The brand with id ${value}`);
    }

    return brand;
  }
}
