import axiosInstance from './axiosInstance';

export const getAdminSubscriptionsApi = (params) =>
  axiosInstance.get('/admin/subscriptions', { params });
