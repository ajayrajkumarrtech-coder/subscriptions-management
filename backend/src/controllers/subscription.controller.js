import * as subscriptionService from '../services/subscription.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const subscribe = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.subscribeToPlan(
    req.user._id,
    req.params.planId
  );

  res.status(201).json({
    success: true,
    message: 'Subscribed successfully',
    subscription,
  });
});

export const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.getMySubscription(req.user._id);

  res.json({
    success: true,
    subscription,
  });
});
