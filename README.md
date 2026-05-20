<p align="center">
  <img src="docs/logo.png" alt="Motiv" width="320" />
</p>

<p align="center">
  <strong>Stake real money on your habits. Execute or forfeit.</strong>
</p>

<p align="center">
  <a href="https://pages.cloudflare.com"><img src="https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Pages" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://developers.cloudflare.com/workers/"><img src="https://img.shields.io/badge/Runtime-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Workers" /></a>
</p>

---

Motiv is a commitment device backed by behavioral economics. Users stake real money on daily habits — gym, coding, studying, waking up early, reducing screen time. Every day they submit verifiable proof. Pass: money stays. Miss: it burns. No grace periods. No streaks to coddle you. Just consequence.

The mechanism is deliberate: loss aversion research consistently shows that the pain of losing is roughly twice as motivating as the pleasure of an equivalent gain. Motiv puts that asymmetry to work.

---

## Architecture

```
motiv-cloudflare/
├── src/
│   ├── app/
│   │   ├── api/              # Edge API routes (auth, stakes, proofs, payments, groups, cron)
│   │   ├── dashboard/        # User dashboard
│   │   ├── stake/new/        # Stake creation
│   │   ├── groups/           # Group challenges + community voting
│   │   ├── leaderboard/      # Global leaderboard
│   │   └── admin/            # Operations panel
│   ├── components/ui/        # Shared UI — streaks, heatmaps, countdown timers, confetti
│   └── lib/
│       ├── auth.ts           # JWT auth
│       ├── db.ts             # D1 (SQLite) wrapper
│       ├── ai.ts             # OpenAI Vision — photo proof analysis
│       ├── r2.ts             # R2 object storage
│       └── verification/     # Proof engines: coding, fitness, wakeup, screentime
├── public/
│   └── extension/            # Chrome extension for screen-time verification
└── remotion/                 # Video generation scenes
```

**Infrastructure:** Cloudflare Pages + Workers (edge runtime), D1 for the database, R2 for file storage. Zero cold starts. Global distribution by default.

---

## How It Works

| Step | What happens |
|------|-------------|
| **Stake** | Lock ₹100–₹25,000 on a daily habit for a fixed duration |
| **Prove** | Submit daily proof before the deadline — photo, GPS, coding platform activity, Strava sync, or screen-time report via browser extension |
| **Verify** | AI vision analysis, API checks against LeetCode/Codeforces/GitHub, or GPS proximity — automated where possible, community vote as fallback |
| **Settle** | Pass → keep your stake. Miss → a fixed amount burns. Streaks earn badges. Losses go to the prize pool. |

---

## Verification Methods

- **AI photo analysis** — OpenAI GPT-4o Vision with live keyword injection to prevent replay attacks
- **Coding platforms** — LeetCode, Codeforces, and GitHub API submission verification
- **Fitness** — Strava OAuth sync (runs, rides, workouts)
- **GPS proximity** — Check-in within configurable radius of a target location
- **Screen time** — Chrome extension reports session data; no screenshots, no surveillance
- **Community voting** — Group challenges fall back to peer review with majority-vote settlement

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 App Router | File-based routing, React Server Components, edge-ready |
| Runtime | Cloudflare Workers | True edge execution, no cold starts, global by default |
| Database | Cloudflare D1 (SQLite) | Co-located with compute, zero-latency reads at the edge |
| Storage | Cloudflare R2 | S3-compatible, no egress fees |
| Auth | Custom JWT | Lightweight, no external auth dependency at the edge |
| AI | OpenAI GPT-4o-mini | Vision at cost — fast enough for real-time proof review |
| Animations | GSAP + Framer Motion | Scroll-driven animations, spring physics |
| Styling | Tailwind CSS | Utility-first, zero runtime |
| State | Zustand | Minimal, no boilerplate |
| Video | Remotion | Programmatic React-based video for marketing |

---

## Local Development

**Prerequisites:** Node.js 20+, [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/), a Cloudflare account.

```bash
git clone https://github.com/Motiv-Dev/motiv.git
cd motiv/motiv-cloudflare

npm install

# Configure environment
cp .env.example .env.local
cp .dev.vars.example .dev.vars
# Fill in values — see Environment Variables below

# Provision local D1 database
npx wrangler d1 execute motiv-db --local --file=schema.sql

# Start dev server
npm run dev
# → http://localhost:3000

# Preview on Cloudflare's local edge runtime
npm run preview
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Token signing secret |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin panel credentials |
| `NEXT_PUBLIC_APP_URL` | Deployed app URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `OPENAI_API_KEY` | GPT-4o Vision — omit to disable AI verification |
| `CRON_SECRET` | Authenticates daily burn cron calls |
| `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` | Strava OAuth app credentials |

Cloudflare-specific bindings (D1, R2, KV) are declared in `wrangler.toml` and injected at runtime — no `.env` needed for them in production.

---

## Deployment

Pushes to `main` deploy automatically via GitHub Actions (`.github/workflows/deploy.yml`).

**First-time setup:**

```bash
# Create Cloudflare resources
npx wrangler d1 create motiv-db
npx wrangler r2 bucket create motiv-uploads

# Run schema migration
npx wrangler d1 execute motiv-db --file=schema.sql

# Deploy
npm run deploy
```

---

## License

Private — All rights reserved. © 2025 Motiv.
