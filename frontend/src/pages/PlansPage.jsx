import { useEffect, useState } from 'react';
import { FiCheck, FiStar } from 'react-icons/fi';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import 'sweetalert2/dist/sweetalert2.min.css';
import { getPlansApi } from '../api/plansApi';
import {
  getMySubscriptionApi,
  createPaymentOrderApi,
  verifyPaymentAndSubscribeApi,
  createUpgradeDowngradeOrderApi,
  verifyPaymentAndUpgradeDowngradeApi,
  getPlanChangePreviewsApi,
} from '../api/subscriptionApi';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PaymentModal from '../components/PaymentModal';
import { PlanCardSkeleton } from '../components/ui/Skeleton';
import { formatCurrency } from '../utils/formatDate';
import { SUBSCRIPTION_STATUS } from '../constants';

const formatInr = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [planPreviews, setPlanPreviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [proration, setProration] = useState(null);
  const [isPlanChangeMode, setIsPlanChangeMode] = useState(false);

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([getPlansApi(), getMySubscriptionApi()]);
      setPlans(plansRes.data.plans);
      setSubscription(subRes.data.subscription);

      if (subRes.data.subscription?.status === SUBSCRIPTION_STATUS.ACTIVE) {
        const { data } = await getPlanChangePreviewsApi();
        setPlanPreviews(data.previews ?? {});
      } else {
        setPlanPreviews({});
      }
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPreview = (planId) => planPreviews[planId?.toString()];

  const getPlanAction = (plan) => {
    if (subscription?.status !== SUBSCRIPTION_STATUS.ACTIVE) return 'subscribe';
    if (subscription?.planId?.toString() === plan._id?.toString()) return 'current';

    const preview = getPreview(plan._id);
    if (preview?.isUpgrade) return 'upgrade';
    if (preview) return 'downgrade';
    return plan.price > subscription.price ? 'upgrade' : 'downgrade';
  };

  const confirmPlanWithSwal = async (plan) => {
    const action = getPlanAction(plan);
    const hasActive = subscription?.status === SUBSCRIPTION_STATUS.ACTIVE;
    const preview = getPreview(plan._id);

    const actionLabels = {
      subscribe: 'Subscribe',
      upgrade: 'Upgrade Plan',
      downgrade: 'Downgrade Plan',
    };

    const activePlanHtml = hasActive
      ? `<div class="swal-plan-row swal-plan-current">
           <span class="swal-plan-label">Current plan</span>
           <strong>${subscription.plan}</strong>
           <span class="swal-plan-meta">${formatCurrency(subscription.price)} · ${subscription.remainingDays} days left</span>
         </div>`
      : '';

    const selectedPlanHtml = `<div class="swal-plan-row swal-plan-selected">
        <span class="swal-plan-label">${hasActive ? 'New plan' : 'Selected plan'}</span>
        <strong>${plan.name}</strong>
        <span class="swal-plan-meta">${formatCurrency(plan.price)} · ${plan.duration} days</span>
      </div>`;

    const pricingHtml = preview
      ? `<div class="swal-pricing-breakdown">
          <div class="swal-pricing-row"><span>New plan price</span><strong>${formatInr(preview.newPlanPrice)}</strong></div>
          <div class="swal-pricing-row swal-pricing-credit"><span>Credit (${preview.remainingDays} days unused)</span><strong>− ${formatInr(preview.unusedCredit)}</strong></div>
          <div class="swal-pricing-row swal-pricing-total">
            <span>${preview.noPaymentNeeded ? 'Amount due' : 'Pay now'}</span>
            <strong>${preview.noPaymentNeeded ? formatInr(0) : formatInr(preview.proratedAmount)}</strong>
          </div>
          ${
            preview.creditsGiven > 0
              ? `<p class="swal-credit-note">Extra credit of ${formatInr(preview.creditsGiven)} will be applied.</p>`
              : ''
          }
        </div>`
      : `<p class="swal-plan-note">Full plan price: ${formatCurrency(plan.price)}</p>`;

    const featuresHtml =
      plan.features?.length > 0
        ? `<ul class="swal-features">${plan.features
            .slice(0, 4)
            .map((f) => `<li>${f}</li>`)
            .join('')}</ul>`
        : '';

    const result = await Swal.fire({
      title: actionLabels[action] || 'Confirm Plan',
      html: `
        <div class="swal-plan-confirm">
          ${activePlanHtml}
          ${hasActive ? '<div class="swal-plan-arrow">↓</div>' : ''}
          ${selectedPlanHtml}
          ${pricingHtml}
          ${featuresHtml}
          <p class="swal-plan-note">${preview?.noPaymentNeeded ? 'No payment required for this change.' : 'You will proceed to secure Razorpay checkout after confirming.'}</p>
        </div>
      `,
      icon: hasActive ? 'question' : 'info',
      showCancelButton: true,
      confirmButtonText: preview?.noPaymentNeeded ? 'Confirm Change' : 'Proceed to Payment',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'swal-plan-popup',
        htmlContainer: 'swal-plan-html',
      },
    });

    return result.isConfirmed;
  };

  const handleSubscribeClick = async (plan) => {
    const confirmed = await confirmPlanWithSwal(plan);
    if (!confirmed) return;

    if (subscription?.status === SUBSCRIPTION_STATUS.ACTIVE) {
      setSelectedPlan(plan);
      setIsPlanChangeMode(true);

      try {
        setSubscribing(true);
        const { data } = await createUpgradeDowngradeOrderApi(plan._id);

        if (data.noPaymentNeeded) {
          toast.success(data.message);
          await fetchData();
          return;
        }

        setPaymentOrder(data.order);
        setProration(data.proration);
        setPaymentOpen(true);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to create plan change order');
      } finally {
        setSubscribing(false);
      }
      return;
    }

    setSelectedPlan(plan);
    setIsPlanChangeMode(false);
    setProration(null);

    try {
      setSubscribing(true);
      const { data } = await createPaymentOrderApi(plan._id);
      setPaymentOrder(data.order);
      setPaymentOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payment order');
    } finally {
      setSubscribing(false);
    }
  };

  const handlePaymentConfirm = async (paymentDetails) => {
    setSubscribing(true);
    try {
      if (isPlanChangeMode) {
        await verifyPaymentAndUpgradeDowngradeApi(
          paymentDetails.orderId,
          paymentDetails.paymentId,
          paymentDetails.signature,
          selectedPlan._id
        );
      } else {
        await verifyPaymentAndSubscribeApi(
          paymentDetails.orderId,
          paymentDetails.paymentId,
          paymentDetails.signature,
          selectedPlan._id
        );
      }

      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment verification failed');
      throw err;
    } finally {
      setSubscribing(false);
    }
  };

  const isActivePlan = (planId) =>
    subscription?.status === SUBSCRIPTION_STATUS.ACTIVE &&
    subscription?.planId?.toString() === planId?.toString();

  const getPlanButtonLabel = (plan, isActive, preview) => {
    if (isActive) return 'Current Plan';
    if (!preview) return 'Subscribe';

    if (preview.noPaymentNeeded) {
      return preview.isUpgrade ? 'Upgrade · Free' : 'Downgrade · Free';
    }

    return preview.isUpgrade
      ? `Upgrade · ${formatInr(preview.proratedAmount)}`
      : `Change · ${formatInr(preview.proratedAmount)}`;
  };

  const featuredIndex = 1;

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Choose Your Plan</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Flexible pricing for teams of every size. Upgrade or downgrade anytime.
        </p>
        {subscription?.status === SUBSCRIPTION_STATUS.ACTIVE && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            ✓ Current plan: <strong>{subscription.plan}</strong> ({subscription.remainingDays} days remaining)
          </p>
        )}
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
            const preview = getPreview(plan._id);
            const canChangePlan =
              subscription?.status === SUBSCRIPTION_STATUS.ACTIVE && !isActive && !!preview;

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

                {preview && !isActive && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {preview.noPaymentNeeded
                      ? `Credit applied · ${formatInr(preview.creditsGiven)} value`
                      : `Pay ${formatInr(preview.proratedAmount)} after ${formatInr(preview.unusedCredit)} credit`}
                  </p>
                )}

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
                  disabled={isActive || (subscription?.status === SUBSCRIPTION_STATUS.ACTIVE && !canChangePlan)}
                  onClick={() => handleSubscribeClick(plan)}
                  isLoading={subscribing && selectedPlan?._id === plan._id}
                >
                  {getPlanButtonLabel(plan, isActive, preview)}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => {
          setPaymentOpen(false);
          setPaymentOrder(null);
          setProration(null);
        }}
        plan={selectedPlan}
        onConfirm={handlePaymentConfirm}
        isLoading={subscribing}
        order={paymentOrder}
        proration={proration}
        isPlanChange={isPlanChangeMode}
      />
    </div>
  );
};

export default PlansPage;
