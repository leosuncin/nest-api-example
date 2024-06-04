import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JWTAuthGuard } from '~auth/guards/jwt-auth.guard';
import { IsArticle } from '~blog/decorators/is-entity.decorator';
import { CreateArticle } from '~blog/dto/create-article.dto';
import { UpdateArticle } from '~blog/dto/update-article.dto';
import { Article } from '~blog/entities/article.entity';
import { IsAuthorGuard } from '~blog/guards/is-author.guard';
import { SetAuthorInterceptor } from '~blog/interceptors/set-author.interceptor';
import { ArticlePipe } from '~blog/pipes/article.pipe';
import { ArticleService } from '~blog/services/article.service';
import { Paginate } from '~common/dto/paginate.dto';
import { type Pagination } from 'nestjs-typeorm-paginate';

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

  @Patch(':id')
  @IsArticle()
  @UseGuards(JWTAuthGuard, IsAuthorGuard)
  update(
    @Param('id', ArticlePipe) article: Article,
    @Body() changes: UpdateArticle,
  ): Promise<Article> {
    return this.articleService.update(article, changes);
  }

  @Delete(':id')
  @IsArticle()
  @UseGuards(JWTAuthGuard, IsAuthorGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ArticlePipe) article: Article) {
    return this.articleService.remove(article);
  }
}
