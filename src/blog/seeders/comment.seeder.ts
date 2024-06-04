import { jane, john } from '~auth/fixtures/users';
import { Comment } from '~blog/entities/comment.entity';
import { articleByJane, articleByJohn } from '~blog/fixtures/articles';
import {
  commentByJaneOnArticleByJohn,
  commentByJohnOnArticleByJane,
} from '~blog/fixtures/comments';
import { type DataSource } from 'typeorm';
import { type Seeder, type SeederFactoryManager } from 'typeorm-extension';

export class CommentSeeder implements Seeder {
  async run(
    _: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const commentFactory = factoryManager.get(Comment);

    await Promise.allSettled([
      commentFactory.save(commentByJaneOnArticleByJohn),
      commentFactory.saveMany(14, {
        article: articleByJohn,
        author: jane,
      }),
      commentFactory.save(commentByJohnOnArticleByJane),
      commentFactory.saveMany(14, {
        article: articleByJane,
        author: john,
      }),
    ]);
  }
}
