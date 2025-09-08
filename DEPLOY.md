ColdDM.ai Deployment Guide

This guide covers deploying to Vercel with Neon (Postgres), Prisma, Inngest, Upstash Redis, and email providers.

Prerequisites
- Vercel account and project created
- Node 18+ locally
- Git repository connected to Vercel

1) Database: Neon Postgres
1. Create a Neon project and database.
2. Copy the connection string.
3. Set in Vercel env:
   - DATABASE_URL
   - SHADOW_DATABASE_URL (optional, for Prisma migrations; use a separate DB)
4. Run migrations locally or via Vercel build step:

```
npm ci
npx prisma migrate deploy
npx prisma db seed
```

2) Prisma
- Schema lives at colddm/prisma/schema.prisma
- Ensure DATABASE_URL is set locally and in Vercel.
- Run npx prisma generate automatically via postinstall or build.

3) Inngest
1. Create an Inngest app.
2. Generate keys and set in Vercel:
   - INNGEST_EVENT_KEY
   - INNGEST_SIGNING_KEY (if used for webhook verification)
3. The Next.js route is at /api/inngest.
4. A Vercel Cron hits /api/inngest every 5 minutes (see vercel.json).

4) Upstash Redis
1. Create an Upstash Redis database.
2. Set env vars:
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN
3. Used for rate limits and login throttling.

5) Auth (NextAuth) and OAuth
1. Set NEXTAUTH_URL to your production URL.
2. Generate NEXTAUTH_SECRET.
3. Configure Google OAuth (optional):
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - For local dev, set authorized redirect URL to http://localhost:3000/api/auth/callback/google

6) Email Providers
Pick one or more:
- SES SMTP:
  - SES_REGION, SES_ACCESS_KEY_ID, SES_SECRET_ACCESS_KEY
- Mailgun SMTP:
  - MAILGUN_SMTP_HOST, MAILGUN_SMTP_PORT, MAILGUN_SMTP_USER, MAILGUN_SMTP_PASS
- Generic SMTP:
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- From identity:
  - MAIL_FROM_NAME, MAIL_FROM_EMAIL

Webhooks (optional but recommended for bounces):
- SES: point to /api/webhooks/ses
- Mailgun: point to /api/webhooks/mailgun

7) Tracking & Open Pixel
- Click tracking: /t/[trackId]?url=...
- Open tracking: /o/[openId].png

8) Vercel Configuration
- vercel.json includes a 5‑minute cron for /api/inngest.
- Functions are standard Node runtimes (Prisma requires Node, not Edge).

9) Environment Variables Checklist
See .env.example in repo root for the full list; mirror them in Vercel.

10) Testing
- Vitest config is present; run locally:

```
npm run test
```

11) First deploy
1. Push to main and let Vercel build.
2. After deploy, verify:
   - Auth sign‑in works
   - DB queries work
   - Inngest route responds (200)
   - Tracking routes respond
   - Webhooks accept requests

Troubleshooting
- Prisma on Vercel: Neon works via DATABASE_URL.
- If you see cold starts on Prisma, ensure single PrismaClient instance (already in lib/prisma.ts).

