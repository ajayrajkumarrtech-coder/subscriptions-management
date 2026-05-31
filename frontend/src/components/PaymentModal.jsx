import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiCreditCard, FiLock, FiX } from 'react-icons/fi';
import Button from './ui/Button';
import Input from './ui/Input';
import toast from 'react-hot-toast';
import { getPublicConfigApi } from '../api/configApi';

const PHASE = {
  IDLE: 'idle',
  LOADING: 'loading',
  VERIFYING: 'verifying',
  SUCCESS: 'success',
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 28 },
  },
  exit: { opacity: 0, scale: 0.95, y: 12, transition: { duration: 0.18 } },
};

const resolvePaymentAmount = (order, plan, proration) => {
  if (order?.amount != null) return order.amount / 100;
  if (proration?.proratedAmount != null) return proration.proratedAmount;
  return plan?.price ?? 0;
};

const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 220,
  y: -(40 + Math.random() * 120),
  rotate: Math.random() * 360,
  color: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'][i % 5],
  size: 6 + Math.random() * 6,
  delay: Math.random() * 0.15,
}));

const LoadingOverlay = ({ phase }) => {
  const isVerifying = phase === PHASE.VERIFYING;
  const steps = [
    { label: 'Connecting to Razorpay', done: isVerifying },
    { label: isVerifying ? 'Verifying payment' : 'Opening secure checkout', done: false, active: true },
  ];

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-white/95 px-6 dark:bg-slate-900/98"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full border-[3px] border-indigo-100 dark:border-indigo-950"
        />
        <motion.div
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-500 border-r-indigo-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-[3px] border-transparent border-b-emerald-400 border-l-emerald-300"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <FiCreditCard size={26} />
        </motion.div>
      </div>

      <div className="text-center">
        <motion.p
          key={isVerifying ? 'verify' : 'load'}
          className="text-lg font-semibold text-slate-900 dark:text-white"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {isVerifying ? 'Verifying Payment' : 'Preparing Checkout'}
        </motion.p>
        <p className="mt-1 text-sm text-slate-500">
          {isVerifying ? 'Please wait while we confirm your transaction…' : 'Launching Razorpay secure gateway…'}
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/80"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                step.done
                  ? 'bg-emerald-500 text-white'
                  : step.active
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-700'
              }`}
            >
              {step.done ? <FiCheck size={12} /> : i + 1}
            </span>
            <span className={step.active ? 'font-medium text-slate-800 dark:text-slate-200' : 'text-slate-500'}>
              {step.label}
            </span>
            {step.active && !step.done && (
              <motion.span
                className="ml-auto flex gap-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="h-1 w-1 rounded-full bg-indigo-500"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.15 }}
                  />
                ))}
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const SuccessOverlay = ({ planName, amount, isUpgrade, onDone }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 2800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden bg-white/95 px-6 dark:bg-slate-900/98"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {CONFETTI.map((piece) => (
        <motion.span
          key={piece.id}
          className="pointer-events-none absolute rounded-sm"
          style={{
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            top: '45%',
            left: '50%',
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0 }}
          animate={{
            x: piece.x,
            y: piece.y,
            opacity: [1, 1, 0],
            rotate: piece.rotate,
            scale: [0, 1.2, 0.8],
          }}
          transition={{ duration: 1.1, delay: piece.delay, ease: 'easeOut' }}
        />
      ))}

      <motion.div
        className="relative flex h-24 w-24 items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-400/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.4, 1.6], opacity: [0.6, 0.3, 0] }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <motion.div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/35"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.1 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.35 }}
          >
            <FiCheck size={44} strokeWidth={3} />
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.35 }}
      >
        <p className="text-xl font-bold text-emerald-600">Payment Successful!</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {isUpgrade ? 'Your plan has been updated to' : 'You are now subscribed to'}
        </p>
        <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{planName}</p>
        <motion.p
          className="mt-3 text-2xl font-bold text-indigo-600"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.6 }}
        >
          ₹{amount.toFixed(2)}
        </motion.p>
      </motion.div>

      <motion.div
        className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <motion.div
          className="h-full rounded-full bg-emerald-500"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 2.8, ease: 'linear' }}
        />
      </motion.div>
      <p className="mt-2 text-xs text-slate-400">Redirecting…</p>
    </motion.div>
  );
};

const PaymentModal = ({
  isOpen,
  onClose,
  plan,
  onConfirm,
  isLoading,
  order = null,
  isPlanChange = false,
  proration = null,
}) => {
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [successSnapshot, setSuccessSnapshot] = useState(null);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const displayAmount = resolvePaymentAmount(order, plan, proration);
  const displayLabel = isPlanChange
    ? `Change to ${plan?.name}`
    : `Subscribe to ${plan?.name}`;
  const isBusy = phase === PHASE.LOADING || phase === PHASE.VERIFYING;

  useEffect(() => {
    if (!isOpen) return;

    const fetchConfig = async () => {
      try {
        const { data } = await getPublicConfigApi();
        setRazorpayKey(data.config.razorpayKeyId);
      } catch (err) {
        console.error('Failed to fetch Razorpay key:', err);
        toast.error('Failed to load payment gateway');
      }
    };

    fetchConfig();

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setPhase(PHASE.IDLE);
      setSuccessSnapshot(null);
    }
  }, [isOpen]);

  const completePayment = async (paymentDetails) => {
    setSuccessSnapshot({
      amount: resolvePaymentAmount(order, plan, proration),
      planName: plan?.name ?? 'Your plan',
      isUpgrade: proration?.isUpgrade ?? isPlanChange,
    });
    setPhase(PHASE.VERIFYING);
    try {
      await onConfirm(paymentDetails);
      setPhase(PHASE.SUCCESS);
    } catch (err) {
      toast.error('Payment verification failed');
      console.error(err);
      setPhase(PHASE.IDLE);
    }
  };

  const handleSuccessDone = () => {
    setPhase(PHASE.IDLE);
    onClose();
  };

  const handleRazorpayPayment = async () => {
    if (!order) {
      toast.error('Order not created. Please try again.');
      return;
    }

    setPhase(PHASE.LOADING);

    const isMockOrder =
      order.isMock ||
      order.orderId?.startsWith('order_mock_') ||
      !razorpayKey ||
      razorpayKey.startsWith('rzp_test_STqHb1ZKajDEzK');

    if (isMockOrder) {
      setTimeout(async () => {
        await completePayment({
          orderId: order.orderId,
          paymentId: `pay_mock_${Math.random().toString(36).substring(2, 15)}`,
          signature: `sig_mock_${Math.random().toString(36).substring(2, 15)}`,
        });
      }, 1600);
      return;
    }

    if (!razorpayKey) {
      toast.error('Payment gateway not ready. Please try again.');
      setPhase(PHASE.IDLE);
      return;
    }

    try {
      if (!window.Razorpay) {
        toast.error('Razorpay is not loaded. Please refresh and try again.');
        setPhase(PHASE.IDLE);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: 'Subscription Dashboard',
        description: displayLabel,
        order_id: order.orderId,
        handler: async (response) => {
          await completePayment({
            orderId: order.orderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: () => {
            const current = phaseRef.current;
            if (current !== PHASE.VERIFYING && current !== PHASE.SUCCESS) {
              setPhase(PHASE.IDLE);
            }
          },
        },
      };

      await new Promise((resolve) => setTimeout(resolve, 900));

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
      console.error(error);
      setPhase(PHASE.IDLE);
    }
  };

  const handleSimulatedPayment = (e) => {
    e.preventDefault();
    if (order) {
      handleRazorpayPayment();
    } else {
      onConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && plan && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={isBusy || phase === PHASE.SUCCESS ? undefined : onClose}
          />

          <motion.div
            className="glass-card relative w-full max-w-md overflow-hidden p-6"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AnimatePresence mode="wait">
              {isBusy && <LoadingOverlay key="loading" phase={phase} />}
              {phase === PHASE.SUCCESS && successSnapshot && (
                <SuccessOverlay
                  key="success"
                  planName={successSnapshot.planName}
                  amount={successSnapshot.amount}
                  isUpgrade={successSnapshot.isUpgrade}
                  onDone={handleSuccessDone}
                />
              )}
            </AnimatePresence>

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <FiCreditCard className="text-indigo-600" size={22} />
                </motion.div>
                <h3 className="text-lg font-semibold">Payment</h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                disabled={isBusy || phase === PHASE.SUCCESS}
              >
                <FiX size={20} />
              </button>
            </div>

            {order && (
              <p className="mb-4 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                <FiLock size={14} className="text-emerald-500" />
                Secured by Razorpay (Test Mode)
              </p>
            )}

            <motion.div
              className="mb-4 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/50"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="font-medium">{displayLabel}</p>

              {isPlanChange && proration ? (
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>New plan price</span>
                    <span>₹{proration.newPlanPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Credit ({proration.remainingDays} days unused)</span>
                    <span>− ₹{proration.unusedCredit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-indigo-200 pt-2 font-bold text-indigo-600 dark:border-indigo-800">
                    <span>Amount due</span>
                    <motion.span
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, delay: 0.15 }}
                    >
                      ₹{displayAmount.toFixed(2)}
                    </motion.span>
                  </div>
                </div>
              ) : (
                <motion.p
                  className="text-2xl font-bold text-indigo-600"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, delay: 0.15 }}
                >
                  ₹{displayAmount.toFixed(2)}
                </motion.p>
              )}
            </motion.div>

            {order ? (
              <form onSubmit={handleSimulatedPayment} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    readOnly
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  />
                  <p className="mt-1 text-xs text-slate-500">Test: 4111 1111 1111 1111</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Expiry</label>
                    <input
                      type="text"
                      value="12/28"
                      readOnly
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">CVV</label>
                    <input
                      type="text"
                      value="123"
                      readOnly
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                    disabled={isBusy || isLoading || phase === PHASE.SUCCESS}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isBusy || isLoading}
                    disabled={phase === PHASE.SUCCESS}
                  >
                    Pay Now
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSimulatedPayment} className="space-y-4">
                <Input label="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Expiry" defaultValue="12/28" readOnly />
                  <Input label="CVV" defaultValue="123" readOnly />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" isLoading={isLoading}>
                    Pay Now
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
