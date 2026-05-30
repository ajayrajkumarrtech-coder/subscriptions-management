import { SUBSCRIPTION_STATUS } from '../constants/index.js';

export const calculateEndDate = (startDate, durationDays) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
};

export const getRemainingDays = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

export const resolveSubscriptionStatus = (subscription) => {
  if (!subscription) return null;
  const now = new Date();
  if (new Date(subscription.endDate) < now) {
    return SUBSCRIPTION_STATUS.EXPIRED;
  }
  return subscription.status === SUBSCRIPTION_STATUS.EXPIRED
    ? SUBSCRIPTION_STATUS.EXPIRED
    : SUBSCRIPTION_STATUS.ACTIVE;
};
