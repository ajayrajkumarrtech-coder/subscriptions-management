import { motion } from 'framer-motion';
import { PLAN_THEME } from '../../constants/adminTheme';
import { formatCurrency } from '../../utils/formatDate';

const PlanBreakdownChart = ({ planBreakdown = [], loading }) => {
  const maxSubscribed = Math.max(...planBreakdown.map((p) => p.subscribed ?? p.activeSubscribers ?? 0), 1);

  if (loading) {
    return (
      <div className="admin-panel p-4 sm:p-6">
        <div className="mb-5 h-5 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="admin-panel p-4 sm:p-6"
    >
      <div className="mb-5">
        <h2 className="admin-section-title">Plan Distribution</h2>
        <p className="admin-section-desc">Active vs expired subscribers and revenue per tier</p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {planBreakdown.map((item, index) => {
          const theme = PLAN_THEME[item.plan] || PLAN_THEME.Basic;
          const subscribed = item.subscribed ?? item.activeSubscribers ?? 0;
          const unsubscribed = item.unsubscribed ?? Math.max(0, (item.subscribers ?? 0) - subscribed);
          const width = `${(subscribed / maxSubscribed) * 100}%`;

          return (
            <motion.div
              key={item.plan}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.06 * index, duration: 0.3 }}
            >
              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${theme.bg} ${theme.border} ${theme.text}`}
                  >
                    {item.plan}
                  </span>
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    {subscribed} subscribed
                  </span>
                  <span className="text-sm text-rose-500 dark:text-rose-400">
                    {unsubscribed} unsubscribed
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {formatCurrency(item.activeRevenue ?? 0)} active
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                  className={`h-full rounded-full ${theme.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width }}
                  transition={{ duration: 0.7, delay: 0.1 * index, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Lifetime revenue {formatCurrency(item.lifetimeRevenue ?? item.revenue ?? 0)} ·{' '}
                {item.subscribers ?? subscribed + unsubscribed} total records
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PlanBreakdownChart;
