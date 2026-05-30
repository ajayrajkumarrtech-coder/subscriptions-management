import { Subscription } from '../models/Subscription.js';
import { Plan } from '../models/Plan.js';
import { AppError } from '../utils/AppError.js';
import { SUBSCRIPTION_STATUS } from '../constants/index.js';
import {
  calculateEndDate,
  getRemainingDays,
  resolveSubscriptionStatus,
} from '../utils/subscriptionUtils.js';

const syncExpiredStatus = async (subscription) => {
  const resolved = resolveSubscriptionStatus(subscription);
  if (resolved === SUBSCRIPTION_STATUS.EXPIRED && subscription.status !== SUBSCRIPTION_STATUS.EXPIRED) {
    subscription.status = SUBSCRIPTION_STATUS.EXPIRED;
    await subscription.save();
  }
  return resolved;
};

export const subscribeToPlan = async (userId, planId) => {
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

  const subscription = await Subscription.create({
    userId,
    planId: plan._id,
    startDate,
    endDate,
    status: SUBSCRIPTION_STATUS.ACTIVE,
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
