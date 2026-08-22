# Tips Deck

**Smarter sports picks, every day.**

Tips Deck is a mobile-first sports prediction platform designed around clear analysis, transparent results, and curated prediction Decks. This repository contains a single Next.js application for the public site, account area, premium experience, and future admin tools.

## Stage status

Stage 4 authentication and the Stage 7 premium-payment foundation are implemented. Results settlement and performance analytics remain future stages.

The application now includes:

- Next.js 16 App Router with strict TypeScript
- Tailwind CSS 4 design system and responsive public shell
- Accessible session-aware header, mobile navigation, footer, and homepage
- Original Tips Deck visual identity and responsible-betting messaging
- Prisma ORM with PostgreSQL configuration
- Foundational `Setting` model and idempotent seed framework
- Zod environment validation
- ESLint, Vitest, type-check, and production-build scripts
- League, Team, and Fixture models with indexed external identifiers
- A configurable `FootballProvider` contract and deterministic mock provider
- Idempotent local fixture synchronization for past and upcoming dates
- UTC-safe yesterday, today, and tomorrow fixture queries
- A secret-protected `/api/cron/sync-fixtures` endpoint
- Seeded development football data and an `/admin/fixtures` browser
- Free and premium predictions with server-side premium redaction
- Public prediction board, search, day tabs, and prediction detail pages
- Editable Decks with pricing metadata and activation controls
- Admin prediction creation, editing, result updates, publishing, and unpublishing
- Public About, VIP, legal, and responsible-gaming routes
- Secure bcrypt password hashing and opaque, hashed database sessions
- Registration, login, logout, protected account, and editable user profiles
- Database-backed login rate limiting, password-reset tokens, and audit logs
- Role-based admin authorization and super-admin user access management
- Authenticated VIP visibility for active premium members and staff roles
- Database-managed day, weekly, monthly, and Deck-specific VIP plans
- Paystack hosted checkout with card and mobile-money channel requests
- Server-to-server transaction verification with exact amount, currency, reference, and customer checks
- SHA-512 signed Paystack webhooks, idempotent fulfilment, refunds, and expiring entitlements
- Customer payment history plus admin plan, payment, and subscription screens
- Responsive admin control panel with live metrics, recent audit activity, and quick actions
- Dedicated manual result management with audited settlement changes
- Operational integration status and expanded staff/user management

Deliberately not included yet: password-reset email delivery, automated results settlement, or advanced performance analytics. These belong to later stages in `build prompt.txt`.

## Requirements

- Node.js 22.12 or newer
- npm 10 or newer
- PostgreSQL 15 or newer for database migrations and seeding

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and replace the sample PostgreSQL credentials.

3. Apply migrations and seed the database:

   ```bash 
   npm run db:migrate
   npm run db:seed
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

The homepage build does not query the database, so it can be previewed before PostgreSQL is connected. Database commands require a valid `DATABASE_URL`.

## Environment variables

| Variable | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Server only | For database work | PostgreSQL connection string used by Prisma |
| `NEXT_PUBLIC_APP_URL` | Public | Yes in deployment | Canonical application origin, for example `https://tips-deck.com` |
| `GOOGLE_SITE_VERIFICATION` | Server | Optional | Google Search Console HTML-tag verification token |
| `APP_ENV` | Server only | Optional | One of `development`, `test`, `staging`, or `production` |
| `CRON_SECRET` | Server only | For fixture sync | Long random secret accepted as a Bearer token or `x-cron-secret` header |
| `PAYSTACK_SECRET_KEY` | Server only | For live checkout | Paystack test or live secret key; never expose it to browser code |
| `SEED_ADMIN_EMAIL` | Server only | Optional | Email for the local super-admin created or promoted by the seed |
| `SEED_ADMIN_USERNAME` | Server only | Optional | Username for a newly seeded super-admin |
| `SEED_ADMIN_PASSWORD` | Server only | Optional | Initial password for the seeded super-admin; use a strong local secret |

Never commit `.env` files or expose `DATABASE_URL` to browser code.

## Vercel deployment

Import the GitHub repository into Vercel with the **Next.js** framework preset. Keep the default install and build commands and use Node.js 22, which is pinned in `package.json`.

Add the variables listed above under **Project Settings → Environment Variables**. Production requires `DATABASE_URL`, `NEXT_PUBLIC_APP_URL=https://tips-deck.com`, `APP_ENV=production`, `CRON_SECRET`, and `PAYSTACK_SECRET_KEY` when live checkout is enabled. Use a pooled PostgreSQL URL for application traffic.

Apply database migrations separately with `npm run db:deploy` before promoting a deployment that introduces schema changes. `vercel.json` invokes fixture synchronization at 02:00 UTC and subscription/payment expiration at 03:00 UTC each day; Vercel automatically sends `CRON_SECRET` as its Bearer authorization value.

## Quality checks

Run the complete verification suite:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Project structure

```text
app/
  (public)/          Public route group and homepage
  admin/             Role-protected fixture, prediction, Deck, and user tools
  api/cron/          Protected scheduled sync endpoint
  globals.css        Design tokens and global styles
  layout.tsx         Root metadata and document shell
components/
  layout/            Header and footer
  ui/                Reusable interface primitives
lib/
  config/            Product configuration
  db/                Server-only database client factory
  auth/              Password, session, authorization, and audit services
  football/          Provider contract, mock feed, queries, and sync service
  utils/             Shared utilities
  validation/        Zod schemas
prisma/
  schema.prisma      PostgreSQL schema
  seed.ts            Idempotent settings and football-data seed
tests/               Automated tests
```

## Database conventions

- Use Prisma migrations for every schema change.
- Add domain entities only in their designated build stage.
- Store money in integer minor units or `Decimal`, never JavaScript floating-point values.
- Keep generated Prisma files out of source control.
- Seed operations must remain safe to run repeatedly.

## Fixture synchronization

The application uses the mock provider until a licensed football-data integration is configured. It never scrapes sports websites and public/admin reads always come from PostgreSQL.

To apply migrations without granting the application role permission to create shadow databases, use:

```bash
npm run db:deploy
npm run db:seed
```

Trigger the cron-compatible sync for yesterday plus three upcoming days:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/sync-fixtures
```

Pass `?days=7` to sync more upcoming days; the endpoint accepts between 1 and 14.

## VIP pricing and Paystack

The seed creates editable launch defaults in Ghana cedis:

- VIP Day Pass: GHS 10 for one-day, Deck-specific access
- VIP Weekly: GHS 20 for seven days of all-premium access
- VIP Monthly: GHS 50 for 30 days of all-premium access

These are database values, not hardcoded storefront prices. Administrators can edit or deactivate them at `/admin/plans`.

To enable hosted checkout, set `PAYSTACK_SECRET_KEY` and ensure `NEXT_PUBLIC_APP_URL` is the public HTTPS origin. Configure this webhook in the Paystack dashboard:

```text
https://your-domain.example/api/payments/paystack/webhook
```

The callback route verifies transactions again with Paystack before creating an entitlement. Configure a scheduled POST to expire old subscriptions and abandoned payments:

```text
POST /api/cron/expire-subscriptions
Authorization: Bearer <CRON_SECRET>
```

Use Paystack test keys and test payment methods before switching to a live secret. Do not place the secret key in any `NEXT_PUBLIC_` variable.

## Next stage

Stage 5 adds score synchronisation, automatic and manual settlement, admin overrides, audit history, and historical result views. Password-reset tokens are already secure and single-use; delivery will be connected when transactional email is introduced in Stage 8.
