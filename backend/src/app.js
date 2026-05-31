import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { globalErrorHandler, notFound } from './middleware/error.middleware.js';

const app = express();

app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

if (env.clientUrl) {
  allowedOrigins.push(env.clientUrl.replace(/\/$/, ''));
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl/Postman)
      if (!origin) return callback(null, true);

      const formattedOrigin = origin.replace(/\/$/, '');

      const isAllowed = 
        allowedOrigins.includes(formattedOrigin) ||
        formattedOrigin.startsWith('http://localhost:') ||
        formattedOrigin.startsWith('http://127.0.0.1:') ||
        formattedOrigin.endsWith('.vercel.app') ||
        formattedOrigin.endsWith('.onrender.com') ||
        formattedOrigin.endsWith('.netlify.app');

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
        callback(null, false); // Return false instead of throwing error to let it be rejected cleanly
      }
    },
    credentials: true,
  })
);
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Subscription Management Dashboard API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api', routes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
