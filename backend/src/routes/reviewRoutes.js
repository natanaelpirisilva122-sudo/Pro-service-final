import { Router } from 'express';
import { idParamSchema } from '../validators/commonSchemas.js';
import { reviewController } from '../controllers/reviewController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createReviewSchema } from '../validators/reviewSchemas.js';

export const reviewRoutes = Router();

reviewRoutes.post(
  '/',
  authenticate,
  authorize('CLIENTE'),
  validate(createReviewSchema),
  asyncHandler(reviewController.create.bind(reviewController)),
);

reviewRoutes.get(
  '/prestador/:id',
  validate(idParamSchema),
  asyncHandler(reviewController.listByProvider.bind(reviewController)),
);
