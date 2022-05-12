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
import { CreateComment } from '@/blog/dto/create-comment';
import type { Article } from '@/blog/entities/article.entity';
import { Comment } from '@/blog/entities/comment.entity';
import { SetArticleInterceptor } from '@/blog/interceptors/set-article.interceptor';
import { SetAuthorInterceptor } from '@/blog/interceptors/set-author.interceptor';
import { ArticlePipe } from '@/blog/pipes/article.pipe';
import { CommentService } from '@/blog/services/comment.service';
import { Paginate } from '@/common/dto/paginate.dto';

@Controller('articles/:articleId/comments')
@UseInterceptors(ClassSerializerInterceptor)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(SetAuthorInterceptor, SetArticleInterceptor)
  create(@Body() newComment: CreateComment) {
    return this.commentService.create(newComment);
  }

  @Get()
  getAll(
    @Query() query: Paginate,
    @Param('articleId', ArticlePipe) article: Article,
  ): Promise<Pagination<Comment>> {
    return this.commentService.findBy(query, { article });
  }
}
