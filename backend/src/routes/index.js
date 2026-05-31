import { Router } from 'express';
import authRoutes from './auth.routes.js';
import planRoutes from './plan.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import adminRoutes from './admin.routes.js';
import { getPublicConfig } from '../controllers/config.controller.js';

const router = Router();

router.get('/config', getPublicConfig);
router.use('/auth', authRoutes);
router.use('/plans', planRoutes);
router.use('/', subscriptionRoutes);
router.use('/admin', adminRoutes);

export default router;
