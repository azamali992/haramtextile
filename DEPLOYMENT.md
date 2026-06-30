# Deploying Haram Textile to Vercel

This is the step-by-step runbook to take the site from this local repo to a live
Vercel deployment, using **GitHub + Vercel** and a **Neon** cloud Postgres.

The code is already deploy-ready: `.npmrc` forces `legacy-peer-deps` so Vercel's
install succeeds, `sitemap.ts` is `force-dynamic` (no DB needed at build), and
`npm run build` runs `prisma generate` before `next build`.

> Why not the local database? The app currently talks to a Docker Postgres on
> `localhost:5432`. Vercel's serverless functions run in the cloud and cannot
> reach your laptop, so production needs a hosted Postgres.

---

## Step 1 — Create a cloud Postgres (Neon)

1. Go to <https://neon.tech> and sign up (free tier is plenty to start).
2. Create a project (region: pick one close to your users / your Vercel region).
3. From the project dashboard, copy **two** connection strings:
   - **Pooled** connection (host contains `-pooler`) → used by the app at runtime
     on Vercel. This is your `DATABASE_URL`.
   - **Direct** connection (no `-pooler`) → used once to run migrations + seed
     from your laptop.
   Both look like:
   `postgresql://<user>:<password>@<host>/<db>?sslmode=require`
   (Keep `sslmode=require`.)

## Step 2 — Apply migrations + seed to Neon (from your laptop)

The Prisma CLI reads `DATABASE_URL` from `.env` (not `.env.local`), so pass the
**direct** Neon URL explicitly for these one-time commands. In PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://<user>:<password>@<direct-host>/<db>?sslmode=require"
npx prisma migrate deploy        # creates all tables
npm run db:seed                  # seeds categories, products, certs, hero, etc. + the admin user
```

(Or in Git Bash: `DATABASE_URL="...direct..." npx prisma migrate deploy && DATABASE_URL="...direct..." npm run db:seed`.)

The seed creates one admin user. Set `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`
in your shell before seeding, or it falls back to a placeholder you MUST change
after first login (see `prisma/seed.ts`).

## Step 3 — Push the repo to GitHub

A git repo with an initial commit already exists locally (branch `main`).
Create an empty GitHub repo (no README/license), then:

```powershell
git remote add origin https://github.com/<you>/haram-textile.git
git push -u origin main
```

`.gitignore` already excludes `.env`, `.env*.local`, `node_modules`, `.next`,
`.vercel`, and the generated Prisma client — no secrets are committed.

## Step 4 — Import the project in Vercel

1. <https://vercel.com> → **Add New… → Project** → import your GitHub repo.
2. Framework preset auto-detects **Next.js**. Leave build/output settings at the
   defaults (build command `npm run build`, install command `npm install` — the
   `.npmrc` handles the peer-deps flag automatically).
3. **Do NOT deploy yet** — add the environment variables first (Step 5), because
   `lib/config.ts` validates them at build time and the build will fail fast if
   any required one is missing.

## Step 5 — Set environment variables in Vercel

In the project's **Settings → Environment Variables**, add the following for the
**Production** (and ideally Preview) environment. All of these except
`NEXT_PUBLIC_GA_ID` are **required** — the build throws if any is missing.

| Variable | Value |
|---|---|
| `DATABASE_URL` | the **pooled** Neon URL from Step 1 |
| `NEXTAUTH_SECRET` | a long random string — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | your production URL (e.g. `https://haram-textile.vercel.app` or your custom domain) |
| `NEXT_PUBLIC_SITE_URL` | same production URL, **no trailing slash** |
| `CLOUDINARY_CLOUD_NAME` | from your Cloudinary account (same as local `.env.local`) |
| `CLOUDINARY_API_KEY` | from Cloudinary |
| `CLOUDINARY_API_SECRET` | from Cloudinary (keep private) |
| `EMAIL_HOST` | your SMTP host |
| `EMAIL_PORT` | e.g. `587` |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password / app password |
| `EMAIL_TO` | inbox that receives contact-form submissions |
| `NEXT_PUBLIC_GA_ID` | *(optional)* Google Analytics ID, or leave unset |

> Tip: you can copy the Cloudinary/SMTP values straight from your local
> `.env.local`. Only `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXT_PUBLIC_SITE_URL`
> differ between local and production.

### The URL chicken-and-egg
You may not know the final `*.vercel.app` URL until after the first deploy. Two
options:
- Add a **custom domain** first (Settings → Domains) and use that for
  `NEXTAUTH_URL` / `NEXT_PUBLIC_SITE_URL` from the start; or
- Deploy once with a best-guess URL, note the assigned domain, update those two
  vars, and **redeploy** (Deployments → ⋯ → Redeploy).

## Step 6 — Deploy

Trigger the deploy (Vercel auto-deploys on push, or click **Deploy**). The build
will: `npm install` (legacy-peer-deps) → `prisma generate` → `next build`. All
public pages are dynamic and will render against Neon at request time.

## Step 7 — Post-deploy checks

- Visit `/` — hero, products, certifications, client logos render.
- Visit `/products`, `/about`, `/certifications`, `/production`, `/contact`.
- Submit the contact form → confirm a row appears in admin **Submissions** and
  the notification email arrives at `EMAIL_TO`.
- Log in at `/admin/login` with the seeded admin credentials, then **change the
  password** if you used the placeholder.
- Upload an image in the admin panel → confirm it lands in Cloudinary and shows
  on the public site (`res.cloudinary.com` is already allow-listed in
  `next.config.mjs`).
- Check `/sitemap.xml` and `/robots.txt` resolve.

## Ongoing deploys

Every `git push` to `main` triggers a new production build. Pull requests get
preview deployments automatically. Schema changes: add a migration locally
(`prisma migrate dev`), commit it, push, then run `prisma migrate deploy`
against Neon (Step 2) — Vercel does not run migrations for you.

## Notes / gotchas

- **Image uploads** rely on Cloudinary, not Vercel's filesystem (which is
  read-only/ephemeral) — already handled by `lib/storage.ts`.
- **Rate limiting** on the contact form is in-memory (`lib/rate-limit.ts`); on
  serverless it resets per cold start / per instance. Fine for basic abuse
  deterrence; move to a shared store (e.g. Upstash) if you need strict limits.
- **CSP**: a Content-Security-Policy header is intentionally deferred (see
  `next.config.mjs`). The adaptive-grid bootstrap script and GA are inline.
- The optional **security review (Phase 5)** of the redesign was skipped at your
  request — worth running before sharing the URL widely.
