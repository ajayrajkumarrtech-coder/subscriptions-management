import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiCreditCard, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { getMySubscriptionApi } from '../api/subscriptionApi';
import { selectUser } from '../features/auth/authSlice';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../utils/formatDate';
import { SUBSCRIPTION_STATUS } from '../constants';

const statusVariant = {
  active: 'active',
  expired: 'expired',
};

const DashboardPage = () => {
  const user = useSelector(selectUser);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data } = await getMySubscriptionApi();
        setSubscription(data.subscription);
      } catch {
        toast.error('Failed to load subscription');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  const hasSubscription = !!subscription;
  const status = subscription?.status || 'none';

  const stats = [
    {
      label: 'Current Plan',
      value: subscription?.plan || 'No Plan',
      icon: FiPackage,
      color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40',
    },
    {
      label: 'Price',
      value: subscription ? formatCurrency(subscription.price) : '—',
      icon: FiCreditCard,
      color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/40',
    },
    {
      label: 'Days Remaining',
      value: hasSubscription ? subscription.remainingDays : '—',
      icon: FiClock,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40',
    },
    {
      label: 'End Date',
      value: subscription ? formatDate(subscription.endDate) : '—',
      icon: FiCalendar,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="glass-card overflow-hidden">
        <div className="gradient-bg px-6 py-8 text-white sm:px-8">
          <p className="text-indigo-100">Welcome back,</p>
          <h1 className="mt-1 text-3xl font-bold">{user?.name}</h1>
          <p className="mt-2 text-indigo-100">Manage your subscription from one place.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card flex items-center gap-4 p-5">
            <div className={`rounded-xl p-3 ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{stat.label}</p>
              {loading ? (
                <Skeleton className="mt-1 h-6 w-20" />
              ) : (
                <p className="text-lg font-bold">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Subscription Details</h2>
          {loading ? (
            <Skeleton className="h-6 w-16 rounded-full" />
          ) : (
            <Badge variant={statusVariant[status] || 'none'}>
              {hasSubscription ? status : 'No Subscription'}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : hasSubscription ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Plan</p>
              <p className="font-semibold">{subscription.plan}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Price</p>
              <p className="font-semibold">{formatCurrency(subscription.price)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Start Date</p>
              <p className="font-semibold">{formatDate(subscription.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">End Date</p>
              <p className="font-semibold">{formatDate(subscription.endDate)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm text-slate-500">Features</p>
              <ul className="flex flex-wrap gap-2">
                {subscription.features?.map((f) => (
                  <li
                    key={f}
                    className="rounded-lg bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-slate-500">You don&apos;t have an active subscription yet.</p>
            <Link to="/plans">
              <Button className="mt-4">Browse Plans</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
