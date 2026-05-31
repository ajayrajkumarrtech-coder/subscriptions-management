import * as subscriptionService from '../services/subscription.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createPaymentOrder, verifyPaymentSignature } from '../utils/paymentUtils.js';
import { AppError } from '../utils/AppError.js';
import { Plan } from '../models/Plan.js';
import { getRemainingDays } from '../utils/subscriptionUtils.js';

const buildPlanChangeContext = async (userId) => {
  const currentSubscription = await subscriptionService.getActiveSubscriptionForUser(userId);
  if (!currentSubscription) {
    return null;
  }

  const currentPlan = currentSubscription.planId;
  const remainingDays = getRemainingDays(currentSubscription.endDate);

  return {
    currentSubscription,
    currentPlan,
    remainingDays,
  };
};

export const getPlanChangePreviews = asyncHandler(async (req, res) => {
  const context = await buildPlanChangeContext(req.user._id);

  if (!context) {
    return res.json({
      success: true,
      previews: {},
      currentPlan: null,
    });
  }

  const { currentPlan, remainingDays } = context;
  const plans = await Plan.find().sort({ price: 1 });
  const previews = {};

  for (const plan of plans) {
    if (plan._id.toString() === currentPlan._id.toString()) {
      continue;
    }

    const proration = subscriptionService.calculateProratedAmount(currentPlan, plan, remainingDays);
    previews[plan._id.toString()] = {
      planId: plan._id,
      planName: plan.name,
      ...proration,
    };
  }

  res.json({
    success: true,
    currentPlan: {
      id: currentPlan._id,
      name: currentPlan.name,
      price: currentPlan.price,
      duration: currentPlan.duration,
      remainingDays,
    },
    previews,
  });
});

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

// Create payment order for subscription
export const createPaymentOrderApi = asyncHandler(async (req, res) => {
  const { planId } = req.body;

  if (!planId) {
    throw new AppError('Plan ID is required', 400);
  }

  // Check if user already has active subscription
  const existingSubscription = await subscriptionService.getActiveSubscriptionForUser(req.user._id);
  if (existingSubscription) {
    throw new AppError('You already have an active subscription', 400);
  }

  // Get plan details
  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new AppError('Plan not found', 404);
  }

  // Create Razorpay order
  const order = await createPaymentOrder(
    plan.price,
    planId,
    req.user._id.toString(),
    `Subscribe to ${plan.name} plan`
  );

  res.json({
    success: true,
    order,
    planPrice: plan.price,
  });
});

// Verify payment and complete subscription
export const verifyPaymentAndSubscribe = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, planId } = req.body;

  if (!orderId || !paymentId || !signature || !planId) {
    throw new AppError('Missing required payment details', 400);
  }

  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new AppError('Plan not found', 404);
  }

  verifyPaymentSignature(orderId, paymentId, signature);

  const subscription = await subscriptionService.subscribeToPlan(
    req.user._id,
    planId,
    plan.price
  );

  res.status(201).json({
    success: true,
    message: 'Payment verified and subscribed successfully',
    subscription,
  });
});

// Create payment order for upgrade/downgrade
export const createUpgradeDowngradeOrder = asyncHandler(async (req, res) => {
  const { newPlanId } = req.body;

  if (!newPlanId) {
    throw new AppError('New plan ID is required', 400);
  }

  const context = await buildPlanChangeContext(req.user._id);
  if (!context) {
    throw new AppError('No active subscription found', 404);
  }

  const { currentPlan, remainingDays } = context;

  const newPlan = await Plan.findById(newPlanId);
  if (!newPlan) {
    throw new AppError('New plan not found', 404);
  }

  if (currentPlan._id.toString() === newPlanId) {
    throw new AppError('Cannot upgrade/downgrade to the same plan', 400);
  }

  const proration = subscriptionService.calculateProratedAmount(
    currentPlan,
    newPlan,
    remainingDays
  );

  if (proration.noPaymentNeeded) {
    const result = await subscriptionService.upgradeDowngradePlan(
      req.user._id,
      newPlanId,
      null,
      0
    );
    return res.json({
      success: true,
      message:
        proration.creditsGiven > 0
          ? `Plan changed successfully. Credit of ₹${proration.creditsGiven.toFixed(2)} applied.`
          : 'Plan changed successfully',
      subscription: result.subscription,
      proration,
      noPaymentNeeded: true,
    });
  }

  const order = await createPaymentOrder(
    proration.proratedAmount,
    newPlanId,
    req.user._id.toString(),
    `Change to ${newPlan.name} plan`,
    {
      remainingDays,
      unusedCredit: proration.unusedCredit,
      newPlanPrice: proration.newPlanPrice,
      currentPlanName: currentPlan.name,
      newPlanName: newPlan.name,
    }
  );

  res.json({
    success: true,
    order,
    proration,
    currentPlan: currentPlan.name,
    newPlan: newPlan.name,
  });
});

// Verify payment and complete upgrade/downgrade
export const verifyPaymentAndUpgradeDowngrade = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, newPlanId } = req.body;

  if (!orderId || !paymentId || !signature || !newPlanId) {
    throw new AppError('Missing required payment details', 400);
  }

  verifyPaymentSignature(orderId, paymentId, signature);

  const context = await buildPlanChangeContext(req.user._id);
  if (!context) {
    throw new AppError('No active subscription found', 404);
  }

  const { currentPlan, remainingDays } = context;
  const newPlan = await Plan.findById(newPlanId);
  if (!newPlan) {
    throw new AppError('New plan not found', 404);
  }

  const proration = subscriptionService.calculateProratedAmount(
    currentPlan,
    newPlan,
    remainingDays
  );

  const result = await subscriptionService.upgradeDowngradePlan(
    req.user._id,
    newPlanId,
    paymentId,
    proration.proratedAmount
  );

  res.json({
    success: true,
    message: 'Payment verified and plan updated successfully',
    subscription: result.subscription,
    proration: {
      proratedAmount: result.proratedAmount,
      creditsGiven: result.creditsGiven,
    },
  });
});
