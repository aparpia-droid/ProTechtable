# ProTechtable API

Base URL: `{BACKEND_URL}/api` (e.g. `http://localhost:5000/api`).

Unless noted, JSON request and response bodies use `Content-Type: application/json`.

## Authentication

- **JWT**: Send `Authorization: Bearer <token>` (login also sets an httpOnly cookie `token`).
- **Protected routes**: Require a valid JWT.

## Rate limits

- Default API: 10 requests per minute per IP (general limiter).
- Auth signup/login/forgot/reset: 5 requests per 15 minutes per IP.

## Auth

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/auth/signup` | No | Body: `email`, `password`, optional `firstName`, `lastName` |
| POST | `/auth/login` | No | Body: `email`, `password` — returns `token` and `user` |
| GET | `/auth/verify-email/:token` | No | Verifies email |
| POST | `/auth/forgot-password` | No | Body: `email` |
| POST | `/auth/reset-password` | No | Body: `token`, `password` |
| POST | `/auth/logout` | No | Clears cookie |

## Assessments (protected)

| Method | Path | Body | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/assessments/create` | `{ email }` | Creates assessment; free tier: one total |
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
