import { MoreThan } from 'typeorm';
import bcrypt from 'bcrypt';
import { validate } from 'class-validator';

import { User } from '../entity/user';
import { ErrorHandler, ValidationErrorHandler, ClassValidationErrorHandler } from '../middleware/error';

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
  email?: string;
  id?: number;
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

interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  id: number;
}

class UserService extends OrmService<User> {
  create = async ({ email, username, password }: CreateUserParams): Promise<User> => {
    const hasUser = await this.getUser({ email });

    if (hasUser) {
      throw new ErrorHandler(400, `User with email ${email} already exists`);
    }
    const user = new User();
    user.email = email;
    user.username = username;
    user.password = password;
    const errors = await validate(user);
    if (errors.length > 0) {
      throw new ClassValidationErrorHandler(errors);
    }

    await this.repository.save(user);
    return user;
  };

  save = async (user: User): Promise<User> => {
    return await this.repository.save(user);
  };
  getUser = async (params: FindUserParams): Promise<User | null> => {
    const user = await this.repository.findOne(params);
    if (!user) {
      return null;
    }
    return user;
  };

  getUserHash = async (userId: number): Promise<string> => {
    const _user = await this.repository
      .createQueryBuilder('row')
      .addSelect('row.password')
      .where('row.id = :id', { id: userId })
      .getOne();
    return _user.password;
  };

  getTokens = async (user: User): Promise<Tokens> => {
    const accessToken = await user.createAccessToken();
    const refreshToken = await user.createRefreshToken();
    return { accessToken, refreshToken };
  };

  isMatchingPassword = async (inputPassword: string, hashPassword: string) => {
    return await bcrypt.compare(inputPassword, hashPassword);
  };

  getByEmailAndPassword = async ({ email, password }: ValidateUserParams): Promise<User> => {
    const user = await this.getUser({ email });

    if (!user) {
      throw new ErrorHandler(403, 'Invalid username or password');
    }

    const hash = await this.getUserHash(user.id);
    const valid = await this.isMatchingPassword(password, hash);

    if (!valid) {
      throw new ErrorHandler(403, 'Invalid username or password');
    }
    return this.getUser({ email });
  };

  resetPassword = async ({ resetPasswordToken, resetPasswordExpires, password }: ResetPasswordParams) => {
    const user = await this.repository.findOne({
      resetPasswordToken,
      resetPasswordExpires: MoreThan(resetPasswordExpires),
    });
    if (!user) {
      throw new ErrorHandler(404, 'Token is invalid or expired!');
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    const errors = await validate(user);
    if (errors.length > 0) {
      throw new ClassValidationErrorHandler(errors);
    }

    await this.repository.save(user);
    return user;
  };

  changePassword = async ({ oldPassword, newPassword, id }: ChangePasswordParams): Promise<User> => {
    const user = await this.getUser({ id });
    const hash = await this.getUserHash(id);
    const isCorrectPassword = await this.isMatchingPassword(oldPassword, hash);
    const isSamePassword = await this.isMatchingPassword(newPassword, hash);

    if (!isCorrectPassword) {
      throw new ValidationErrorHandler([{ field: 'password', message: 'Wrong old password!' }]);
    }

    if (isSamePassword) {
      throw new ValidationErrorHandler([{ field: 'password', message: 'Password must be new!' }]);
    }
    user.password = newPassword;
    return await this.repository.save(user);
  };
}

export default new UserService(User);
