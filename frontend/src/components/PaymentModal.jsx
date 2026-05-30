import { useState } from 'react';
import { FiCreditCard, FiX } from 'react-icons/fi';
import Button from './ui/Button';
import Input from './ui/Input';

const PaymentModal = ({ isOpen, onClose, plan, onConfirm, isLoading }) => {
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');

  if (!isOpen || !plan) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiCreditCard className="text-indigo-600" size={22} />
            <h3 className="text-lg font-semibold">Simulated Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FiX size={20} />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          This is a demo checkout. No real payment will be processed.
        </p>

        <div className="mb-4 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/50">
          <p className="font-medium">{plan.name} Plan</p>
          <p className="text-2xl font-bold text-indigo-600">₹{plan.price}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>
    </div>
  );
};

export default PaymentModal;
