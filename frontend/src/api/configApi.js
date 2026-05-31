import axiosInstance from './axiosInstance';

export const getPublicConfigApi = () => axiosInstance.get('/config');
