import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JWTAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateArticle } from '@/blog/dto/create-article.dto';
import { Article } from '@/blog/entities/article.entity';
import { SetAuthorInterceptor } from '@/blog/interceptors/set-author.interceptor';
import { ArticleService } from '@/blog/services/article.service';

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
}
