import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryController } from '~shop/controllers/category.controller';
import { Brand } from '~shop/entities/brand.entity';
import { Category } from '~shop/entities/category.entity';
import { CategoryService } from '~shop/services/category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Brand])],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class ShopModule {}
