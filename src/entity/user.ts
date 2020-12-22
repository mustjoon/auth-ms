import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  AfterUpdate,
  AfterInsert,
  OneToMany,
} from 'typeorm';
import { IsEmail, Length } from 'class-validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { Token } from './token';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @Column()
  @Length(4, 100)
  username: string;

  @Column()
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Length(4, 100)
  password: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordExpires: Date;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @BeforeUpdate()
  @BeforeInsert()
  async saltPassword(): Promise<void> {
    const salt = await bcrypt.genSalt(12);
    if (this.password) {
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @AfterUpdate()
  @AfterInsert()
  async deletePassword(): Promise<void> {
    delete this.password;
  }

  generatePasswordReset = function (): void {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    const date = new Date();
    date.setTime(date.getTime() + 60 * 60 * 1000);
    this.resetPasswordExpires = date;
  };
}
