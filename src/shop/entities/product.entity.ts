import {
  Check,
  Column,
  CreateDateColumn,
  type DeepPartial,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type Id, id } from '~common/id';

@Entity({ schema: 'shop' })
@Check('positive_price', `"listPrice" >= 0`)
@Check('valid_year', `"modelYear" >= 1900`)
export class Product {
  @PrimaryColumn({ length: 33 })
  id: Id<'product'> = id.gen('product');

  @Column()
  name!: string;

  @Column({ type: 'int' })
  modelYear!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  listPrice!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  static fromPartial(data: DeepPartial<Product>): Product {
    return Object.assign(new Product(), data);
  }
}
