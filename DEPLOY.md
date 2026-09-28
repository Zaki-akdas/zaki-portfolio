# Deploying the Portfolio

The site is a Next.js 14 app with a **tri-mode content store**:

- **Production (Vercel):** content and messages are durable in **Supabase
  Postgres** (`DATABASE_URL`), media uploads in **Supabase Storage** (public
  `media` bucket). No writable disk is needed — this is why Vercel's ephemeral
  filesystem is fine.
- **Local dev / e2e:** with no `DATABASE_URL`, the store falls back to the JSON
  files under `data/` (and `DATA_DIR`/`UPLOADS_DIR` if set).

The recommended host is **Vercel** — every push to `main` deploys automatically.
Render, Railway and a plain VPS also work (they can use the JSON-file store on a
persistent disk instead of Postgres); see the alternatives below.

---

## 1. Push to GitHub (one-time)

The git repo is already initialized locally with a clean commit. Push it:

```bash
# create an empty repo named "portfolio" at https://github.com/new (no README), then:
cd portfolio
git remote add origin https://github.com/Zaki-akdas/portfolio.git
git push -u origin main
```

> If git asks for a password, use a GitHub **Personal Access Token**
> (GitHub → Settings → Developer settings → Personal access tokens → "repo" scope).

---

## 2. Deploy on Vercel (recommended)

This directory is already linked to a Vercel project. Every push to `main`
auto-deploys; you can also deploy from the CLI with `vercel --prod`.

Set these environment variables in **Vercel → Project → Settings → Environment
Variables** (then redeploy):

| Variable | Value | Why |
|---|---|---|
| `ADMIN_PASSWORD` | you choose | Admin login (required — there is no default). Overrides the stored password. |
| `AUTH_SECRET` | random 32+ chars | Signs the admin session cookie. |
| `DATABASE_URL` | Supabase **pooler** connection string | Durable content + messages (Postgres). Use the pooled (`-pooler`) URL for serverless. |
| `SUPABASE_URL` / `SUPABASE_SECRET_KEY` / `SUPABASE_PUBLISHABLE_KEY` | from Supabase | Auth + Storage (media bucket). |

> The Postgres tables (`portfolio_content`, `portfolio_messages`) are created and
> seeded automatically on first read — no manual migration step.

### After the first deploy

1. Open `https://<your-app>.vercel.app/admin` → log in with your `ADMIN_PASSWORD`.
2. Go to **Settings** → set **Site URL** to your live URL
   (fixes sitemap.xml, robots.txt and Open Graph links).
3. Send yourself a test message via the contact form → check the admin **Inbox**.

---

## 3. Alternative: Deploy on Render

Render runs the app as a long-lived Node server with a persistent disk, so it can
use the JSON-file store instead of Postgres.

1. Sign up at [render.com](https://render.com) (log in with GitHub).
2. Click **New → Blueprint** and select your `portfolio` repository.
3. Render reads `render.yaml` and shows the service. It will prompt for:
   - **ADMIN_PASSWORD** → choose a strong admin password (required — there is no default password).
4. Click **Apply**. First build takes ~3–5 minutes.
5. Your site is live at `https://zaki-portfolio.onrender.com` (name is adjustable).

What the blueprint sets up:

| Setting | Value | Why |
|---|---|---|
| `ADMIN_PASSWORD` | you choose | Admin login password |
| `DATABASE_URL` | Supabase pooler string | Optional — durable content + messages (Postgres) instead of the disk files |
| `SUPABASE_URL` / `SUPABASE_SECRET_KEY` / `SUPABASE_PUBLISHABLE_KEY` | from Supabase | Auth + Storage (media bucket) |
| Health check | `/api/health` | Render restarts the app if the store becomes unreadable |

> **Note on plans:** persistent disks require a paid instance (Starter, ~$7/mo).
> On the **free** plan remove the `disk:` block — the site works, but admin
> edits/messages/uploads reset on every deploy, and the app sleeps after
> 15 minutes of inactivity.

### After the first deploy

1. Open `https://<your-app>.onrender.com/admin` → log in with your `ADMIN_PASSWORD`.
2. Go to **Settings** → set **Site URL** to your live URL
   (fixes sitemap.xml, robots.txt and Open Graph links).
3. Send yourself a test message via the contact form → check the admin **Inbox**.

---

## 4. Alternative: Railway

Railway works the same way (Node service + volume):

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub repo.
2. Add a **Volume** mounted at `/var/data`.
3. Set variables: `DATA_DIR=/var/data/data`,
   `ADMIN_PASSWORD=<strong password>`, `AUTH_SECRET=<random string>`.
4. Build: `npm ci && npm run build` · Start: `npm start`.

---

## 5. Alternative: your own VPS

```bash
git clone https://github.com/Zaki-akdas/portfolio.git && cd portfolio
npm ci && npm run build
ADMIN_PASSWORD=changeme AUTH_SECRET=$(openssl rand -hex 32) PORT=3000 npm start
```

Use PM2 to keep it alive (`pm2 start npm --name portfolio -- start`) and Nginx +
Certbot for HTTPS. `DATA_DIR`/`UPLOADS_DIR` are optional on a VPS — the repo
folders are already persistent there. Set `DATABASE_URL` + the Supabase vars if
you'd rather use Postgres/Storage than the local files.

---

## 6. Adding a custom domain later (~2 minutes)

- **Vercel:** Project → **Settings → Domains** → add `yourdomain.com`, then add
  the CNAME/A records Vercel shows at your registrar. SSL is automatic.
- **Render:** Service → **Settings → Custom Domains** → same idea.

Either way, finish by updating **Site URL** in the admin settings to the new
domain (fixes sitemap.xml, robots.txt and Open Graph links).

---

## 7. Ongoing updates

Every `git push` to `main` auto-deploys. Content changes (projects, blog,
messages, settings) are made in the admin panel and persist in your store — no
redeploy needed.

**Back up your content** occasionally. On Vercel/Postgres, dump the
`portfolio_content` and `portfolio_messages` tables from the Supabase SQL editor;
on a disk-based host (Render/VPS), `cat /var/data/data/content.json` and copy it
somewhere safe, or download files via the admin media library.
