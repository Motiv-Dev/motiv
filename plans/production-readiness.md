# Motiv — Production Readiness Plan

## Context

The roadmap PDF outlines a 2-week sprint to move Motiv from "deployed prototype" to "publicly launchable product." After a full codebase audit mapped against each item in that document, the actual state differs significantly from what the PDF assumes — some things are already solid, others are broken in ways more serious than described.

This plan prioritises by real impact, not by the PDF's assumed order.

---

## Audit Findings: What's Actually True Right Now

### Already Done (PDF thought these needed work)
| Item | Reality |
|------|---------|
| GitHub Actions CI/CD | `.github/workflows/deploy.yml` works — pushes to `main` auto-deploy |
| Strava OAuth | **Fully implemented** — token exchange, storage, refresh, and exercise verification all work |
| Admin rejection notes | Notes saved to DB, displayed on user dashboard |
| Tailwind dark mode config | `darkMode: 'class'` is set correctly |
| Rate limiting coverage | Comprehensive per-IP, per-route limits in middleware |

### Broken / Missing
| Item | Severity | Detail |
|------|----------|--------|
| **Cron trigger** | 🔴 Critical | No `[triggers] crons` in `wrangler.toml`. Burn endpoint is an HTTP POST that is **never called automatically**. Users who miss days are never charged. Core value prop is broken. |
| **Countdown timer** | 🔴 Critical | `dashboard/page.tsx:472` passes `new Date().toISOString()` (today) instead of `stake.end_date`. Timer always counts to midnight tonight regardless of stake. |
| **Password reset** | 🔴 Critical | No API, no UI, no email function. Users who forget password are permanently locked out. |
| **Email verification** | 🟠 High | Signup creates account and immediately logs in with no email check. Schema has no `email_verified` column. |
| **Email provider** | 🟠 High | `src/lib/email.ts` relays through a Vercel deployment at `motiv-app-five.vercel.app/api/email-relay`. Silently fails if `EMAIL_RELAY_SECRET` is not set. |
| **KV rate limiting** | 🟠 High | Rate limits use in-memory `Map` in middleware. Resets on every cold start — provides zero protection in production. |
| **Dark mode orphaned** | 🟡 Medium | `DarkModeToggle.tsx` exists and works but is **never rendered** anywhere. No `import` found in any page or layout. |
| **Zustand persistence** | 🟡 Medium | `src/lib/store.ts` has no `persist` middleware. Dark mode + sound prefs reset on every reload. |
| **Admin email on rejection** | 🟡 Medium | `api/admin/proofs/route.ts` rejection path never calls email lib. |
| **Admin auto-refresh** | 🟡 Medium | Proofs page fetches once on mount. No polling. Admins must manually refresh. |

---

## Phased Implementation Plan

---

### Phase 1 — Fix What Breaks the Product (Days 1–3)

#### 1A. Cron System — Cloudflare Workers Scheduled Handler

**The Problem:** The daily burn is an HTTP route. No one calls it. Users never get charged.

**Solution:** Cloudflare Pages does not support scheduled triggers. The project must add a **standalone Cloudflare Worker** (separate from the Pages app) that runs on a cron schedule and calls the burn endpoint with the `CRON_SECRET`.

**Files to change:**
- `motiv-cloudflare/wrangler.toml` — add a Workers script section with `[triggers] crons`
- Create `motiv-cloudflare/src/worker.ts` — exports a `scheduled()` handler that POSTs to `/api/cron/daily-burn` with `Authorization: Bearer ${CRON_SECRET}`
- OR: add a second `wrangler.worker.toml` targeting `src/worker.ts` as a separate deployment

**wrangler.toml addition:**
```toml
[triggers]
crons = ["0 0 * * *"]   # midnight UTC daily
```

**Leeway check:** `api/cron/daily-burn/route.ts` already queries proofs but does NOT check `leeway_requests` table before burning. Add a join to skip burns where an approved leeway exists for that user+date.

**Critical dependency:** `CRON_SECRET` must be set as a Cloudflare Pages secret (already documented in `.dev.vars.example`).

#### 1B. Countdown Timer — One-Line Fix

**File:** `motiv-cloudflare/src/app/dashboard/page.tsx:472`

**Fix:**
```tsx
// BEFORE (broken)
<CountdownTimer deadline={new Date().toISOString()} dailyAmount={stake.daily_amount} />

// AFTER
<CountdownTimer deadline={stake.end_date} dailyAmount={stake.daily_amount} />
```

`end_date` column exists in `schema.sql`. Already on the stake object. Zero schema work needed.

#### 1C. KV Rate Limiting

**File:** `motiv-cloudflare/src/middleware.ts`

**Changes:**
1. Add KV namespace binding to `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "RATE_LIMIT_KV"
   id = "<create via wrangler kv:namespace create>"
   ```
2. Replace `rateLimitStore = new Map()` with KV reads/writes using `env.RATE_LIMIT_KV`
3. Keep the same per-route limits and window logic — just swap storage backend
4. TTL on KV entries = window duration (avoids manual cleanup)

**Note:** The admin login brute-force in `api/admin/login/route.ts` also uses an in-memory Map — migrate that too.

---

### Phase 2 — Auth Completion (Days 4–7)

#### 2A. Email Provider Migration (prerequisite for 2B and 2C)

**File:** `motiv-cloudflare/src/lib/email.ts`

Replace the Vercel relay with **Resend** (edge-compatible, simple API, generous free tier).

```bash
npm install resend
```

**New implementation pattern:**
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
```

Add `RESEND_API_KEY` to `.env.example`, `.dev.vars.example`, and Cloudflare Pages secrets.

Functions to keep: `notifyNewUser`, `notifyPaymentUploaded`, `notifyProofSubmitted`
Functions to add: `sendPasswordResetEmail`, `sendEmailVerification`

#### 2B. Password Reset

**New files:**
- `src/app/api/auth/forgot-password/route.ts` — accepts `email`, generates signed token (JWT, 1hr expiry), stores token hash in DB, sends reset email
- `src/app/api/auth/reset-password/route.ts` — accepts `token + new_password`, verifies token, updates `password_hash`, invalidates token
- `src/app/forgot-password/page.tsx` — email input form
- `src/app/reset-password/page.tsx` — new password form (reads `?token=` from URL)

**Schema addition** (`schema.sql`):
```sql
ALTER TABLE users ADD COLUMN reset_token_hash TEXT;
ALTER TABLE users ADD COLUMN reset_token_expires DATETIME;
```

**Login page** (`src/app/login/page.tsx`) — add "Forgot password?" link below the form.

#### 2C. Email Verification

**Schema addition:**
```sql
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN verification_token TEXT;
```

**Changes:**
- `src/app/api/auth/signup/route.ts` — set `email_verified=0`, generate token, send verification email, but still create session (gate features, not login)
- `src/app/api/auth/verify-email/route.ts` — new route, validates token, sets `email_verified=1`
- `src/middleware.ts` — soft gate: unverified users see a banner but are not locked out (avoids blocking beta testers)

---

### Phase 3 — Polish & Admin (Days 8–12)

#### 3A. Dark Mode — Wire It Up

**Files:**
- `src/lib/store.ts` — add `persist` middleware from `zustand/middleware`
  ```typescript
  import { persist } from 'zustand/middleware';
  export const useAppStore = create(persist(..., { name: 'motiv-prefs' }));
  ```
- `src/app/layout.tsx` — import and render `<DarkModeToggle />` in the nav/header, and add a script to apply the class on load (avoid FOUC):
  ```html
  <script dangerouslySetInnerHTML={{ __html: `
    const dark = JSON.parse(localStorage.getItem('motiv-prefs') || '{}')?.state?.darkMode;
    if (dark) document.documentElement.classList.add('dark');
  `}} />
  ```

#### 3B. Admin — Email on Rejection + Auto-refresh

**Files:**
- `src/app/api/admin/proofs/route.ts` — after updating status to "rejected", call `sendProofRejectedEmail(userEmail, habitType, admin_notes)`
- Add `sendProofRejectedEmail()` to `src/lib/email.ts`
- `src/app/admin/proofs/page.tsx` — add `setInterval(() => fetchProofs(), 30_000)` in `useEffect` with cleanup

#### 3C. Admin Filtering

**File:** `src/app/admin/proofs/page.tsx`
- Add user email search input (client-side filter on loaded data)
- Add habit type filter dropdown

---

### Phase 4 — Launch Configuration (Non-code, Parallel Track)

These are Cloudflare/DNS/service configuration steps, not code:

1. **Custom domain** — add in Cloudflare Pages dashboard → Settings → Custom domains
2. **Production env vars** — set all secrets in Cloudflare Pages dashboard (currently dev keys are in `.env.local`):
   - `JWT_SECRET` (generate new, random, 64-char)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_APP_URL` → production domain
   - `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (production Clerk app)
   - `RESEND_API_KEY` (after Phase 2A)
   - `CRON_SECRET`
   - `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`
3. **Cloudflare KV namespace** — create via `wrangler kv:namespace create RATE_LIMIT_KV`, add ID to `wrangler.toml`
4. **Branch protection** — require PR + passing CI before merge to `main`

---

## Priority Order Summary

| Order | Item | Phase | Impact |
|-------|------|-------|--------|
| 1 | Cron trigger + scheduled handler | 1A | Core mechanics broken without this |
| 2 | Countdown timer fix | 1B | 1-line fix, high UX impact |
| 3 | Email provider (Resend) | 2A | Unblocks password reset + verification |
| 4 | KV rate limiting | 1C | Security/stability in production |
| 5 | Password reset | 2B | Users permanently locked out without it |
| 6 | Email verification | 2C | Trust + fake account prevention |
| 7 | Dark mode + persistence | 3A | Polish, quick win |
| 8 | Admin email on rejection | 3B | Operational quality |
| 9 | Admin auto-refresh + filters | 3B/3C | Operational quality |
| 10 | Production env/domain config | 4 | Pre-launch checklist |

---

## Critical Files

| File | Change |
|------|--------|
| `motiv-cloudflare/wrangler.toml` | Add cron trigger + KV namespace binding |
| `motiv-cloudflare/src/app/dashboard/page.tsx:472` | Fix `deadline` prop — pass `stake.end_date` |
| `motiv-cloudflare/src/middleware.ts` | Migrate rate limit store from Map to KV |
| `motiv-cloudflare/src/app/api/admin/login/route.ts` | Migrate brute-force map to KV |
| `motiv-cloudflare/src/lib/email.ts` | Replace Vercel relay with Resend |
| `motiv-cloudflare/src/lib/store.ts` | Add `persist` middleware |
| `motiv-cloudflare/src/app/layout.tsx` | Render DarkModeToggle, add FOUC prevention script |
| `motiv-cloudflare/src/app/api/auth/` | Add forgot-password, reset-password, verify-email routes |
| `motiv-cloudflare/src/app/api/cron/daily-burn/route.ts` | Add leeway check before burning |
| `motiv-cloudflare/schema.sql` | Add reset_token, email_verified columns |
| `motiv-cloudflare/src/app/api/admin/proofs/route.ts` | Send rejection email |
| `motiv-cloudflare/src/app/admin/proofs/page.tsx` | Add polling + user/type filters |

---

## Verification Checklist

- [ ] Create a stake, miss a day, confirm burn runs at midnight and deducts correctly
- [ ] Confirm leeway-approved day is skipped by burn
- [ ] Countdown timer shows stake's actual end_date, not today
- [ ] Forgot password flow: receive email, click link, reset password, login
- [ ] Signup: receive verification email, verify, see badge disappear
- [ ] Rate limits survive multiple cold starts (KV-backed)
- [ ] Dark mode persists across reload and new tabs
- [ ] Admin rejects proof → user receives rejection email with notes
- [ ] Admin proofs panel refreshes automatically every 30s
