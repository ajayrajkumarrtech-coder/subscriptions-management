import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';

const AnimatedStatCard = ({
  label,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  gradient,
  delay = 0,
  isCurrency = false,
}) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const animated = useCountUp(numericValue, 1400, true);

  const display = isCurrency
    ? `${prefix}${animated.toLocaleString('en-IN')}${suffix}`
    : `${prefix}${animated}${suffix}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="admin-stat-card group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {display}
          </p>
        </div>
        {Icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white sm:h-11 sm:w-11 ${gradient}`}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className={`mt-4 h-0.5 rounded-full bg-gradient-to-r opacity-60 ${gradient}`} />
    </motion.div>
  );
};

export default AnimatedStatCard;
