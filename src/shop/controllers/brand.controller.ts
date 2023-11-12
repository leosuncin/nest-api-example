import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { Pagination } from 'nestjs-typeorm-paginate';

import { JWTAuthGuard } from '~auth/guards/jwt-auth.guard';
import { Paginate } from '~common/dto/paginate.dto';
import { CreateBrand } from '~shop/dtos/create-brand.dto';
import { UpdateBrand } from '~shop/dtos/update-brand.dto';
import { Brand } from '~shop/entities/brand.entity';
import { BrandCastPipe } from '~shop/pipes/brand-cast.pipe';
import { BrandService } from '~shop/services/brand.service';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  create(@Body() newBrand: CreateBrand): Promise<Brand> {
    return this.brandService.create(newBrand);
  }

  @Get()
  find(@Query() query: Paginate): Promise<Pagination<Brand>> {
    // eslint-disable-next-line unicorn/no-array-callback-reference
    return this.brandService.find(query);
  }

  @Get(':id(brand_[a-zA-Z0-9]{24})')
  get(@Param('id', BrandCastPipe) brand: Brand): Brand {
    return brand;
  }

  @Patch(':id(brand_[a-zA-Z0-9]{24})')
  @UseGuards(JWTAuthGuard)
  update(
    @Param('id', BrandCastPipe) brand: Brand,
    @Body() changes: UpdateBrand,
  ): Promise<Brand> {
    return this.brandService.update(brand, changes);
  }

  @Delete(':id(brand_[a-zA-Z0-9]{24})')
  @UseGuards(JWTAuthGuard)
  remove(@Param('id', BrandCastPipe) brand: Brand): Promise<Brand> {
    return this.brandService.remove(brand);
  }
}
