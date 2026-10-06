import { Router } from 'express';
import { skillController } from '../controllers/skillController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const skillRoutes = Router();

skillRoutes.get(
  '/',
  asyncHandler(skillController.list.bind(skillController)),
);
