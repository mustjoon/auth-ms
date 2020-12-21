import { Router } from 'express';

import * as authController from './controller/auth';
import * as recoverController from './controller/recover';
import * as authMiddleware from './middleware/auth';

const router = Router();

router.post('/auth/signup', authController.signup);

router.post('/auth/login', authController.login);

router.post('/auth/refresh_token', authController.generateRefreshToken);

router.delete('/auth/logout', authController.logout);

router.get('/auth-status', authMiddleware.checkAuth, (req, res) => {
  return res.status(200).json({ user: req.user });
});

router.post('/recover', recoverController.recover);
router.post('/reset/:token', recoverController.reset);

export default router;
