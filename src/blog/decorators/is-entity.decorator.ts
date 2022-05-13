import { SetMetadata } from '@nestjs/common';

import { Entities, ENTITY_METADATA_KEY } from '@/blog/constants/entity.enum';

export const IsArticle = () =>
  SetMetadata(ENTITY_METADATA_KEY, Entities.ARTICLE);

export const IsComment = () =>
  SetMetadata(ENTITY_METADATA_KEY, Entities.COMMENT);
