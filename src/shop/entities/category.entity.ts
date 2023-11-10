import {
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
export class Category {
  @PrimaryColumn({ length: 33 })
  id: Id<'category'> = id.gen('category');

  @Column()
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  static fromPartial(data: DeepPartial<Category>): Category {
    return Object.assign(new Category(), data);
  }
}
