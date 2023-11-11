import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryController } from '~shop/controllers/category.controller';
import { Category } from '~shop/entities/category.entity';
import { CategoryService } from '~shop/services/category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class ShopModule {}
