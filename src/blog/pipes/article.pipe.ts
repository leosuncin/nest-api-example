import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';

import { Article, translator } from '@/blog/entities/article.entity';
import { ArticleService } from '@/blog/services/article.service';

@Injectable()
export class ArticlePipe implements PipeTransform<string, Promise<Article>> {
  constructor(private readonly articleService: ArticleService) {}

  async transform(value: Article['id'] | Article['slug']) {
    let id: string;

    if (isUUID(value)) {
      id = value;
    } else {
      const shortId = value.slice(value.lastIndexOf('-') + 1);
      id = translator.toUUID(shortId);
    }

    const article = await this.articleService.getById(id);

    if (!article) {
      throw new NotFoundException('The article was not found');
    }

    return article;
  }
}
