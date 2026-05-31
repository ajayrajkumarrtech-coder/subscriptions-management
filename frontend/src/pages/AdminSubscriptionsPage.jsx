import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiBarChart2,
  FiDollarSign,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiUsers,
  FiActivity,
  FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAdminAnalyticsApi, getAdminSubscriptionsApi } from '../api/adminApi';
import AnimatedStatCard from '../components/admin/AnimatedStatCard';
import PlanBreakdownChart from '../components/admin/PlanBreakdownChart';
import PlanSalesGrid from '../components/admin/PlanSalesGrid';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import { PLAN_THEME } from '../constants/adminTheme';
import { formatDate } from '../utils/formatDate';

const AdminSubscriptionsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [tableLoading, setTableLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const { data } = await getAdminAnalyticsApi();
      setAnalytics(data.analytics);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load analytics';
      setAnalyticsError(msg);
      toast.error(
        msg.includes('Route not found')
          ? 'Analytics API missing — restart the backend server'
          : msg
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    setTableLoading(true);
    try {
      const { data } = await getAdminSubscriptionsApi({
        search,
        page: pagination.page,
        limit: pagination.limit,
      });
      setSubscriptions(data.subscriptions);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setTableLoading(false);
    }
  }, [search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const overview = analytics?.overview;
  const planBreakdown = analytics?.planBreakdown ?? [];

  return (
    <div className=" space-y-6 pb-10 sm:space-y-8">
      {/* Page header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="admin-hero"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              <FiBarChart2 size={16} aria-hidden />
              Admin Dashboard
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Revenue & Subscription Insights
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-500 sm:text-base dark:text-slate-400">
              Monitor collected revenue, plan performance, and manage subscriber records in one place.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {overview?.topPlan && !analyticsLoading && (
              <span className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                Top plan: {overview.topPlan}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              disabled={analyticsLoading}
              className="gap-1.5"
            >
              <FiRefreshCw size={14} className={analyticsLoading ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>
        </div>
      </motion.header>

      {analyticsError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900 sm:px-5 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
          role="alert"
        >
          <p className="font-semibold">Analytics could not load</p>
          <p className="mt-1 text-amber-800/90 dark:text-amber-300/90">{analyticsError}</p>
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
            Stop the old backend, then run:{' '}
            <code className="rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/50">
              cd backend &amp;&amp; npm run dev
            </code>
          </p>
          <Button type="button" size="sm" className="mt-3" onClick={fetchAnalytics}>
            Retry
          </Button>
        </motion.div>
      )}

      {/* Overview stats */}
      <section aria-label="Overview statistics">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <AnimatedStatCard
            label="Total Revenue"
            value={overview?.totalRevenue ?? 0}
            prefix="₹"
            icon={FiDollarSign}
            gradient="from-teal-500 to-emerald-600"
            delay={0}
            isCurrency
          />
          <AnimatedStatCard
            label="Active Revenue"
            value={overview?.activeRevenue ?? 0}
            prefix="₹"
            icon={FiActivity}
            gradient="from-rose-500 to-pink-600"
            delay={0.05}
            isCurrency
          />
          <AnimatedStatCard
            label="Total Subscribers"
            value={overview?.totalSubscribers ?? 0}
            icon={FiShoppingBag}
            gradient="from-violet-500 to-purple-600"
            delay={0.1}
          />
          <AnimatedStatCard
            label="Active Subscriptions"
            value={overview?.activeSubscriptions ?? 0}
            icon={FiUsers}
            gradient="from-indigo-500 to-blue-600"
            delay={0.15}
          />
        </div>
      </section>

      {/* Plan sales */}
      <section>
        <div className="mb-3 sm:mb-4">
          <h2 className="admin-section-title">Sales by Plan</h2>
          <p className="admin-section-desc">Subscribed vs unsubscribed counts and revenue for each tier</p>
        </div>
        <PlanSalesGrid planBreakdown={planBreakdown} loading={analyticsLoading} />
      </section>

      {/* Chart + summary */}
      <section className="grid gap-4 lg:grid-cols-5 lg:gap-6">
        <div className="lg:col-span-3">
          <PlanBreakdownChart planBreakdown={planBreakdown} loading={analyticsLoading} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="admin-panel flex flex-col p-4 sm:p-6 lg:col-span-2"
        >
          <div className="mb-4">
            <h3 className="admin-section-title">Quick Summary</h3>
            <p className="admin-section-desc">Subscription health at a glance</p>
          </div>
          {analyticsLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-11 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 flex-col justify-center gap-2.5">
              <SummaryRow label="Total subscriptions" value={overview?.totalSubscriptions} />
              <SummaryRow
                label="Active"
                value={overview?.activeSubscriptions}
                accent="text-emerald-600 dark:text-emerald-400"
              />
              <SummaryRow
                label="Expired"
                value={overview?.expiredSubscriptions}
                accent="text-rose-600 dark:text-rose-400"
              />
              <SummaryRow
                label="Conversion rate"
                value={`${overview?.conversionRate ?? 0}%`}
                accent="text-amber-600 dark:text-amber-400"
              />
            </div>
          )}
        </motion.div>
      </section>

      {/* Subscriptions list */}
      <section className="space-y-4">
        <div>
          <h2 className="admin-section-title">All Subscriptions</h2>
          <p className="admin-section-desc">Search and browse subscriber records</p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <FiSearch
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
              aria-hidden
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, or plan..."
              className="admin-input"
              aria-label="Search subscriptions"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label="Clear search"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Search
          </Button>
        </form>

        {search && (
          <p className="text-sm text-slate-500">
            Showing results for &ldquo;{search}&rdquo;
            <button
              type="button"
              onClick={clearSearch}
              className="ml-2 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Clear
            </button>
          </p>
        )}

        {/* Mobile card list */}
        <div className="space-y-3 md:hidden">
          {tableLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))
          ) : subscriptions.length === 0 ? (
            <EmptyState />
          ) : (
            subscriptions.map((sub) => <SubscriptionCard key={sub.id} sub={sub} />)
          )}
        </div>

        {/* Desktop table */}
        <div className="admin-panel hidden overflow-hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                    User
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                    Plan
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                    Start Date
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                    End Date
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tableLoading ? (
                  [...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3.5 font-medium">{sub.userName}</td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{sub.email}</td>
                      <td className="px-4 py-3.5">
                        <PlanBadge planName={sub.planName} />
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                        {formatDate(sub.startDate)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                        {formatDate(sub.endDate)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={sub.status === 'active' ? 'active' : 'expired'}>
                          {sub.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!tableLoading && subscriptions.length > 0 && (
          <PaginationBar pagination={pagination} setPagination={setPagination} />
        )}
      </section>
    </div>
  );
};

const PlanBadge = ({ planName }) => {
  const theme = PLAN_THEME[planName] || PLAN_THEME.Basic;
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${theme.bg} ${theme.border} ${theme.text}`}
    >
      {planName}
    </span>
  );
};

const SubscriptionCard = ({ sub }) => {
  const theme = PLAN_THEME[sub.planName] || PLAN_THEME.Basic;

  return (
    <article className="admin-sub-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900 dark:text-white">{sub.userName}</p>
          <p className="mt-0.5 truncate text-sm text-slate-500">{sub.email}</p>
        </div>
        <Badge variant={sub.status === 'active' ? 'active' : 'expired'}>{sub.status}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${theme.bg} ${theme.border} ${theme.text}`}
        >
          {sub.planName}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
        <div>
          <dt className="text-xs text-slate-500">Start</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-300">
            {formatDate(sub.startDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">End</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-300">
            {formatDate(sub.endDate)}
          </dd>
        </div>
      </dl>
    </article>
  );
};

const EmptyState = () => (
  <div className="px-4 py-12 text-center">
    <p className="font-medium text-slate-700 dark:text-slate-300">No subscriptions found</p>
    <p className="mt-1 text-sm text-slate-500">Try adjusting your search criteria</p>
  </div>
);

const PaginationBar = ({ pagination, setPagination }) => (
  <div className="admin-panel flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-center text-sm text-slate-500 sm:text-left">
      Page {pagination.page} of {pagination.totalPages}
      <span className="hidden sm:inline"> · {pagination.total} total</span>
    </p>
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pagination.page <= 1}
        onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
        className="flex-1 sm:flex-none"
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={pagination.page >= pagination.totalPages}
        onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
        className="flex-1 sm:flex-none"
      >
        Next
      </Button>
    </div>
  </div>
);

const SummaryRow = ({ label, value, accent = 'text-slate-900 dark:text-white' }) => (
  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3 dark:bg-slate-800/60">
    <span className="text-sm text-slate-500">{label}</span>
    <span className={`text-base font-semibold sm:text-lg ${accent}`}>{value ?? '—'}</span>
  </div>
);

export default AdminSubscriptionsPage;
