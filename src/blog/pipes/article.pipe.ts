import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

import { Article } from '~blog/entities/article.entity';
import { ArticleService } from '~blog/services/article.service';

@Injectable()
export class ArticlePipe implements PipeTransform<string, Promise<Article>> {
  constructor(private readonly articleService: ArticleService) {}

  async transform(value: Article['id']) {
    const id = Article.extractId(value);

    const article = await this.articleService.getById(id);

    if (!article) {
      throw new NotFoundException('The article was not found');
    }

    return article;
  }
}
