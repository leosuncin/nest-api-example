import { PartialType } from '@nestjs/mapped-types';

import { CreateBrand } from '~shop/dtos/create-brand.dto';

export class UpdateBrand extends PartialType(CreateBrand) {}
