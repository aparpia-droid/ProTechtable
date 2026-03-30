# ProTechtable API

Base URL: `{BACKEND_URL}/api` (e.g. `http://localhost:5000/api`).

Unless noted, JSON request and response bodies use `Content-Type: application/json`.

## Authentication

- **Session**: HttpOnly cookie `token` (JWT). Send requests with `credentials: include` from the browser. Do not rely on client-stored JWTs.
- **Protected routes**: Require a valid JWT in the cookie.

## Rate limits

- Default API: 120 requests per minute per IP (general limiter).
- Auth signup/login/forgot/reset/resend: 5 requests per 15 minutes per IP.
- Assessment create: 5 requests per hour per IP (in addition to auth where applicable).

## Auth

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/auth/signup` | No | Body: `email`, `password`, optional `firstName`, `lastName`. Sets session cookie on success; duplicate email returns same generic message (201) |
| POST | `/auth/login` | No | Body: `email`, `password` — returns `user` (no token in body) |
| GET | `/auth/verify-email/:token` | No | Verifies email |
| POST | `/auth/forgot-password` | No | Body: `email` |
| POST | `/auth/reset-password` | No | Body: `token`, `password` |
| POST | `/auth/resend-verification` | No | Body: `email` — generic success (no enumeration) |
| POST | `/auth/logout` | No | Clears cookie |

## Assessments (protected)

| Method | Path | Body | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/assessments/create` | `{ email }` | Must match the logged-in verified email; free tier: one total |
| GET | `/assessments/:id` | — | Full assessment for owner |

## User (protected)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/user/profile` | Profile (no password hash) |
| PUT | `/user/profile` | `firstName`, `lastName`, optional `phone`, `dob` (ISO date `YYYY-MM-DD`) |
| PUT | `/user/password` | `currentPassword`, `newPassword` |
| DELETE | `/user/account` | GDPR delete; cancels Stripe subscription if present |
| GET | `/user/assessments` | List assessments, newest first |
| GET | `/user/subscription` | Free or Stripe-backed premium info |

## Remediation (protected)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/remediation/:assessmentId` | Build or return remediation plan + progress |
| POST | `/remediation-actions/mark-complete` | Body: `{ actionId }` (UUID) |

## Brokers (protected)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/brokers` | All brokers; free users get `removalUrl` only for first 3 (`locked` on others) |

## Payment

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/payment/create-checkout` | JWT | Body: `{ plan: "monthly" \| "annual" }` → `{ sessionUrl }` |
| POST | `/payment/webhook` | Stripe signature | Raw JSON body; no JWT |

## Health

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/health` | `{ ok: true }` (no `/api` prefix on some deployments; this app uses `/health` at server root) |

Note: In this codebase, health is mounted at **`GET /health`** on the Express app (not under `/api`).

## Error shape

```json
{ "success": false, "message": "Human-readable message" }
```

HTTP 500 responses use a generic message without stack traces.
