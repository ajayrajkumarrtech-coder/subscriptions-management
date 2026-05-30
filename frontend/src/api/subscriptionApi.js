import axiosInstance from './axiosInstance';

export const subscribeApi = (planId) => axiosInstance.post(`/subscribe/${planId}`);
export const getMySubscriptionApi = () => axiosInstance.get('/my-subscription');
