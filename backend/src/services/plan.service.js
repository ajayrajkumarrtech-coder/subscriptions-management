import { Plan } from '../models/Plan.js';

export const getAllPlans = async () => {
  return Plan.find().sort({ price: 1 }).lean();
};

export const getPlanById = async (planId) => {
  return Plan.findById(planId);
};
