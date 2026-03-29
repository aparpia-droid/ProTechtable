# ProTechtable

Production-oriented MVP for a vulnerability assessment platform: users register, run an email-based exposure assessment (Have I Been Pwned, Shodan, Hunter.io), receive a 0–100 score with remediation steps, and can upgrade via Stripe.

## Repository layout

| Path        | Description                                      |
| ----------- | ------------------------------------------------ |
| `frontend/` | React 18 + Vite + Tailwind (deploy to Vercel)    |
| `backend/`  | Express + Prisma + PostgreSQL (deploy to Railway)|
| `docs/`     | Documentation (this file, API, deployment)       |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local or hosted)

## Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET (32+ chars), ENCRYPTION_KEY (64 hex chars),
# optional API keys (HIBP, Shodan, Hunter), SendGrid, Stripe, FRONTEND_URL

npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

API listens on `http://localhost:5000` by default.

## Frontend setup

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL to the backend URL (e.g. http://localhost:5000)

npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Testing

```bash
# Backend (unit + optional DB integration)
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Security notes

- Never commit `.env` files.
- Rotate `JWT_SECRET`, `ENCRYPTION_KEY`, and API keys for production.
- Configure Stripe webhook URL to `https://<your-api>/api/payment/webhook` with the signing secret in `STRIPE_WEBHOOK_SECRET`.

See [API.md](./API.md) and [DEPLOYMENT.md](./DEPLOYMENT.md) for details.
