import * as adminService from '../services/admin.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminService.getAnalytics();

  res.json({
    success: true,
    analytics,
  });
});

export const getSubscriptions = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const result = await adminService.getAllSubscriptions({ search, page, limit });

  res.json({
    success: true,
    ...result,
  });
});
