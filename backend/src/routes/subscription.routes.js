import { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/subscribe/:planId', protect, subscriptionController.subscribe);
router.get('/my-subscription', protect, subscriptionController.getMySubscription);

export default router;
