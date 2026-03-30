# Deployment

## Frontend (Vercel)

1. Connect the Git repository and set the **root directory** to `frontend`.
2. Framework preset: **Vite**.
3. Environment variables:
   - `VITE_API_URL` — public URL of the backend API (e.g. `https://api.yourdomain.com`).
   - `VITE_STRIPE_PUBLIC_KEY` — Stripe publishable key (test or live).
4. Build command: `npm run build` (default). Output: `dist/`.
5. After deploy, ensure CORS on the backend allows the Vercel origin via `FRONTEND_URL`.

## Backend (Railway)

1. Create a **PostgreSQL** plugin and copy its `DATABASE_URL` into the service variables.
2. Set root directory to `backend` (or deploy from repo with start command `npm start`).
3. Required variables (see `backend/.env.example`):
   - `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`
   - `FRONTEND_URL` — exact Vercel URL (used for CORS and Stripe redirects)
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_ANNUAL_PRICE_ID`
   - `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
   - `HIBP_API_KEY`, `SHODAN_API_KEY`, `HUNTER_IO_API_KEY`
   - `NODE_ENV=production`, `PORT` (Railway injects `PORT` automatically)
4. Build / release steps:
   ```bash
   npm install
   npx prisma migrate deploy
   npm run db:seed   # optional: seed data brokers once
   npm start
   ```
5. **Stripe webhook**: In the Stripe Dashboard, add endpoint URL  
   `https://<your-railway-domain>/api/payment/webhook`  
   Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.  
   Paste the signing secret into `STRIPE_WEBHOOK_SECRET`.

## TLS and cookies

- In production, login cookies use `secure: true`; serve the API over HTTPS.

## CSRF / Origin

- In production, mutating requests should include an `Origin` (or `Referer`) matching `FRONTEND_URL` (see `csrfOrigin` middleware).

## Security Configuration

### Reverse Proxy (trust proxy)

The backend is configured with `trust proxy = 1`, meaning it trusts one proxy hop for IP resolution. This is correct for:

- Heroku
- Railway
- Render
- Single Nginx or AWS ALB

If your deployment has multiple proxies (e.g., Cloudflare CDN + AWS ALB), update `app.set("trust proxy", 2)` in `backend/src/app.js` to match the number of trusted hops.

If the backend is exposed directly to the internet with no reverse proxy, set `trust proxy` to `false`.

**Getting this wrong breaks rate limiting** — attackers can bypass IP-based limits by spoofing the X-Forwarded-For header.

## Secrets rotation

- Rotate `JWT_SECRET`, `ENCRYPTION_KEY`, API keys, and Stripe secrets on a regular schedule or after any suspected leak.
