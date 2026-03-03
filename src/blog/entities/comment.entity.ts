import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  type DeepPartial,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '~auth/entities/user.entity';
import { Article } from '~blog/entities/article.entity';

@Entity()
export class Comment {
  @ManyToOne(() => Article, (post) => post.comments, {
    deferrable: 'INITIALLY DEFERRED',
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  article!: Article;

  @ManyToOne(() => User, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  author!: User;

  @Column()
  body!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @DeleteDateColumn()
  @Exclude()
  deletedAt?: Date;

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @UpdateDateColumn()
  updatedAt!: Date;

  static fromPartial(data: DeepPartial<Comment>): Comment {
    return Object.assign(new Comment(), data);
  }
}
