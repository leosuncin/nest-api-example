import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type IPaginationOptions,
  paginate,
  type Pagination,
} from 'nestjs-typeorm-paginate';
import { type Repository } from 'typeorm';
import { type CreateArticle } from '~blog/dto/create-article.dto';
import { type UpdateArticle } from '~blog/dto/update-article.dto';
import { Article } from '~blog/entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async checkExist(articleId: Article['id']): Promise<boolean> {
    const count = await this.articleRepository.count({
      where: {
        id: articleId,
      },
    });

    return count > 0;
  }

  create(newArticle: CreateArticle): Promise<Article> {
    const article = this.articleRepository.create(newArticle);

    return this.articleRepository.save(article);
  }

  findBy(options: IPaginationOptions): Promise<Pagination<Article>> {
    return paginate(this.articleRepository, options);
  }

  getById(id: Article['id']): Promise<Article | null> {
    return this.articleRepository.findOne({ where: { id } });
  }

  remove(article: Article): Promise<Article> {
    return this.articleRepository.softRemove(article);
  }

  update(article: Article, changes: UpdateArticle): Promise<Article> {
    this.articleRepository.merge(article, changes);

    return this.articleRepository.save(article);
  }
}
