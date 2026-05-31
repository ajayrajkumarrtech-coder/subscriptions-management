import axiosInstance from './axiosInstance';

export const subscribeApi = (planId) => axiosInstance.post(`/subscribe/${planId}`);
export const getMySubscriptionApi = () => axiosInstance.get('/my-subscription');

export const getPlanChangePreviewsApi = () => axiosInstance.get('/plan-change-previews');

// Payment APIs
export const createPaymentOrderApi = (planId) =>
  axiosInstance.post('/payment/create-order', { planId });

export const verifyPaymentAndSubscribeApi = (orderId, paymentId, signature, planId) =>
  axiosInstance.post('/payment/verify', {
    orderId,
    paymentId,
    signature,
    planId,
  });

// Upgrade/Downgrade APIs
export const createUpgradeDowngradeOrderApi = (newPlanId) =>
  axiosInstance.post('/upgrade-downgrade/create-order', { newPlanId });

export const verifyPaymentAndUpgradeDowngradeApi = (orderId, paymentId, signature, newPlanId) =>
  axiosInstance.post('/upgrade-downgrade/verify', {
    orderId,
    paymentId,
    signature,
    newPlanId,
  });
