import { useEffect, useState } from 'react';
import { FiCheck, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getPlansApi } from '../api/plansApi';
import { getMySubscriptionApi, subscribeApi } from '../api/subscriptionApi';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PaymentModal from '../components/PaymentModal';
import { PlanCardSkeleton } from '../components/ui/Skeleton';
import { formatCurrency } from '../utils/formatDate';
import { SUBSCRIPTION_STATUS } from '../constants';

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([getPlansApi(), getMySubscriptionApi()]);
      setPlans(plansRes.data.plans);
      setSubscription(subRes.data.subscription);
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubscribeClick = (plan) => {
    if (subscription?.status === SUBSCRIPTION_STATUS.ACTIVE) {
      toast.error('You already have an active subscription');
      return;
    }
    setSelectedPlan(plan);
    setPaymentOpen(true);
  };

  const handlePaymentConfirm = async () => {
    setSubscribing(true);
    try {
      await subscribeApi(selectedPlan._id);
      toast.success('Subscribed successfully!');
      setPaymentOpen(false);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  const isActivePlan = (planId) =>
    subscription?.status === SUBSCRIPTION_STATUS.ACTIVE &&
    subscription?.planId?.toString() === planId?.toString();

  const featuredIndex = 1;

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Choose Your Plan</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Flexible pricing for teams of every size. Upgrade anytime.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, index) => {
            const isFeatured = index === featuredIndex;
            const isActive = isActivePlan(plan._id);

            return (
              <div
                key={plan._id}
                className={`relative flex flex-col rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-xl ${
                  isFeatured
                    ? 'border-indigo-500 bg-gradient-to-b from-indigo-50 to-white shadow-lg shadow-indigo-500/10 dark:from-indigo-950/50 dark:to-slate-900'
                    : 'glass-card'
                }`}
              >
                {isFeatured && (
                  <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                    <FiStar size={12} /> Popular
                  </span>
                )}
                {isActive && (
                  <Badge variant="active" className="absolute right-4 top-4">
                    Current Plan
                  </Badge>
                )}

                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className="text-sm text-slate-500">/ {plan.duration} days</span>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <FiCheck className="mt-0.5 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-6 w-full"
                  variant={isFeatured ? 'primary' : 'outline'}
                  disabled={isActive || subscription?.status === SUBSCRIPTION_STATUS.ACTIVE}
                  onClick={() => handleSubscribeClick(plan)}
                >
                  {isActive ? 'Current Plan' : 'Subscribe'}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        plan={selectedPlan}
        onConfirm={handlePaymentConfirm}
        isLoading={subscribing}
      />
    </div>
  );
};

export default PlansPage;
