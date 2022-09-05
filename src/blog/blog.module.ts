import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArticleController } from '~blog/controllers/article.controller';
import { CommentController } from '~blog/controllers/comment.controller';
import { Article } from '~blog/entities/article.entity';
import { Comment } from '~blog/entities/comment.entity';
import { ArticleService } from '~blog/services/article.service';
import { CommentService } from '~blog/services/comment.service';
import { ArticleExistConstraint } from '~blog/validators/article-exist.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Comment])],
  controllers: [ArticleController, CommentController],
  providers: [ArticleService, CommentService, ArticleExistConstraint],
})
export class BlogModule {}
