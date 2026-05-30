import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { adminSubscriptionsQuerySchema } from '../validations/admin.validation.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.get(
  '/subscriptions',
  protect,
  authorize(ROLES.ADMIN),
  validate(adminSubscriptionsQuerySchema, 'query'),
  adminController.getSubscriptions
);

export default router;
