import { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/subscribe/:planId', protect, subscriptionController.subscribe);
router.get('/my-subscription', protect, subscriptionController.getMySubscription);
router.get('/plan-change-previews', protect, subscriptionController.getPlanChangePreviews);

// Payment routes
router.post('/payment/create-order', protect, subscriptionController.createPaymentOrderApi);
router.post('/payment/verify', protect, subscriptionController.verifyPaymentAndSubscribe);

// Upgrade/Downgrade routes
router.post('/upgrade-downgrade/create-order', protect, subscriptionController.createUpgradeDowngradeOrder);
router.post('/upgrade-downgrade/verify', protect, subscriptionController.verifyPaymentAndUpgradeDowngrade);

export default router;
