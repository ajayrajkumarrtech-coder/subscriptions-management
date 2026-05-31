import { motion } from 'framer-motion';
import { FiTrendingDown, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { PLAN_THEME } from '../../constants/adminTheme';
import { formatCurrency } from '../../utils/formatDate';
import { useCountUp } from '../../hooks/useCountUp';

const PlanSalesCard = ({ item, index }) => {
  const theme = PLAN_THEME[item.plan] || PLAN_THEME.Basic;
  const subscribed = useCountUp(item.subscribed ?? item.activeSubscribers ?? 0, 1000 + index * 100);
  const unsubscribed = item.unsubscribed ?? Math.max(0, (item.subscribers ?? 0) - (item.activeSubscribers ?? 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.35 }}
      className={`admin-panel relative overflow-hidden p-4 sm:p-5 ${theme.border}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.gradient}`} />
      <div className="relative">
        <p className={`text-xs font-semibold uppercase tracking-wide ${theme.text}`}>{item.plan}</p>
        <p className="mt-1 text-xs text-slate-500">{formatCurrency(item.price)} / plan</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-950/30">
            <p className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <FiUsers size={12} aria-hidden />
              Subscribed
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{subscribed}</p>
          </div>
          <div className="rounded-lg bg-rose-50 p-2.5 dark:bg-rose-950/30">
            <p className="flex items-center gap-1 text-xs font-medium text-rose-700 dark:text-rose-400">
              <FiTrendingDown size={12} aria-hidden />
              Unsubscribed
            </p>
            <p className="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-300">{unsubscribed}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Active revenue</span>
            <span className={`flex items-center gap-1 font-semibold ${theme.text}`}>
              <FiTrendingUp size={14} aria-hidden />
              {formatCurrency(item.activeRevenue ?? 0)}
            </span>
          </div>
         
        </div>
      </div>
    </motion.div>
  );
};

const PlanSalesGrid = ({ planBreakdown = [], loading }) => {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {planBreakdown.map((item, index) => (
        <PlanSalesCard key={item.plan} item={item} index={index} />
      ))}
    </div>
  );
};

export default PlanSalesGrid;
