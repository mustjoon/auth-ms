import { Response, Request, NextFunction } from 'express';

import userService from '../service/user';
import tokenService from '../service/token';

const cookieOptions = {
  maxAge: 1000 * 60 * 60 * 24, // 24h
  httpOnly: true,
  signed: true,
  secure: false, // only on https
};

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.create(req.body);
    const { accessToken, refreshToken } = await userService.generateTokens(user);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    return res.status(201).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.getByEmailAndPassword(req.body);
    const { accessToken, refreshToken } = await userService.generateTokens(user);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    return res.status(201).json({ accessToken });
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

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;
    const params = {
      id,
      oldPassword,
      newPassword,
    };
    await userService.changePassword(params);
    return res.status(200).json({ success: 'success' });
  } catch (error) {
    next(error);
  }
};
