import { MoreThan } from 'typeorm';
import bcrypt from 'bcrypt';

import { User } from '../entity/user';
import { ErrorHandler } from '../middleware/error';

import { OrmService } from './orm-service';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface CreateUserParams {
  username: string;
  email: string;
  password: string;
}

interface FindUserParams {
  email: string;
}

interface ValidateUserParams {
  email: string;
  password: string;
}

interface ResetPasswordParams {
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  password: string;
}
class UserService extends OrmService<User> {
  create = async ({ email, username, password }: CreateUserParams): Promise<User> => {
    const user = await this.findOne({ email });

    if (user) {
      throw new ErrorHandler(400, 'Username taken');
    } else {
      const user = new User();
      user.email = email;
      user.username = username;
      user.password = password;
      await this.repository.save(user);
      return user;
    }
  };

  save = async (user: User): Promise<User> => {
    await this.repository.save(user);
    return user;
  };
  findOne = async ({ email }: FindUserParams): Promise<User | null> => {
    const user = await this.repository.findOne({ email });
    if (!user) {
      return null;
    }
    return user;
  };

  getTokens = async (user: User): Promise<Tokens> => {
    const accessToken = await user.createAccessToken();
    const refreshToken = await user.createRefreshToken();
    return { accessToken, refreshToken };
  };

  validateUserLogin = async ({ email, password }: ValidateUserParams): Promise<Tokens> => {
    const user = await this.findOne({ email });
    if (!user) {
      throw new ErrorHandler(404, 'User not found');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new ErrorHandler(401, 'Error finding user');
    }
    return this.getTokens(user);
  };

  resetPassword = async ({ resetPasswordToken, resetPasswordExpires, password }: ResetPasswordParams) => {
    const user = await this.repository.findOne({
      resetPasswordToken,
      resetPasswordExpires: MoreThan(resetPasswordExpires),
    });
    if (!user) {
      throw new ErrorHandler(404, 'User not found or token expired');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await this.repository.save(user);
    return user;
  };
}

export default new UserService(User);
