# MedLive Healthcare — India

E-commerce for home patient care essentials — gloves, adult diapers, disinfectant wipes — with Indian pricing (₹), GST invoices, and pan-India delivery.

## Features

- Product catalog with PDP galleries, bulk pricing, and compliance (HSN, MRP, GST)
- User accounts — sign up, sign in, password reset (token-based)
- Shopping cart with nitrile pack variants and promo codes
- Checkout — COD or Razorpay, server-validated totals, GSTIN on invoice
- Order tracking with COD-aware timeline
- Legal policy pages (privacy, terms, shipping, returns)

## Getting Started

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
AUTH_SECRET=replace_with_a_long_random_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Razorpay

1. Create an account at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Generate **Test** API keys under Settings → API Keys
3. Add keys to `.env.local` (never commit this file)

Test payment details: [Razorpay test docs](https://razorpay.com/docs/payments/payments/test-card-upi-details/).

## Tech Stack

- Next.js 16 (App Router)
- React 19, TypeScript, Tailwind CSS 4
- Server-side store: **Supabase PostgreSQL** (or local `data/medlive.json` fallback)
- bcrypt + JWT sessions, Razorpay checkout

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes (production) | Supabase PostgreSQL connection string (pooler, port 6543) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | For online pay | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | For online pay | Razorpay secret (server only) |
| `AUTH_SECRET` | Yes | Session JWT signing secret |
| `NEXT_PUBLIC_APP_URL` | Production | Public site URL for reset emails |

Without `DATABASE_URL`, the app falls back to `data/medlive.json` locally (not for production).

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run the script in [`supabase/schema.sql`](supabase/schema.sql)
3. Copy the **Connection string** (URI) from **Settings → Database** — use the pooler host on port **6543**
4. Add to `.env.local` (and Vercel / Render):

```env
DATABASE_URL=postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
```

See `.env.example` for a safe template. **Do not commit `.env.local` or real API keys.**

## Deployment (Vercel + Render)

The app supports a **split deployment**: UI on **Vercel**, API + database on **Render**.

### Vercel (frontend)

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` |
| `NEXT_PUBLIC_APP_URL` | `https://your-frontend.vercel.app` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_...` |

Do **not** add `DATABASE_URL` or `AUTH_SECRET` on Vercel.

### Render (backend)

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | Supabase PostgreSQL pooler URI |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_...` |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://your-frontend.vercel.app` (password reset links) |

**Build command:** `npm install && npm run build`  
**Start command:** `npm start`

Leave `NEXT_PUBLIC_API_URL` **empty** locally to run as a single app on `localhost:3000`.
