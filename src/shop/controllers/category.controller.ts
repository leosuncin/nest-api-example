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
import { CreateCategory } from '~shop/dtos/create-category.dto';
import { UpdateCategory } from '~shop/dtos/update-category.dto';
import { Category } from '~shop/entities/category.entity';
import { CategoryCastPipe } from '~shop/pipes/category-cast.pipe';
import { CategoryService } from '~shop/services/category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  create(@Body() newCategory: CreateCategory): Promise<Category> {
    return this.categoryService.create(newCategory);
  }

  @Get()
  find(@Query() query: Paginate): Promise<Pagination<Category>> {
    // eslint-disable-next-line unicorn/no-array-callback-reference
    return this.categoryService.find(query);
  }

  @Get(':id(category_[a-zA-Z0-9]{24})')
  get(@Param('id', CategoryCastPipe) category: Category): Category {
    return category;
  }

  @Patch(':id(category_[a-zA-Z0-9]{24})')
  @UseGuards(JWTAuthGuard)
  update(
    @Param('id', CategoryCastPipe) category: Category,
    @Body() changes: UpdateCategory,
  ): Promise<Category> {
    return this.categoryService.update(category, changes);
  }

  @Delete(':id(category_[a-zA-Z0-9]{24})')
  @UseGuards(JWTAuthGuard)
  remove(@Param('id', CategoryCastPipe) category: Category): Promise<Category> {
    return this.categoryService.remove(category);
  }
}
