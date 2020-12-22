import jwt from 'jsonwebtoken';

import { Token } from '../entity/token';
import { ErrorHandler } from '../middleware/error';
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from '../constants';

import { OrmService } from './orm-service';

interface TokenParams {
  refreshToken: string;
}

interface TokenOptions {
  secret: string;
  expiresIn: string;
}

export enum TokenEnum {
  REFRESH = 'REFRESH',
  ACCESS = 'ACCESS',
}

interface TokenPayload {
  user: {
    username: string;
    id: string;
    email: string;
  };
}

class TokenService extends OrmService<Token> {
  saveRefreshToken = async (refreshToken: string): Promise<Token> => {
    const token = new Token();
    token.token = refreshToken;
    token.revoked = false;
    return await this.repository.save(token);
  };

  getTokenOptions = (type: TokenEnum): TokenOptions => {
    if (type === TokenEnum.REFRESH) {
      return { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: REFRESH_TOKEN_EXPIRES_IN };
    }
    return { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: ACCESS_TOKEN_EXPIRES_IN };
  };

  createToken = (payload: TokenPayload, type: TokenEnum): string => {
    const { secret, expiresIn } = this.getTokenOptions(type);

    return jwt.sign(payload, secret, {
      expiresIn,
    });
  };

  generateRefreshToken = async ({ refreshToken }: TokenParams): Promise<string> => {
    const { REFRESH_TOKEN_SECRET } = process.env;

    if (!refreshToken) {
      throw new ErrorHandler(404, 'Token missing!');
    }

    const tokenDoc = await this.repository.findOne({ token: refreshToken });

    if (!tokenDoc) {
      throw new ErrorHandler(401, 'Token expired');
    }

    const payload = jwt.verify(tokenDoc.token, REFRESH_TOKEN_SECRET);
    return this.createToken(payload, TokenEnum.ACCESS);
  };

  remove = async ({ refreshToken }: TokenParams): Promise<boolean> => {
    await this.repository.delete({ token: refreshToken });
    return true;
  };
}

export default new TokenService(Token);
