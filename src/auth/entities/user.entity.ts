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

const bcryptRegex = /^\$(?:2a|2x|2y|2b)\$\d+\$/u;

@Entity()
export class User {
  @Column({ default: '', nullable: true })
  bio?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('citext', { unique: true })
  email!: string;

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: '', nullable: true })
  image?: string;

  @Column()
  @Exclude()
  password!: string;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column('citext', { unique: true })
  username!: string;

  #salt: string | undefined;

  static fromPartial(data: DeepPartial<User>): User {
    return Object.assign(new User(), data);
  }

  checkPassword(plainPassword: string) {
    return bcrypt.compare(plainPassword, this.password);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!bcryptRegex.test(this.password)) {
      this.password = await bcrypt.hash(this.password, this.#salt ?? 10);
    }
  }

  @AfterLoad()
  protected setOldPassword() {
    this.#salt = this.password.slice(0, 29);
  }
}
