# Deploying the Portfolio

The site is a Next.js 14 app with a **JSON-file content store** (`data/`) and
**file uploads** (`public/uploads/`). That means the server needs a writable,
persistent filesystem. The recommended host is **Render** — the repo already
contains a `render.yaml` blueprint that configures everything.

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

## 2. Deploy on Render (recommended)

1. Sign up at [render.com](https://render.com) (log in with GitHub).
2. Click **New → Blueprint** and select your `portfolio` repository.
3. Render reads `render.yaml` and shows the service. It will prompt for:
   - **ADMIN_PASSWORD** → choose a strong admin password (this replaces `admin123`).
4. Click **Apply**. First build takes ~3–5 minutes.
5. Your site is live at `https://zaki-portfolio.onrender.com` (name is adjustable).

What the blueprint sets up:

| Setting | Value | Why |
|---|---|---|
| Persistent disk | 1 GB at `/var/data` | Keeps admin edits, messages & uploads across deploys |
| `DATA_DIR` | `/var/data/data` | JSON store lives on the disk (auto-seeded from the repo on first boot) |
| `UPLOADS_DIR` | `/var/data/uploads` | Media library lives on the disk (served via `/uploads/*` route) |
| `ADMIN_PASSWORD` | you choose | Admin login — env var always wins, so you can't be locked out |
| `AUTH_SECRET` | auto-generated | Signs the admin session cookie |
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

## 3. Alternative: Railway

Railway works the same way (Node service + volume):

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub repo.
2. Add a **Volume** mounted at `/var/data`.
3. Set variables: `DATA_DIR=/var/data/data`, `UPLOADS_DIR=/var/data/uploads`,
   `ADMIN_PASSWORD=<strong password>`, `AUTH_SECRET=<random string>`.
4. Build: `npm ci && npm run build` · Start: `npm start`.

---

## 4. Alternative: your own VPS

```bash
git clone https://github.com/Zaki-akdas/portfolio.git && cd portfolio
npm ci && npm run build
ADMIN_PASSWORD=changeme AUTH_SECRET=$(openssl rand -hex 32) PORT=3000 npm start
```

Use PM2 to keep it alive (`pm2 start npm --name portfolio -- start`) and Nginx +
Certbot for HTTPS. `DATA_DIR`/`UPLOADS_DIR` are optional on a VPS — the repo
folders are already persistent there.

### ⚠️ Why not Vercel?

Vercel's filesystem is read-only/ephemeral: admin edits, contact messages and
uploads would silently disappear. Deploy there only after migrating the store
to a database (Postgres/Prisma) and uploads to blob storage — happy to do that
migration if you ever want it.

---

## 5. Adding a custom domain later (~2 minutes)

1. Render → your service → **Settings → Custom Domains** → add `yourdomain.com`.
2. At your registrar, add the CNAME/A records Render shows. SSL is automatic.
3. Update **Site URL** in the admin settings to the new domain.

---

## 6. Ongoing updates

Every `git push` to `main` auto-deploys. Content changes (projects, blog,
messages, settings) are made in the admin panel and live on the persistent
disk — no redeploy needed.

**Back up your content** occasionally: Render → Shell tab →
`cat /var/data/data/content.json` (copy it somewhere safe), or download files
via the admin media library.
