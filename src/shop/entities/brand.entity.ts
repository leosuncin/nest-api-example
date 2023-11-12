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
export class Brand {
  @PrimaryColumn({ length: 33 })
  id: Id<'brand'> = id.gen('brand');

  @Column()
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  static fromPartial(data: DeepPartial<Brand>): Brand {
    return Object.assign(new Brand(), data);
  }
}
