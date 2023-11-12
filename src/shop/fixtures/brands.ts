// cSpell:ignore Haro, Ritchey
import { Brand } from '~shop/entities/brand.entity';

export const brands = [
  Brand.fromPartial({
    id: 'brand_MjQ2NzY2NjM0NDAzNzQ5ODg5',
    name: 'Electra',
  }),
  Brand.fromPartial({
    id: 'brand_MjQ2NzY2NjM0NDA3OTQ0MTk0',
    name: 'Haro',
  }),
  Brand.fromPartial({
    id: 'brand_MjQ2NzY2NjM0NDA3OTQ0MTk1',
    name: 'Heller',
  }),
  Brand.fromPartial({
    id: 'brand_MjQ2NzY2NjM0NDA3OTQ0MTk2',
    name: 'Pure Cycles',
  }),
  Brand.fromPartial({
    id: 'brand_MjQ2NzY2NjM0NDA3OTQ0MTk3',
    name: 'Ritchey',
  }),
  Brand.fromPartial({
    id: 'brand_MjQ2NzY2NjM0NDA3OTQ0MTk4',
    name: 'Strider',
  }),
  Brand.fromPartial({
    id: 'brand_MjQ2NzY2NjM0NDA3OTQ0MTk5',
    name: 'Sun Bicycles',
  }),
  Brand.fromPartial({
    id: 'brand_MjQ2NzY2NjM0NDM3MzA0MzI4',
    name: 'Surly',
  }),
  Brand.fromPartial({
    id: 'brand_MjQ2NzY2NjM0NDM3MzA0MzI5',
    name: 'Trek',
  }),
] as const;
