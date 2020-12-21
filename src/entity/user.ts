import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import tokenService from '../service/token';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordExpires: Date;

  @BeforeInsert()
  async beforeInsert(): Promise<void> {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  createAccessToken = async function (): Promise<string> {
    try {
      const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
      const { _id, username } = this;
      const accessToken = jwt.sign({ user: { _id, username } }, ACCESS_TOKEN_SECRET, {
        expiresIn: '5s',
      });
      return accessToken;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  createRefreshToken = async function (): Promise<string> {
    try {
      const token = await tokenService.createTokenForUser(this);
      return token.token;
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
