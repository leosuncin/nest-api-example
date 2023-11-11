import { PartialType } from '@nestjs/mapped-types';

import { CreateCategory } from '~shop/dtos/create-category.dto';

export class UpdateCategory extends PartialType(CreateCategory) {}
