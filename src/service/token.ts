import jwt from 'jsonwebtoken';

import { User } from '../entity/user';
import { Token } from '../entity/token';
import { ErrorHandler } from '../helpers/error';

import { OrmService } from './orm-service';
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from '../constants';

interface TokenParams {
  refreshToken: string;
}
class TokenService extends OrmService<Token> {
  createTokenForUser = async (user: User): Promise<Token> => {
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
    const { id, username } = user;
    const refreshToken = jwt.sign({ user: { id, username } }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    const token = new Token();
    token.token = refreshToken;
    token.revoked = false;
    await this.repository.save(token);
    return token;
  };

  generateRefreshToken = async ({ refreshToken }: TokenParams): Promise<string> => {
    const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

    if (!refreshToken) {
      throw new ErrorHandler(404, 'Token missing!');
    }

    const tokenDoc = await this.repository.findOne({ token: refreshToken });

    if (!tokenDoc) {
      throw new ErrorHandler(401, 'Token expired');
    }

    const payload = jwt.verify(tokenDoc.token, REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ user: payload }, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    return accessToken;
  };

  remove = async ({ refreshToken }: TokenParams): Promise<boolean> => {
    await this.repository.delete({ token: refreshToken });
    return true;
  };
}

export default new TokenService(Token);
