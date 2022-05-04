import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type IPaginationOptions,
  type Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import type { Repository } from 'typeorm';

import type { CreateArticle } from '@/blog/dto/create-article.dto';
import { Article } from '@/blog/entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  create(newArticle: CreateArticle): Promise<Article> {
    const article = this.articleRepository.create(newArticle);

    return this.articleRepository.save(article);
  }

  getById(id: Article['id']): Promise<Article | undefined> {
    return this.articleRepository.findOne(id);
  }

  findBy(options: IPaginationOptions): Promise<Pagination<Article>> {
    return paginate(this.articleRepository, options);
  }
}
