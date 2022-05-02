import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArticleController } from '@/blog/controllers/article.controller';
import { Article } from '@/blog/entities/article.entity';
import { Comment } from '@/blog/entities/comment.entity';
import { ArticleService } from '@/blog/services/article.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Comment])],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class BlogModule {}
