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

  #oldPassword: string | undefined;

  static fromPartial(data: DeepPartial<User>): User {
    return Object.assign(new User(), data);
  }

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt();

    this.password = await bcrypt.hash(this.password, salt);
  }

  checkPassword(plainPassword: string) {
    return bcrypt.compare(plainPassword, this.password);
  }

  @AfterLoad()
  protected setOldPassword() {
    this.#oldPassword = this.password;
  }

  @BeforeUpdate()
  async updatePassword() {
    const bcryptRegex = /^\$(?:2a|2x|2y|2b)\$\d+\$/;

    if (!bcryptRegex.test(this.password)) {
      const salt = this.#oldPassword?.slice(0, 29) ?? (await bcrypt.genSalt());

      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}
