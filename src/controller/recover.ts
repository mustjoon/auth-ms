import { NextFunction, Request, Response } from 'express';

import { ErrorHandler } from '../helpers/error';
import userService from '../service/user';
import mailerService from '../service/mailer';

export const recover = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.findOne({ email: req.body.email });
    if (!user) {
      throw new ErrorHandler(404, 'User not found');
    }

    user.generatePasswordReset();
    await userService.save(user);
    await mailerService.sendRecoveryMail(user);
    res.status(200).json({ message: 'OK' });
  } catch (err) {
    next(err);
  }
};

export const reset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.findOne({ email: req.body.email });
    if (!user) {
      throw new ErrorHandler(404, 'User not found');
    }

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let user = await userService.findOne({ email: req.body.email });
    if (!user) {
      throw new ErrorHandler(404, 'User not found');
    }
    const params = {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: new Date(),
      password: req.body.password,
    };
    user = await userService.resetPassword(params);
    await mailerService.sendPasswordChangedConfirmMail(user);

    res.status(200).json({ message: 'Success!' });
  } catch (err) {
    next(err);
  }
};
