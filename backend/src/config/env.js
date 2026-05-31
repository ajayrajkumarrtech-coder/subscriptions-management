import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://SUBMDB:Ajay%40186@cluster0.7t5gf4v.mongodb.net/subscription_dashboard',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret_dev',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_dev',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_STqHb1ZKajDEzK',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_key',
};
