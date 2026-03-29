# Cursor Prompt: Build ProTechtable MVP

Build a complete, production-ready vulnerability assessment platform called **ProTechtable**. The app lets users submit an email, queries external APIs for breach/exposure data, calculates a vulnerability score (0-100), displays results with remediation guidance, and offers a premium tier via Stripe.

## Project Structure

```
/frontend          — React 18 + Vite + TailwindCSS (deploy to Vercel)
/backend           — Node.js + Express + Prisma + PostgreSQL (deploy to Railway)
/docs              — README.md, API.md, DEPLOYMENT.md
```

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, React Router v6, Axios, React Hook Form, @stripe/react-stripe-js
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL, bcryptjs, jsonwebtoken, stripe, @sendgrid/mail, express-rate-limit, helmet, cors, express-validator
- **External APIs**: Have I Been Pwned (breach lookups), Shodan (public profile discovery), Hunter.io (email verification)
- **Payments**: Stripe Checkout + webhooks
- **Email**: SendGrid (verification, password reset)

## Design System

- **Colors**: Navy `#001F3F`, Yellow `#FFD700`, White `#FFFFFF`, Gray `#6B7280`
- **Fonts**: System font stack only (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- **Layout**: Mobile-first responsive. No animations unless they improve UX.
- **Accessibility**: WCAG 2.1 AA minimum — proper aria labels, focus states, color contrast.

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String   @id @default(uuid())
  email            String   @unique
  passwordHash     String
  firstName        String?
  lastName         String?
  encryptedPhone   String?
  encryptedDob     String?
  subscriptionTier String   @default("free") // "free" | "premium"
  stripeCustomerId String?
  emailVerified    Boolean  @default(false)
  verificationToken String?
  resetToken       String?
  resetTokenExpiry DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  assessments      Assessment[]
  remediationActions RemediationAction[]
}

model Assessment {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  emailSearched   String
  score           Int
  riskLevel       String   // "low" | "medium" | "high" | "critical"
  breachesFound   Int
  dataBrokersFound Int
  publicProfiles  Int      @default(0)
  assessmentData  Json
  createdAt       DateTime @default(now())
  remediationActions RemediationAction[]
}

model RemediationAction {
  id           String    @id @default(uuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  assessmentId String
  assessment   Assessment @relation(fields: [assessmentId], references: [id])
  actionType   String    // "data_removal" | "credit_freeze" | "password_reset" | "fraud_alert"
  actionTarget String
  status       String    @default("pending") // "pending" | "in_progress" | "completed" | "failed"
  isAutomated  Boolean   @default(false)
  createdAt    DateTime  @default(now())
  completedAt  DateTime?
}

model DataBroker {
  id             String @id @default(uuid())
  name           String @unique
  removalUrl     String
  removalMethod  String // "form" | "email" | "api"
  difficulty     String // "easy" | "medium" | "hard"
}
```

## Seed Data: Data Brokers

Seed the `DataBroker` table with these 20 brokers:

| Name | Removal URL | Method | Difficulty |
|------|------------|--------|------------|
| Spokeo | https://www.spokeo.com/optout | form | easy |
| BeenVerified | https://www.beenverified.com/faq/opt-out/ | form | medium |
| ZoomInfo | https://www.zoominfo.com/about-zoominfo/privacy/manage-profile | email | hard |
| TruthFinder | https://www.truthfinder.com/opt-out/ | form | easy |
| FastPeopleSearch | https://www.fastpeoplesearch.com/removal | form | easy |
| PeopleFinder | https://www.peoplefinder.com/optout.php | email | medium |
| GoLookUp | https://www.golookup.com/support/optout | form | easy |
| Whitepages | https://www.whitepages.com/suppression-requests | form | medium |
| USSearch | https://www.ussearch.com/opt-out/submit/ | email | medium |
| TrueCaller | https://www.truecaller.com/unlisting | form | easy |
| Intelius | https://www.intelius.com/opt-out | form | medium |
| PeopleSmart | https://www.peoplesmart.com/optout-go | form | easy |
| InstantCheckmate | https://www.instantcheckmate.com/opt-out/ | form | medium |
| Radaris | https://radaris.com/page/how-to-remove | email | hard |
| MyLife | https://www.mylife.com/ccpa/index.pubview | form | hard |
| Pipl | https://pipl.com/personal-information-removal-request | email | hard |
| AnyWho | https://www.anywho.com/help/privacy | form | easy |
| That'sThem | https://thatsthem.com/optout | form | easy |
| Nuwber | https://nuwber.com/removal/link | form | medium |
| ClustrMaps | https://clustrmaps.com/bl/opt-out | email | medium |

## Backend API Endpoints

Build ALL of these endpoints with full error handling, input validation (express-validator), and rate limiting.

### Auth Routes (`/api/auth`)

**POST /api/auth/signup**
- Body: `{ email, password, firstName, lastName }`
- Validate: email format, password 12+ chars with uppercase+lowercase+number+special
- Hash password with bcryptjs (salt rounds: 12)
- Generate email verification token (crypto.randomBytes)
- Send verification email via SendGrid
- Return: `{ success: true, message: "Check email to verify" }`
- Rate limit: 5 requests/15 min per IP

**POST /api/auth/login**
- Body: `{ email, password }`
- Compare password hash
- Check email is verified
- Generate JWT (expires 30 days), set as httpOnly cookie AND return in response
- Return: `{ success: true, token, user: { id, email, firstName, lastName, subscriptionTier } }`
- Rate limit: 5 attempts/15 min per IP, then lockout

**GET /api/auth/verify-email/:token**
- Find user by verificationToken, set emailVerified=true, clear token
- Return: `{ success: true, message: "Email verified" }`

**POST /api/auth/forgot-password**
- Body: `{ email }`
- Generate resetToken + resetTokenExpiry (1 hour)
- Send reset email via SendGrid
- Always return success (don't leak whether email exists)
- Return: `{ success: true, message: "If account exists, reset email sent" }`

**POST /api/auth/reset-password**
- Body: `{ token, password }`
- Find user by resetToken where expiry > now
- Hash new password, clear reset fields
- Return: `{ success: true, message: "Password reset" }`

### Assessment Routes (`/api/assessments`) — Require JWT auth

**POST /api/assessments/create**
- Body: `{ email }`
- Free users: max 1 assessment total. Premium: unlimited.
- Call external APIs in parallel:
  1. **Have I Been Pwned** (`GET https://haveibeenpwned.com/api/v3/breachedaccount/{email}` with `hibp-api-key` header) — get breach list
  2. **Shodan** (`GET https://api.shodan.io/shodan/host/search?key={key}&query={email}`) — get public profile count
  3. **Hunter.io** (`GET https://api.hunter.io/v2/email-verifier?email={email}&api_key={key}`) — get email risk score
- Handle API failures gracefully (if one API is down, still return partial results)
- Calculate score:
  ```
  breachScore = Math.min(breachesFound * 20, 40)
  profileScore = Math.min(Math.floor(publicProfiles / 10) * 15, 30)
  brokerScore = Math.min(dataBrokersFound * 5, 20)
  emailRiskScore = (hunterResult.status === "invalid" || hunterResult.score < 50) ? 10 : 0
  totalScore = breachScore + profileScore + brokerScore + emailRiskScore
  ```
- Risk level: 0-25 "low", 26-50 "medium", 51-75 "high", 76-100 "critical"
- Estimate data brokers: `Math.min(Math.floor(breachesFound * 2.5), 20)` (heuristic for MVP)
- Store full API response data in `assessmentData` JSON field
- Return: `{ success: true, data: { assessmentId, score, riskLevel, breachesFound, dataBrokersFound, publicProfiles, breaches: [...], emailRisk } }`

**GET /api/assessments/:id**
- Return full assessment with all data
- Only allow owner to view their assessment

**GET /api/user/assessments**
- Return all assessments for authenticated user, ordered by createdAt desc

### Remediation Routes (`/api/remediation`) — Require JWT auth

**GET /api/remediation/:assessmentId**
- Load assessment, generate remediation plan based on results:
  - If breaches found → add "password_reset" actions for each breached service
  - Always add "credit_freeze" action
  - Always add "fraud_alert" action
  - Add "data_removal" actions for estimated brokers (pull from DataBroker table)
- Create RemediationAction records if they don't exist yet
- Return: `{ success: true, remediationPlan: { actions: [...], progress: { total, completed, percentage } } }`

**POST /api/remediation-actions/mark-complete**
- Body: `{ actionId }`
- Set status="completed", completedAt=now()
- Only allow owner to mark their actions

### Broker Routes (`/api/brokers`) — Require JWT auth

**GET /api/brokers**
- Return all data brokers from DataBroker table
- Free users: show all but lock removal links (show first 3 only)
- Premium users: show all with removal links

### Payment Routes (`/api/payment`)

**POST /api/payment/create-checkout** — Require JWT auth
- Body: `{ plan: "monthly" | "annual" }`
- Create Stripe Checkout Session:
  - monthly: $9.99/month recurring
  - annual: $99.00/year recurring
- Return: `{ success: true, sessionUrl }`

**POST /api/payment/webhook** — NO auth (Stripe signature verification instead)
- Handle events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
- On checkout complete: update user subscriptionTier to "premium", save stripeCustomerId
- On subscription deleted: set subscriptionTier back to "free"
- Use raw body parser for this route only

**GET /api/user/subscription** — Require JWT auth
- Return subscription details from Stripe if premium, or free tier info

### User Routes (`/api/user`) — Require JWT auth

**GET /api/user/profile**
- Return user profile (exclude passwordHash)

**PUT /api/user/profile**
- Body: `{ firstName, lastName }` (phone and DOB encrypted with AES-256 before storing)
- Validate inputs
- Return updated user

**DELETE /api/user/account**
- GDPR: Delete all user data (user, assessments, remediation actions)
- Cancel Stripe subscription if active
- Return: `{ success: true, message: "Account deleted" }`

## Backend Middleware

1. **authMiddleware**: Verify JWT from Authorization header or httpOnly cookie. Attach `req.user = { id, email, subscriptionTier }`.
2. **rateLimiter**: Use express-rate-limit. Default: 10 req/min per IP. Auth routes: 5 req/15min per IP.
3. **errorHandler**: Global error handler. Never expose stack traces or system details. Log errors server-side (use winston logger). Return generic messages to client.
4. **requestLogger**: Log method, path, status code, response time. NEVER log request bodies or PII.

## Frontend Pages & Components

### Pages

1. **LandingPage** (`/`)
   - Hero section: "Know Your Digital Exposure in 60 Seconds" with navy background, yellow CTA button
   - How it works: 3-step visual (Submit email → Get score → Take action)
   - Features grid (4 cards): Breach Detection, Data Broker Scanning, Remediation Guidance, Premium Protection
   - Pricing section: Free vs Premium comparison table
   - FAQ accordion (5 questions)
   - Footer with links

2. **SignupPage** (`/signup`)
   - Form: email, password, confirm password, first name, last name
   - Client-side validation matching backend rules
   - Link to login
   - On success: show "Check your email to verify"

3. **LoginPage** (`/login`)
   - Form: email, password
   - Link to signup and forgot-password
   - On success: redirect to /dashboard

4. **ForgotPasswordPage** (`/forgot-password`)
   - Form: email
   - Always show success message (don't leak email existence)

5. **ResetPasswordPage** (`/reset-password/:token`)
   - Form: new password, confirm password
   - On success: redirect to /login

6. **DashboardPage** (`/dashboard`) — Protected route
   - Welcome message with user's name
   - Latest assessment score (large circular gauge) or "Run your first assessment" CTA
   - Past assessments list (date, email searched, score, risk level)
   - "Run New Assessment" button
   - Subscription status card

7. **AssessmentPage** (`/assessment`) — Protected route
   - Step 1: Email input form with validation
   - Step 2: Loading screen with animated progress steps:
     - "Checking breach databases..." (2s)
     - "Scanning public profiles..." (2s)
     - "Analyzing data broker exposure..." (2s)
     - "Calculating vulnerability score..." (1s)
   - Step 3: Results display:
     - Large circular score gauge (color-coded by risk level)
     - Risk level badge (Low=green, Medium=yellow, High=orange, Critical=red)
     - Breakdown cards: Breaches Found, Data Brokers, Public Profiles
     - Breach detail list (name, date, data types exposed)
     - CTA buttons: "View Remediation Steps" and "Upgrade to Premium" (if free)

8. **RemediationPage** (`/remediation/:assessmentId`) — Protected route
   - Progress bar (X of Y actions completed)
   - Priority-ranked action list, each with:
     - Priority badge (High/Medium/Low)
     - Title and description
     - Difficulty indicator (Easy/Medium/Hard)
     - Time estimate
     - Action button (links to external site or shows instructions)
     - "Mark Complete" checkbox
   - Data Broker Removal section:
     - List of brokers with difficulty badges
     - "Remove Me" buttons (open broker removal URL in new tab)
     - Free users: first 3 brokers unlocked, rest show "Upgrade to Premium" overlay
   - Premium upsell banner for free users

9. **PricingPage** (`/pricing`) — Public
   - Two-column comparison: Free vs Premium
   - Monthly ($9.99) and Annual ($99/year — save 17%) toggle
   - Feature checklist for each tier
   - "Get Started" / "Upgrade Now" CTAs

10. **AccountPage** (`/account`) — Protected route
    - Profile section: edit first name, last name
    - Password change form (current password + new password)
    - Subscription management (current plan, upgrade/downgrade, cancel)
    - "Delete My Account" button with confirmation modal (GDPR)
    - Past assessments with links to results

### Shared Components

- **Navbar**: Logo (text "ProTechtable" in navy), nav links (Dashboard, Pricing), auth buttons (Login/Signup or user menu dropdown)
- **Footer**: Links (About, Privacy Policy, Terms of Service, Contact), copyright
- **ProtectedRoute**: Wrapper that redirects to /login if not authenticated
- **ScoreGauge**: Circular progress component, color changes by risk level
- **RiskBadge**: Colored badge component (green/yellow/orange/red)
- **LoadingSpinner**: Simple spinner for async operations
- **Toast/Alert**: Success/error notification component

### Frontend State Management

Use React Context for auth state:
- `AuthContext`: `{ user, token, login(), logout(), isAuthenticated, isLoading }`
- Store JWT in localStorage (for persistence) AND send as Authorization header
- On app load: check localStorage for token, validate with `/api/user/profile`, set user state

### Frontend API Layer

Create an `api.js` module using Axios:
- Base URL from `VITE_API_URL` env var
- Request interceptor: attach Authorization header from stored token
- Response interceptor: on 401, clear auth state and redirect to /login
- Export functions: `signup()`, `login()`, `verifyEmail()`, `forgotPassword()`, `resetPassword()`, `createAssessment()`, `getAssessment()`, `getUserAssessments()`, `getRemediation()`, `markActionComplete()`, `getBrokers()`, `createCheckout()`, `getSubscription()`, `getProfile()`, `updateProfile()`, `deleteAccount()`

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/protechtable
JWT_SECRET=minimum-32-character-secret-key-here
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_MONTHLY_PRICE_ID=price_xxx
STRIPE_ANNUAL_PRICE_ID=price_xxx
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@protechtable.com
HIBP_API_KEY=xxx
SHODAN_API_KEY=xxx
HUNTER_IO_API_KEY=xxx
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
ENCRYPTION_KEY=32-byte-hex-key-for-aes-256
```

## Security Implementation

1. **Helmet**: Use helmet() middleware for security headers
2. **CORS**: Allow only FRONTEND_URL origin
3. **Rate Limiting**: express-rate-limit with different windows for auth vs general routes
4. **Input Sanitization**: Use express-validator's `trim()`, `escape()`, `normalizeEmail()` on all inputs
5. **SQL Injection**: Prisma ORM handles parameterized queries
6. **XSS**: React auto-escapes. Don't use dangerouslySetInnerHTML.
7. **CSRF**: SameSite cookie attribute + check Origin header on state-changing requests
8. **PII Encryption**: Use crypto module with AES-256-GCM for phone and DOB fields. Store IV with ciphertext.
9. **Logging**: Winston logger. NEVER log email addresses, passwords, tokens, or any PII. Log: request method, path, status code, response time, error messages (sanitized).
10. **Error Responses**: Never return stack traces, database errors, or system details. Return generic messages like "Something went wrong" for 500 errors.

## File Structure

```
/frontend
  /public
    favicon.ico
  /src
    /components
      Navbar.jsx
      Footer.jsx
      ProtectedRoute.jsx
      ScoreGauge.jsx
      RiskBadge.jsx
      LoadingSpinner.jsx
    /pages
      LandingPage.jsx
      SignupPage.jsx
      LoginPage.jsx
      ForgotPasswordPage.jsx
      ResetPasswordPage.jsx
      DashboardPage.jsx
      AssessmentPage.jsx
      RemediationPage.jsx
      PricingPage.jsx
      AccountPage.jsx
    /context
      AuthContext.jsx
    /lib
      api.js
    App.jsx
    main.jsx
    index.css
  tailwind.config.js
  vite.config.js
  package.json
  .env.example

/backend
  /src
    /routes
      auth.js
      assessments.js
      remediation.js
      brokers.js
      payment.js
      user.js
    /middleware
      auth.js
      rateLimiter.js
      errorHandler.js
      requestLogger.js
    /services
      hibp.js          — Have I Been Pwned API client
      shodan.js        — Shodan API client
      hunter.js        — Hunter.io API client
      email.js         — SendGrid email service
      encryption.js    — AES-256 encrypt/decrypt helpers
      scoring.js       — Vulnerability score calculation
    /utils
      logger.js        — Winston logger config
      validators.js    — express-validator chains
    app.js             — Express app setup (middleware, routes, error handler)
    server.js          — Start server
  /prisma
    schema.prisma
    seed.js            — Seed data brokers
    /migrations        — Auto-generated by Prisma
  package.json
  .env.example

/docs
  README.md
  API.md
  DEPLOYMENT.md
```

## Key Implementation Details

### Assessment Loading UX
The loading screen should show sequential progress steps with checkmarks as each "completes." The actual API call happens as a single request to the backend; the frontend simulates the step-by-step progress for UX purposes using timed intervals (~7 seconds total to match the "60 seconds" promise while feeling fast).

### Score Gauge Component
Use SVG circle with stroke-dasharray for the circular progress gauge. Color transitions:
- 0-25: `#22C55E` (green)
- 26-50: `#EAB308` (yellow)
- 51-75: `#F97316` (orange)
- 76-100: `#EF4444` (red)

### Stripe Integration
- Create Products and Prices in Stripe Dashboard first, then use Price IDs in env vars
- Use Stripe Checkout (redirect flow), not embedded elements
- Webhook must use raw body parser (not JSON) for signature verification
- After successful checkout, update user's subscriptionTier in database

### API Error Handling Pattern
Every external API call should be wrapped in try/catch with timeout (10 seconds). If an API fails, log the error and return partial results rather than failing the entire assessment. The scoring algorithm should handle missing data gracefully (treat missing data as 0 for that category).

### GDPR Delete Account
When a user deletes their account:
1. Cancel any active Stripe subscription
2. Delete all remediation_actions
3. Delete all assessments
4. Delete user record
5. Return confirmation
All cascading deletes are handled by Prisma's onDelete: Cascade, but explicitly cancel Stripe first.

## Testing

Create these test files:

### Backend Tests (`/backend/__tests__/`)
- `auth.test.js`: Test signup validation, login flow, password reset, email verification
- `scoring.test.js`: Test score calculation with various inputs (0 breaches, max breaches, partial data)
- `assessment.test.js`: Test assessment creation, authorization checks, free tier limits

### Frontend Tests (`/frontend/src/__tests__/`)
- `AuthContext.test.jsx`: Test login/logout state management
- `ScoreGauge.test.jsx`: Test score rendering and color coding

Use Jest + Supertest for backend, Vitest + React Testing Library for frontend.

## Build every file listed above. Make every file production-ready with proper error handling, input validation, and no console.log statements (use the winston logger in backend, remove all console.logs in frontend production builds). Include proper TypeScript-style JSDoc comments on complex functions.
