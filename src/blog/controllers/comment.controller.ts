import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JWTAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateComment } from '@/blog/dto/create-comment';
import { SetArticleInterceptor } from '@/blog/interceptors/set-article.interceptor';
import { SetAuthorInterceptor } from '@/blog/interceptors/set-author.interceptor';
import { CommentService } from '@/blog/services/comment.service';

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
}
