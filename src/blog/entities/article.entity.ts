import { User } from '~auth/entities/user.entity';
import { Comment } from '~blog/entities/comment.entity';
import { Exclude } from 'class-transformer';
import { isUUID } from 'class-validator';
import { randomUUID } from 'node:crypto';
import shortUUID from 'short-uuid';
import slugify from 'slugify';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  type DeepPartial,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const translator = shortUUID(shortUUID.constants.flickrBase58);

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
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  author!: User;

  @OneToMany(() => Comment, (comment) => comment.article)
  comments!: Comment[];

  @BeforeInsert()
  @BeforeUpdate()
  protected generateSlug() {
    const slug = slugify(this.title, {
      lower: true,
      remove: /[*+~.()'"¡!:@,¿?]/u,
    });
    this.id ??= randomUUID();
    const shortId = translator.fromUUID(this.id);
    this.slug = `${slug}-${shortId}`;
  }

  static extractId(idOrSlug: string): Article['id'] {
    if (isUUID(idOrSlug)) {
      return idOrSlug;
    } else {
      const shortId = idOrSlug.slice(idOrSlug.lastIndexOf('-') + 1);

      return translator.toUUID(shortId);
    }
  }

  static fromPartial(data: DeepPartial<Article>): Article {
    return Object.assign(new Article(), data);
  }
}
