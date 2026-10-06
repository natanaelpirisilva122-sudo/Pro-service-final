import { Router } from 'express';
import { idParamSchema } from '../validators/commonSchemas.js';
import { serviceController } from '../controllers/serviceController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createServiceSchema,
  listServicesSchema,
  updateStatusSchema,
} from '../validators/serviceSchemas.js';

export const serviceRoutes = Router();

serviceRoutes.use(authenticate);

serviceRoutes.post(
  '/',
  authorize('CLIENTE'),
  validate(createServiceSchema),
  asyncHandler(serviceController.create.bind(serviceController)),
);

serviceRoutes.get(
  '/meus',
  validate(listServicesSchema),
  asyncHandler(serviceController.listMine.bind(serviceController)),
);

serviceRoutes.get(
  '/oportunidades',
  authorize('PRESTADOR'),
  validate(listServicesSchema),
  asyncHandler(serviceController.opportunities.bind(serviceController)),
);

serviceRoutes.patch(
  '/:id/status',
  validate(updateStatusSchema),
  asyncHandler(serviceController.updateStatus.bind(serviceController)),
);

serviceRoutes.get(
  '/:id',
  validate(idParamSchema),
  asyncHandler(serviceController.getById.bind(serviceController)),
);
