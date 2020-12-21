import { Response, Request, NextFunction } from 'express';

import userService from '../service/user';
import tokenService from '../service/token';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.create(req.body);
    const { accessToken, refreshToken } = await userService.getTokens(user);
    return res.status(201).json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { accessToken, refreshToken } = await userService.validateUserLogin(req.body);
    return res.status(201).json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const generateRefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accessToken = await tokenService.generateRefreshToken(req.body);
    return res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await tokenService.remove(req.body);
    return res.status(200).json({ success: 'User logged out!' });
  } catch (error) {
    next(error);
  }
};
