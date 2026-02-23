# Web Monitor + Summary

Track web pages for changes. See visual diffs and AI-generated summaries of what changed.

![Stack](https://img.shields.io/badge/Next.js%2016-black?logo=nextdotjs)
![Prisma 7](https://img.shields.io/badge/Prisma%207-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white)

## Features

- **URL Dashboard** — Add up to 8 links to monitor
- **Check Now** — Fetch, diff, and summarize changes in one click
- **Visual Diff Viewer** — Red/green unified diff with line-by-line coloring
- **AI Summaries** — LLM-powered change summaries via OpenRouter (Llama 3.1 8B free)
- **History** — Last 5 checks per link, auto-pruned
- **Status Page** — Real-time health of backend, database, and LLM

## Quick Start

### Prerequisites

- Node.js ≥ 20
- PostgreSQL database (local or [Render](https://render.com) free tier)
- [OpenRouter](https://openrouter.ai) API key (free)

### Setup

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/web-monitor.git
cd web-monitor

# Install
npm install

# Environment
cp .env.example .env
# Edit .env with your DATABASE_URL and OPENROUTER_API_KEY

# Database
npx prisma migrate deploy
npx prisma generate

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── check/        POST — run check (fetch → diff → summarize)
│   │   ├── history/[id]  GET  — last 5 checks for a link
│   │   ├── links/        GET/POST — list/add links
│   │   ├── links/[id]    DELETE   — remove link
│   │   └── status/       GET  — health check
│   ├── monitor/[id]/     Detail page (diff + history)
│   ├── status/           Status page (3 health cards)
│   ├── layout.tsx        Root layout + nav
│   └── page.tsx          Dashboard
├── components/
│   ├── DiffViewer.tsx    Unified diff with syntax coloring
│   ├── LinkCard.tsx      URL card with status badge
│   ├── SummaryCard.tsx   AI summary display
│   └── StatusIndicator   Health indicator with pulse dot
├── lib/
│   ├── db.ts             Prisma singleton (lazy init)
│   ├── differ.ts         SHA256 hash + unified diff
│   ├── fetcher.ts        URL fetch + SSRF protection
│   └── summarize.ts      OpenRouter LLM integration
└── generated/prisma/     Prisma 7 generated client
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS + CSS custom properties |
| Database | PostgreSQL via Prisma 7 |
| LLM | OpenRouter (Llama 3.1 8B Instruct free) |
| Fetching | Axios + @mozilla/readability + jsdom |
| Diffing | `diff` npm package (unified diff) |
| Deploy | Render (Web Service + Postgres) |

## Environment Variables

| Variable | Description |
|----------|------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI summaries |

## Deploy to Render

1. Push to GitHub
2. Create a **Web Service** on Render, connect your repo
3. Create a **Postgres** database on Render (free tier)
4. Set environment variables (`DATABASE_URL` auto-injected, add `OPENROUTER_API_KEY`)
5. Build command: `npm install && npx prisma migrate deploy && npx prisma generate && npm run build`
6. Start command: `npm run start`

Or use the `render.yaml` for one-click deploy.

## License

MIT
