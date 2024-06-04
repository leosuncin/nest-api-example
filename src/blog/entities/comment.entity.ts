import { User } from '~auth/entities/user.entity';
import { Article } from '~blog/entities/article.entity';
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

  static fromPartial(data: DeepPartial<Comment>): Comment {
    return Object.assign(new Comment(), data);
  }
}
