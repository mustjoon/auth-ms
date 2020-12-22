import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import { ErrorHandler } from './error';

export const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.get('Authorization');
  const privateKey = process.env.ACCESS_TOKEN_SECRET;

  if (!token) {
    throw new ErrorHandler(401, 'Access denied');
  } else {
    try {
      //if the incoming request has a valid token, we extract the payload from the token and attach it to the request object.
      const payload = jwt.verify(token, privateKey);
      req.user = payload.user;

      next();
    } catch (error) {
      // token can be expired or invalid. Send appropriate errors in each case:
      if (error.name === 'TokenExpiredError') {
        throw new ErrorHandler(401, 'Session timed out,please login again');
      } else if (error.name === 'JsonWebTokenError') {
        throw new ErrorHandler(401, 'Invalid token');
      } else {
        //catch other unprecedented errors

        throw new ErrorHandler(401, error);
      }
    }
  }
};
