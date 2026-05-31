import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';
import { Plan } from '../models/Plan.js';
import { DEFAULT_PAGE_SIZE, ROLES, SUBSCRIPTION_STATUS } from '../constants/index.js';
import { resolveSubscriptionStatus } from '../utils/subscriptionUtils.js';
import { roundMoney } from '../utils/prorationUtils.js';

/**
 * Collected revenue for a subscription row.
 * Uses stored amountPaid when available; legacy rows without amountPaid only
 * count plan price while still active (avoids inflating total on expired upgrades).
 */
const getCollectedAmount = (sub, isActive) => {
  if (sub.amountPaid != null && sub.amountPaid >= 0) {
    return roundMoney(sub.amountPaid);
  }
  if (isActive) {
    return roundMoney(sub.planId?.price ?? 0);
  }
  return 0;
};

export const getAnalytics = async () => {
  const [subscriptions, plans, totalUsers] = await Promise.all([
    Subscription.find().populate('planId', 'name price').lean(),
    Plan.find().sort({ price: 1 }).lean(),
    User.countDocuments({ role: ROLES.USER }),
  ]);

  const planBreakdown = plans.map((p) => ({
    plan: p.name,
    planId: p._id,
    price: p.price,
    subscribed: 0,
    unsubscribed: 0,
    activeRevenue: 0,
    lifetimeRevenue: 0,
    subscribers: 0,
    activeSubscribers: 0,
    revenue: 0,
  }));

  const breakdownByName = Object.fromEntries(planBreakdown.map((p) => [p.plan, p]));

  let totalRevenue = 0;
  let activeRevenue = 0;
  let activeSubscriptions = 0;
  let expiredSubscriptions = 0;
  const uniqueSubscribers = new Set();

  subscriptions.forEach((sub) => {
    const planName = sub.planId?.name || 'Unknown';
    const status = resolveSubscriptionStatus(sub);
    const isActive = status === SUBSCRIPTION_STATUS.ACTIVE;
    const collected = getCollectedAmount(sub, isActive);

    totalRevenue += collected;
    uniqueSubscribers.add(String(sub.userId));

    if (isActive) {
      activeSubscriptions += 1;
      activeRevenue += collected;
    } else {
      expiredSubscriptions += 1;
    }

    const row = breakdownByName[planName];
    if (row) {
      row.lifetimeRevenue += collected;
      row.revenue += collected;
      row.subscribers += 1;

      if (isActive) {
        row.subscribed += 1;
        row.activeSubscribers += 1;
        row.activeRevenue += collected;
      } else {
        row.unsubscribed += 1;
      }
    }
  });

  planBreakdown.forEach((row) => {
    row.lifetimeRevenue = roundMoney(row.lifetimeRevenue);
    row.activeRevenue = roundMoney(row.activeRevenue);
    row.revenue = row.lifetimeRevenue;
  });

  const topPlan = [...planBreakdown].sort((a, b) => b.subscribed - a.subscribed)[0];

  return {
    overview: {
      totalRevenue: roundMoney(totalRevenue),
      activeRevenue: roundMoney(activeRevenue),
      totalSubscriptions: subscriptions.length,
      activeSubscriptions,
      expiredSubscriptions,
      totalSubscribers: uniqueSubscribers.size,
      totalUsers,
      conversionRate:
        totalUsers > 0
          ? Math.round((uniqueSubscribers.size / totalUsers) * 100)
          : 0,
      topPlan: topPlan?.plan ?? null,
    },
    planBreakdown,
  };
};

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
