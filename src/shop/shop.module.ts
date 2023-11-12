import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BrandController } from '~shop/controllers/brand.controller';
import { CategoryController } from '~shop/controllers/category.controller';
import { Brand } from '~shop/entities/brand.entity';
import { Category } from '~shop/entities/category.entity';
import { BrandService } from '~shop/services/brand.service';
import { CategoryService } from '~shop/services/category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Brand])],
  providers: [CategoryService, BrandService],
  controllers: [CategoryController, BrandController],
})
export class ShopModule {}
