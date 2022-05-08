import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateArticle } from '@/blog/dto/create-article.dto';

export class UpdateArticle extends PartialType(
  OmitType(CreateArticle, ['author']),
) {}
