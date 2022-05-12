import {
  Allow,
  IsDefined,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

import { User } from '@/auth/entities/user.entity';
import { Article } from '@/blog/entities/article.entity';
import { ArticleExist } from '@/blog/validators/article-exist.validator';

export class CreateComment {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly body!: string;

  @IsDefined()
  @IsUUID()
  @ArticleExist()
  readonly article!: Article;

  @Allow()
  readonly author!: User;
}
