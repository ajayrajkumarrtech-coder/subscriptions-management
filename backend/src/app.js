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
const allowedOrigins = env.clientUrl
  ? env.clientUrl.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: allowedOrigins,
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
