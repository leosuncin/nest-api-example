import { Exclude } from 'class-transformer';
import { randomUUID } from 'node:crypto';
import shortUUID from 'short-uuid';
import slugify from 'slugify';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '@/auth/entities/user.entity';
import { Comment } from '@/blog/entities/comment.entity';

export const translator = shortUUID(shortUUID.constants.flickrBase58);

@Entity()
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column()
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  @Exclude()
  deletedAt?: Date;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    eager: true,
  })
  author!: User;

  @OneToMany(() => Comment, (comment) => comment.article)
  comments!: Comment[];

  @BeforeInsert()
  protected generateSlug() {
    const slug = slugify(this.title, {
      lower: true,
      remove: /[*+~.()'"¡!:@,¿?]/u,
    });
    this.id ??= randomUUID();
    this.slug = `${slug}-${translator.fromUUID(this.id)}`;
  }
}
