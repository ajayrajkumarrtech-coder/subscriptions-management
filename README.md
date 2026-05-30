# SubFlow — Subscription Management Dashboard

A production-ready mini SaaS admin dashboard for managing subscription plans, user subscriptions, and role-based access control.

## Features

- **Authentication**: JWT access tokens (15 min) + refresh tokens (7 days, HttpOnly cookie)
- **Auto token refresh**: Axios interceptor retries failed requests
- **Role-based access**: `user` and `admin` roles with protected routes/APIs
- **Plans**: 4 seeded pricing tiers with subscribe flow
- **Dashboard**: Active subscription details with status badges
- **Admin panel**: Searchable, paginated subscriptions table
- **Bonus**: Dark/light mode, simulated payment modal, analytics stat cards

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, TailwindCSS, Redux Toolkit, React Router, Axios, Formik, Yup, React Hot Toast, React Icons |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Joi, Helmet, Morgan, CORS |
| Database | MongoDB |

## Project Structure

```
SubscriptionManagementDashboard/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── validations/
│       ├── seed/
│       ├── utils/
│       ├── constants/
│       ├── app.js
│       └── server.js
├── frontend/
│   └── src/
│       ├── api/
│       ├── app/
│       ├── features/auth/
│       ├── pages/
│       ├── components/
│       ├── layouts/
│       ├── hooks/
│       ├── routes/
│       ├── utils/
│       └── services/
├── docs/
│   └── API.md
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB running locally or MongoDB Atlas URI
- npm

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd SubscriptionManagementDashboard
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm install
npm run seed
npm run dev
```

Backend runs at **http://localhost:5000**

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

### 4. Default admin credentials (after seed)

| Field | Value |
|-------|-------|
| Email | admin@dashboard.com |
| Password | admin123456 |

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | development / production |
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Access token secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `JWT_ACCESS_EXPIRES_IN` | Default: 15m |
| `JWT_REFRESH_EXPIRES_IN` | Default: 7d |
| `CLIENT_URL` | Frontend URL for CORS |
| `ADMIN_EMAIL` | Seed admin email |
| `ADMIN_PASSWORD` | Seed admin password |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

## API Documentation

See [docs/API.md](docs/API.md) for full endpoint reference.

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Login page |
| `/register` | Public | Registration |
| `/plans` | User | Pricing plans |
| `/dashboard` | User | Subscription dashboard |
| `/admin/subscriptions` | Admin | All subscriptions |

## Git Commit Structure

Recommended commit history when pushing to GitHub:

1. `chore: initialize monorepo structure`
2. `feat(backend): add auth, plans, subscriptions APIs`
3. `feat(backend): add validation, middleware, seed script`
4. `feat(frontend): setup React app with Redux and routing`
5. `feat(frontend): add auth, plans, dashboard pages`
6. `feat(frontend): add admin subscriptions and UI polish`
7. `docs: add README and API documentation`

## Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | backend | Start API with watch |
| `npm start` | backend | Start API |
| `npm run seed` | backend | Seed plans + admin user |
| `npm run dev` | frontend | Start Vite dev server |
| `npm run build` | frontend | Production build |

## License

MIT
