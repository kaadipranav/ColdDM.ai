ColdDM.ai

Minimal, fast cold outreach tool: upload leads, draft variables-based templates, track opens/clicks, and schedule sequences.

Security & DX pass (risks and mitigations)
- Secrets management
  - Risk: Leaking `NEXTAUTH_SECRET`, DB creds, SMTP creds.
  - Mitigation: Use Vercel Encrypted Environment Variables; never commit .env; rotate on suspicion; restrict DB user perms.
- SSRF via redirects (click tracking `/t`)
  - Risk: Open redirect to arbitrary schemes/hosts.
  - Mitigation: Validate `url` against an allowlist of `http/https` schemes; optionally restrict to external hosts; strip credentials fragments; add domain allowlist if needed.
- Link/open tracking abuse
  - Risk: Endpoint used for phishing or log injection.
  - Mitigation: Rate limit by IP and sendId; log and cap events; set cache headers; avoid reflecting untrusted input.
- Authorization (workspaceId)
  - Risk: Cross‑workspace access to entities by ID.
  - Mitigation: Always scope queries by `workspaceId` from session; never trust client‑provided workspaceId; set in server via cookie/session; verify on mutations & reads.
- Template HTML sanitization
  - Risk: Stored XSS in templates.
  - Mitigation: Use `sanitizeHTML` (DOMPurify) before sending/storing and for previews; limit allowed tags/attrs; strip inline scripts and data URIs.
- Rate limits
  - Risk: Brute force login, API abuse, email floods.
  - Mitigation: Upstash sliding window for login; token bucket for sending (per account); per‑IP throttling on public routes.
- Email header injection
  - Risk: Newlines in subject/headers.
  - Mitigation: Reject `\r`/`\n` in subject/from/to; rely on nodemailer’s header normalization; validate inputs.
- Webhooks integrity
  - Risk: Spoofed bounce events.
  - Mitigation: Verify signatures (SES/Mailgun); check source IPs if feasible; apply idempotency.

Features
- CSV import with column mapping and preview
- Variables in templates with fallbacks: `{{firstName||there}}`
- A/B variants with weighted splits
- Sequenced sends with daily caps and retry backoff
- Open and click tracking
- Basic dashboards for lists, templates, sequences

Stack
- Next.js (App Router, TypeScript)
- Prisma + PostgreSQL (Neon)
- NextAuth (Credentials + Google)
- Nodemailer (SMTP providers: SES, Mailgun, generic)
- Inngest (cron/polling)
- Upstash Redis (rate limits)
- Tailwind, shadcn‑style UI primitives

Local development
1. Clone repo and install deps
   - `npm ci`
2. Copy env and fill minimum vars (Google optional for local):
   - `cp colddm/env.example .env.local`
3. Start Postgres (Neon or local) and set `DATABASE_URL`.
4. Prisma
   - `npx prisma migrate deploy`
   - `npx prisma db seed` (optional if seed available)
5. Dev server
   - `npm run dev`

Environment configuration
- Minimum to run with Google auth only:
  - `APP_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- For sending and rate limiting also add:
  - SMTP (SES/Mailgun/generic), `MAIL_FROM_*`
  - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - `INNGEST_EVENT_KEY` (cron polling)

Testing
- Unit/integration/e2e via Vitest & Playwright
  - `npm run test`
  - E2E requires a running dev server and basic env vars

Deploy
1. Set env vars in Vercel (see `colddm/env.example`)
2. Database: run `npx prisma migrate deploy`
3. Inngest: set keys; Vercel Cron hits `/api/inngest` every 5 minutes (`vercel.json`)
4. Configure email provider (SES/Mailgun/SMTP) and webhooks (optional)

What’s next (roadmap)
- Strict allowlist validation for `/t?url=` and signed redirect tokens
- Full workspace RBAC with row‑level checks on all queries
- Template linting (broken variables, missing unsubscribe)
- Per‑route and per‑user rate limits; abuse heuristics and IP reputation
- Bounce/complaint feedback loops and auto‑suppression list
- DKIM/SPF warmup guidance and sending window controls
- Edge cache for static/public assets; payload size budgets

