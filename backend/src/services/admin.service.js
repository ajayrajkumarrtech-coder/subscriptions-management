import { Subscription } from '../models/Subscription.js';
import { DEFAULT_PAGE_SIZE } from '../constants/index.js';
import { resolveSubscriptionStatus } from '../utils/subscriptionUtils.js';

export const getAllSubscriptions = async ({ search = '', page = 1, limit = DEFAULT_PAGE_SIZE }) => {
  const skip = (page - 1) * limit;

  const subscriptions = await Subscription.find()
    .populate('userId', 'name email')
    .populate('planId', 'name')
    .sort({ createdAt: -1 })
    .lean();

  let formatted = subscriptions.map((sub) => ({
    id: sub._id,
    userName: sub.userId?.name || 'Unknown',
    email: sub.userId?.email || 'Unknown',
    planName: sub.planId?.name || 'Unknown',
    status: resolveSubscriptionStatus(sub),
    startDate: sub.startDate,
    endDate: sub.endDate,
  }));

  if (search) {
    const term = search.toLowerCase();
    formatted = formatted.filter(
      (s) =>
        s.userName.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.planName.toLowerCase().includes(term)
    );
  }

  const total = formatted.length;
  const paginated = formatted.slice(skip, skip + limit);

  return {
    subscriptions: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};
