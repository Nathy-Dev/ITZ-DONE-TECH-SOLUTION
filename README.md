# ITZ-DONE TECH SOLUTION

A course marketplace built with Next.js, Convex, and Flutterwave.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Payments & Payouts (Flutterwave)

This platform uses [Flutterwave](https://flutterwave.com) for course payments and instructor payouts.

### Business Model

When a student pays for a course, the revenue is split automatically:

| Share   | Recipient           |
| ------- | ------------------- |
| **60%** | Course instructor   |
| **40%** | ITZ-DONE (platform) |

### Environment Variables

Add these to `.env.local` (or your hosting provider's environment settings):

```bash
# Flutterwave API keys — https://app.flutterwave.com/dashboard/settings/apis
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxxxxxxxxxx-X

# Webhook signature hash — set the SAME value in
# Flutterwave Dashboard > Settings > Webhooks
FLUTTERWAVE_SECRET_HASH=your-secret-hash

# Public app URL (payment redirect URLs) — set to your production domain
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# USD→NGN fallback rate if the live FX feed is unreachable
# (live rates come automatically from ExchangeRate-API via /api/fx-rate)
NEXT_PUBLIC_USD_TO_NGN_RATE=1550

# Shared secret guarding server-to-server Convex mutations (payment
# completion, payout processing). Generate one with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Set the SAME value in your Convex deployment env vars
# (Dashboard > Settings > Environment Variables).
CONVEX_MUTATION_SECRET=<random-64-char-hex>
```

### Flutterwave Dashboard Setup (Production)

1. **API Keys**: Copy your **Secret Key** (live mode) into `FLUTTERWAVE_SECRET_KEY`.
2. **Webhooks**: In Dashboard → Settings → Webhooks, set the secret hash to match
   `FLUTTERWAVE_SECRET_HASH`, and register these webhook URLs:
   - Payment confirmations: `https://yourdomain.com/api/payments/webhook`
   - Payout transfer updates: `https://yourdomain.com/api/payouts/webhook`
3. **Transfers**: Payouts use Flutterwave Transfers. Ensure your Flutterwave balance
   is funded and your account is approved for live transfers.

### Currency Model (NGN + USD display)

All prices are **set and charged in Naira (₦)** — Flutterwave processes the
payment and instructor payouts in NGN, so there is a single settlement
currency and no conversion conflicts. To serve international students,
USD equivalents (e.g. "₦25,000 (~$16.13)") are shown as **reference only**
next to prices on the course page, checkout, and course creation form.

- **Live rates are automatic**: [`/api/fx-rate`](src/app/api/fx-rate/route.ts)
  proxies ExchangeRate-API's free open endpoint (no API key, refreshed
  daily) with 6-hour server-side caching. `NEXT_PUBLIC_USD_TO_NGN_RATE` is
  only a fallback if the feed is ever unreachable.
- Instructors set prices in ₦ and see their 60% earnings share per sale.
- Students always pay the exact ₦ amount shown at Flutterwave checkout.

### Role-Based Feature Separation

The platform enforces a clean learner/instructor split — each account type
only sees features relevant to it:

| Feature                      | Learner | Instructor               |
| ---------------------------- | ------- | ------------------------ |
| Browse/search courses        | ✅      | ✅                       |
| Cart, checkout, payments     | ✅      | ❌ (hidden + redirected) |
| "Add to Cart" buttons        | ✅      | ❌                       |
| Enroll & take lessons        | ✅      | ✅ (for reference)       |
| Create/manage courses        | ❌      | ✅                       |
| Earnings & payouts dashboard | ❌      | ✅                       |
| Payout bank account settings | ❌      | ✅                       |
| Admin dashboard              | ❌      | admin only               |

Users can switch between Learner and Instructor modes from the profile menu —
the UI and available features update accordingly. All instructor-only
mutations (course CRUD, curriculum editing, payouts) are additionally
protected by **server-side role and ownership checks** in Convex.

### How It Works

**Student pays for a course:**

1. Student clicks _Complete Enrollment_ on `/checkout`.
2. The server ([`src/app/api/payments/initiate/route.ts`](src/app/api/payments/initiate/route.ts))
   re-computes prices from the database (client totals are never trusted), creates a
   `pending` payment record, and requests a Flutterwave hosted-checkout link.
3. Student pays on Flutterwave (card, transfer, USSD, etc.).
4. Flutterwave calls our webhook
   ([`src/app/api/payments/webhook/route.ts`](src/app/api/payments/webhook/route.ts)),
   which verifies the SHA-256 signature **and** re-verifies the transaction against
   Flutterwave's API before granting access.
5. [`convex/payments.ts`](convex/payments.ts) then (idempotently):
   - marks the payment `successful`,
   - enrolls the student,
   - splits revenue — 60% instructor earning, 40% platform earning.
6. The success page also self-verifies via
   [`src/app/api/payments/verify/route.ts`](src/app/api/payments/verify/route.ts)
   as a fallback if the webhook is delayed.

**Tutor receives payouts:**

1. Tutor adds their local bank account in **Profile → Payout Account**
   ([`src/components/profile/PayoutSettings.tsx`](src/components/profile/PayoutSettings.tsx)).
   The account name is resolved and verified via Flutterwave's bank lookup.
2. Tutor requests a payout from **Dashboard → Earnings & Payouts**
   ([`src/components/dashboard/EarningsPanel.tsx`](src/components/dashboard/EarningsPanel.tsx))
   — withdraws their full available balance (min ₦1,000).
3. Admin reviews the request at **Admin → Payouts**
   ([`src/app/admin/payouts/page.tsx`](src/app/admin/payouts/page.tsx)) and clicks
   _Approve & Pay_, which executes a real Flutterwave transfer
   ([`src/app/api/admin/payouts/route.ts`](src/app/api/admin/payouts/route.ts)).
4. Transfer status updates arrive via the payouts webhook and earnings are marked `paid`.

### Security Notes

- All amounts are computed **server-side** from the database.
- Webhooks are rejected unless the `verif-hash` signature matches, and successful
  charges are re-verified against Flutterwave's API before enrollment.
- Payment completion is **idempotent** — duplicate webhooks can't double-enroll or
  double-credit earnings.
- Admin payout operations are restricted to `SUPER_ADMIN_EMAILS`
  (see [`convex/constants.ts`](convex/constants.ts)).
- Card details never touch our servers — Flutterwave handles the entire checkout.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Remember to set all environment variables (including the Convex and Flutterwave keys)
in your hosting provider's dashboard, and run `npx convex deploy` to push the latest
Convex functions to production.
