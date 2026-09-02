# Admin Panel Guide — for Zaki

Your website has a control room at **`/admin`**. No code needed for day-to-day updates.

**Login:** go to `yourdomain.com/admin` → enter your password.
(Initial password: `admin123` — change it immediately in **Settings → Change admin password**.)

---

## Daily tasks, in plain words

### ✉️ Check who contacted you
**Inbox** → unread messages have a purple dot. Click one to read it, then hit
**Reply by email** (opens your mail app with the reply pre-addressed).

### ➕ Add a new project
**Projects → + New project.** Fill in title, one-line summary, full description
(blank line = new paragraph), tech stack (comma separated), links, year.
Tick **Featured** to make it big on the homepage. Use ▲▼ to reorder.
For a cover photo: upload it in **Media** first, press **Copy URL**, paste into
the *Cover image URL* field.

### ✍️ Write a blog post / case study
**Blog → + New post.** Write in markdown:
`## Heading` · `**bold**` · `- bullet` · `> quote` · code in triple backticks.
Keep it as **draft** until ready, then **Publish**. The *SEO fields* control what
Google shows — fill them for important posts.

### 🖼️ Upload images
**Media** → drag files onto the box (or click it). Press **Copy URL** on any file
and paste that URL wherever a "cover" field asks for one.

### 🎛️ Change site text, colors, availability
**Settings** →
- Your name, headline, tagline, about text, email, socials, résumé link
- **Accent color** — recolors the entire site instantly
- **Availability** — flips the "Open for work" badge everywhere
- **3D kill-switch** — if a client's old laptop struggles, untick "Enable 3D universe"
  and the site falls back to a lightweight starfield
- **SEO meta title/description** — what Google shows for your homepage

### ⭐ Testimonials & skills
Same pattern: add, edit, publish/unpublish, delete. Ratings are the star sliders.

---

## Good to know

- Every delete asks for confirmation — nothing is lost by accident.
- Saving shows **"Saved ✓"** at the top of the page. If you see "Error", check
  your connection and press save again.
- The admin panel works on your phone.
- Contact form and login are rate-limited, so bots can't spam you.
- If you ever get locked out: delete `data/auth.json` on the server and the
  password resets to `admin123` on next login. Change it again right away.
