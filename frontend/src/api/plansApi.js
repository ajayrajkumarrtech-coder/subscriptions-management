import axiosInstance from './axiosInstance';

export const getPlansApi = () => axiosInstance.get('/plans');
