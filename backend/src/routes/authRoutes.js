import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema, registerSchema } from '../validators/authSchemas.js';

export const authRoutes = Router();

authRoutes.post(
  '/cadastro',
  authLimiter,
  validate(registerSchema),
  asyncHandler(authController.register.bind(authController)),
);

authRoutes.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(authController.login.bind(authController)),
);

authRoutes.get(
  '/me',
  authenticate,
  asyncHandler(authController.me.bind(authController)),
);
