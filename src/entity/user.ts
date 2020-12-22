import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  AfterUpdate,
  AfterInsert,
} from 'typeorm';
import { IsEmail, Length } from 'class-validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import tokenService, { TokenEnum } from '../service/token';

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

  createAccessToken = async function (): Promise<string> {
    try {
      const { id, username, email } = this;
      const payload = { user: { id, username, email } };
      return tokenService.createToken(payload, TokenEnum.ACCESS);
    } catch (error) {
      console.error(error);
      return;
    }
  };

  createRefreshToken = async function (): Promise<string> {
    try {
      const { id, username, email } = this;
      const payload = { user: { id, username, email } };
      const refreshToken = tokenService.createToken(payload, TokenEnum.REFRESH);
      const { token } = await tokenService.saveRefreshToken(refreshToken);
      return token;
    } catch (err) {
      console.log(err);
    }
  };

  generatePasswordReset = function (): void {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    const date = new Date();
    date.setTime(date.getTime() + 60 * 60 * 1000);
    this.resetPasswordExpires = date;
  };
}
