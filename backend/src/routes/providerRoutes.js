import { Router } from 'express';
import { idParamSchema } from '../validators/commonSchemas.js';
import { providerController } from '../controllers/providerController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  addSkillSchema,
  providerSearchSchema,
  updateProviderProfileSchema,
} from '../validators/providerSchemas.js';

export const providerRoutes = Router();

providerRoutes.get(
  '/',
  validate(providerSearchSchema),
  asyncHandler(providerController.search.bind(providerController)),
);

providerRoutes.get(
  '/me',
  authenticate,
  authorize('PRESTADOR'),
  asyncHandler(providerController.me.bind(providerController)),
);

providerRoutes.patch(
  '/me',
  authenticate,
  authorize('PRESTADOR'),
  validate(updateProviderProfileSchema),
  asyncHandler(providerController.updateMe.bind(providerController)),
);

providerRoutes.post(
  '/me/habilidades',
  authenticate,
  authorize('PRESTADOR'),
  validate(addSkillSchema),
  asyncHandler(providerController.addSkill.bind(providerController)),
);

providerRoutes.delete(
  '/me/habilidades/:id',
  authenticate,
  authorize('PRESTADOR'),
  validate(idParamSchema),
  asyncHandler(providerController.removeSkill.bind(providerController)),
);

providerRoutes.get(
  '/:id',
  validate(idParamSchema),
  asyncHandler(providerController.getById.bind(providerController)),
);
