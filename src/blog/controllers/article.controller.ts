import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Pagination } from 'nestjs-typeorm-paginate';

import { JWTAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateArticle } from '@/blog/dto/create-article.dto';
import { Article } from '@/blog/entities/article.entity';
import { SetAuthorInterceptor } from '@/blog/interceptors/set-author.interceptor';
import { ArticlePipe } from '@/blog/pipes/article.pipe';
import { ArticleService } from '@/blog/services/article.service';
import { Paginate } from '@/common/dto/paginate.dto';

@Controller('articles')
@UseInterceptors(ClassSerializerInterceptor)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(SetAuthorInterceptor)
  create(@Body() newArticle: CreateArticle): Promise<Article> {
    return this.articleService.create(newArticle);
  }

  @Get(':id')
  getOne(@Param('id', ArticlePipe) article: Article): Article {
    return article;
  }

  @Get()
  getAll(@Query() query: Paginate): Promise<Pagination<Article>> {
    return this.articleService.findBy(query);
  }
}
