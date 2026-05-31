import axiosInstance from './axiosInstance';

export const getAdminAnalyticsApi = () => axiosInstance.get('/admin/analytics');

export const getAdminSubscriptionsApi = (params) =>
  axiosInstance.get('/admin/subscriptions', { params });
