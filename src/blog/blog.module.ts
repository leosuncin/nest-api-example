import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Article } from '@/blog/entities/article.entity';
import { Comment } from '@/blog/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Comment])],
})
export class BlogModule {}
