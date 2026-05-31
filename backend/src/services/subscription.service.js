import { Subscription } from '../models/Subscription.js';
import { Plan } from '../models/Plan.js';
import { AppError } from '../utils/AppError.js';
import { SUBSCRIPTION_STATUS } from '../constants/index.js';
import {
  calculateEndDate,
  getRemainingDays,
  resolveSubscriptionStatus,
} from '../utils/subscriptionUtils.js';
import { calculateProratedAmount } from '../utils/prorationUtils.js';

const syncExpiredStatus = async (subscription) => {
  const resolved = resolveSubscriptionStatus(subscription);
  if (resolved === SUBSCRIPTION_STATUS.EXPIRED && subscription.status !== SUBSCRIPTION_STATUS.EXPIRED) {
    subscription.status = SUBSCRIPTION_STATUS.EXPIRED;
    await subscription.save();
  }
  return resolved;
};

export const subscribeToPlan = async (userId, planId, amountPaid = null) => {
  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new AppError('Plan not found', 404);
  }

  const activeSubscription = await Subscription.findOne({
    userId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    endDate: { $gte: new Date() },
  });

  if (activeSubscription) {
    throw new AppError('You already have an active subscription', 400);
  }

  const startDate = new Date();
  const endDate = calculateEndDate(startDate, plan.duration);
  const paid = amountPaid != null ? amountPaid : plan.price;

  const subscription = await Subscription.create({
    userId,
    planId: plan._id,
    startDate,
    endDate,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    amountPaid: paid,
  });

  return subscription.populate('planId');
};

export const getMySubscription = async (userId) => {
  const subscription = await Subscription.findOne({ userId })
    .populate('planId')
    .sort({ createdAt: -1 });

  if (!subscription) {
    return null;
  }

  const status = await syncExpiredStatus(subscription);
  const plan = subscription.planId;

  return {
    id: subscription._id,
    plan: plan.name,
    price: plan.price,
    features: plan.features,
    duration: plan.duration,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    status,
    remainingDays: status === SUBSCRIPTION_STATUS.ACTIVE ? getRemainingDays(subscription.endDate) : 0,
    planId: plan._id,
  };
};

export const getActiveSubscriptionForUser = async (userId) => {
  const subscription = await Subscription.findOne({
    userId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    endDate: { $gte: new Date() },
  }).populate('planId');

  if (!subscription) return null;
  await syncExpiredStatus(subscription);
  if (subscription.status === SUBSCRIPTION_STATUS.EXPIRED) return null;
  return subscription;
};

// Re-export for controllers and tests
export { calculateProratedAmount };

export const upgradeDowngradePlan = async (userId, newPlanId, paymentId = null, amountPaid = null) => {
  const newPlan = await Plan.findById(newPlanId);
  if (!newPlan) {
    throw new AppError('New plan not found', 404);
  }

  const currentSubscription = await getActiveSubscriptionForUser(userId);
  if (!currentSubscription) {
    throw new AppError('No active subscription found', 404);
  }

  const currentPlan = currentSubscription.planId;

  // Check if same plan
  if (currentPlan._id.toString() === newPlanId) {
    throw new AppError('Cannot upgrade/downgrade to the same plan', 400);
  }

  const remainingDays = getRemainingDays(currentSubscription.endDate);
  const proration = calculateProratedAmount(currentPlan, newPlan, remainingDays);
  const paid =
    amountPaid != null ? amountPaid : proration.noPaymentNeeded ? 0 : proration.proratedAmount;

  const newStartDate = new Date();
  const newEndDate = calculateEndDate(newStartDate, newPlan.duration);

  currentSubscription.status = SUBSCRIPTION_STATUS.EXPIRED;
  await currentSubscription.save();

  const newSubscription = await Subscription.create({
    userId,
    planId: newPlan._id,
    startDate: newStartDate,
    endDate: newEndDate,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    amountPaid: paid,
  });

  return {
    subscription: await newSubscription.populate('planId'),
    proratedAmount: proration.proratedAmount,
    creditsGiven: proration.creditsGiven,
    paymentId,
  };
};
