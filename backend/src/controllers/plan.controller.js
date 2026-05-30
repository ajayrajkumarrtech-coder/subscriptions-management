import * as planService from '../services/plan.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPlans = asyncHandler(async (req, res) => {
  const plans = await planService.getAllPlans();

  res.json({
    success: true,
    plans,
  });
});
