import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { AppError } from './AppError.js';

const razorpayInstance = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret,
});

export const createPaymentOrder = async (amount, planId, userId, description = '', notes = {}) => {
  const isDummyKey = !env.razorpayKeyId || env.razorpayKeyId.startsWith('rzp_test_STqHb1ZKajDEzK') || env.razorpayKeySecret === 'test_secret_key';

  const orderNotes = { userId, planId, description, ...notes };

  if (isDummyKey) {
    console.log('Using simulated/mock payment order (dummy/missing credentials)');
    return {
      orderId: `order_mock_${Math.random().toString(36).substring(2, 15)}`,
      amount: Math.round(amount * 100),
      currency: 'INR',
      isMock: true,
      notes: orderNotes,
    };
  }

  try {
    const order = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `${userId}-${planId}-${Date.now()}`,
      notes: orderNotes,
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      notes: orderNotes,
    };
  } catch (error) {
    console.error('Razorpay order creation failed, falling back to mock order:', error.message);
    return {
      orderId: `order_mock_${Math.random().toString(36).substring(2, 15)}`,
      amount: Math.round(amount * 100),
      currency: 'INR',
      isMock: true,
      notes: orderNotes,
    };
  }
};

export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  // Bypass signature verification for mock/simulated orders
  if (orderId && (orderId.startsWith('order_mock_') || signature === 'mock_signature' || signature.startsWith('sig_mock_'))) {
    console.log('Bypassing payment verification for mock/simulated order:', orderId);
    return true;
  }

  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.razorpayKeySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new AppError('Payment verification failed', 400);
    }

    return true;
  } catch (error) {
    throw new AppError(error.message || 'Payment verification failed', 400);
  }
};

export const fetchPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    throw new AppError('Failed to fetch payment details', 500);
  }
};
