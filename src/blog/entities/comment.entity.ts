import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '@/auth/entities/user.entity';
import { Article } from '@/blog/entities/article.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  body!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  @Exclude()
  deletedAt?: Date;

  @ManyToOne(() => Article, (post) => post.comments, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  article!: Article;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  author!: User;
}
