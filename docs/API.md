# API Documentation

Base URL: `http://localhost:5000/api`

All responses follow:

```json
{ "success": true|false, "message": "...", ... }
```

Authenticated routes require header:

```
Authorization: Bearer <accessToken>
```

Refresh token is sent automatically via HttpOnly cookie on `/api/auth/*` routes.

---

## Auth

### POST `/auth/register`

Register a new user.

**Body:**
```json
{
  "name": "Ajay",
  "email": "ajay@gmail.com",
  "password": "123456"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": { "id": "...", "name": "Ajay", "email": "ajay@gmail.com", "role": "user" }
}
```

---

### POST `/auth/login`

**Body:**
```json
{
  "email": "ajay@gmail.com",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbG...",
  "user": { "id": "...", "name": "Ajay", "email": "ajay@gmail.com", "role": "user" }
}
```

Sets `refreshToken` HttpOnly cookie.

---

### POST `/auth/refresh-token`

Uses refresh token cookie. No body required.

**Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbG...",
  "user": { ... }
}
```

---

### POST `/auth/logout`

Clears refresh token cookie.

**Response (200):**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

## Plans

### GET `/plans`

Public. Returns all subscription plans.

**Response (200):**
```json
{
  "success": true,
  "plans": [
    {
      "_id": "...",
      "name": "Basic",
      "price": 299,
      "features": ["5 Projects", "Email Support"],
      "duration": 30
    }
  ]
}
```

---

## Subscriptions

### POST `/subscribe/:planId`

**Auth required** (user)

Creates a new subscription for the authenticated user.

**Response (201):**
```json
{
  "success": true,
  "message": "Subscribed successfully",
  "subscription": { ... }
}
```

**Errors:**
- `400` — Already has active subscription
- `404` — Plan not found

---

### GET `/my-subscription`

**Auth required**

**Response (200):**
```json
{
  "success": true,
  "subscription": {
    "plan": "Pro",
    "price": 699,
    "features": ["..."],
    "duration": 90,
    "startDate": "2026-05-30T...",
    "endDate": "2026-08-28T...",
    "status": "active",
    "remainingDays": 90,
    "planId": "..."
  }
}
```

`subscription` is `null` if none exists.

---

## Admin

### GET `/admin/subscriptions`

**Auth required** (admin only)

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Filter by name, email, or plan |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Response (200):**
```json
{
  "success": true,
  "subscriptions": [
    {
      "id": "...",
      "userName": "Ajay",
      "email": "ajay@gmail.com",
      "planName": "Pro",
      "status": "active",
      "startDate": "...",
      "endDate": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## Health

### GET `/health`

```json
{ "success": true, "message": "API is running" }
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation / business error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Server error |
