import * as bcrypt from 'bcryptjs';
import {
  BeforeInsert,
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
  password!: string;

  @Column({ nullable: true, default: '' })
  image?: string;

  @Column({ nullable: true, default: '' })
  bio?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  static fromPartial(data: DeepPartial<User>): User {
    return Object.assign(new User(), data);
  }

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt();

    this.password = await bcrypt.hash(this.password, salt);
  }
}
