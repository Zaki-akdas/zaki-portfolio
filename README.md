# Zaki Akdas Choudhary — Portfolio

A modern web developer portfolio built with Next.js 14 and React Three Fiber, featuring an interactive 3D core, responsive design, and a dark-mode aesthetic.

**Live site:** [zakiakdas.vercel.app](https://zakiakdas.vercel.app)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **3D Graphics:** React Three Fiber + Three.js + Drei
- **Icons:** Lucide React
- **Styling:** Custom CSS (no utility framework)
- **Deployment:** Vercel

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout & metadata
│   └── page.tsx             # Entry point
├── components/
│   ├── DigitalCore.tsx      # Interactive 3D hero element
│   └── Portfolio.tsx        # Main portfolio page component
├── data/
│   └── projects.ts          # Client project data
├── admin.html               # Portfolio admin dashboard (static)
├── index.html               # Static HTML portfolio (standalone)
├── next.config.mjs
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The dev server runs at [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

### Option 1 — One-click (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Vercel auto-detects **Next.js** — keep all defaults
5. Click **Deploy**

Your site will be live at `<your-project>.vercel.app`.

### Option 2 — Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy (first run will prompt for login)
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

No environment variables are required. The site is fully static (SSG) with no server-side logic.

## Features

- Interactive 3D core built with React Three Fiber
- Smooth scroll animations and loading screen
- Responsive design (mobile-first)
- Marquee banner and parallax effects
- Client project showcase with live links
- Contact section with email and WhatsApp links

## License

MIT
