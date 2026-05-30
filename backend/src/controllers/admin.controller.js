import * as adminService from '../services/admin.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSubscriptions = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const result = await adminService.getAllSubscriptions({ search, page, limit });

  res.json({
    success: true,
    ...result,
  });
});
