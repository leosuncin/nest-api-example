import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeepPartial,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const bcryptRegex = /^\$(?:2a|2x|2y|2b)\$\d+\$/;

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('citext', { unique: true })
  email!: string;

  @Column('citext', { unique: true })
  username!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ nullable: true, default: '' })
  image?: string;

  @Column({ nullable: true, default: '' })
  bio?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  private salt: string | undefined;

  static fromPartial(data: DeepPartial<User>): User {
    return Object.assign(new User(), data);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!bcryptRegex.test(this.password)) {
      this.password = await bcrypt.hash(this.password, this.salt ?? 10);
    }
  }

  checkPassword(plainPassword: string) {
    return bcrypt.compare(plainPassword, this.password);
  }

  @AfterLoad()
  protected setOldPassword() {
    this.salt = this.password.slice(0, 29);
  }
}
