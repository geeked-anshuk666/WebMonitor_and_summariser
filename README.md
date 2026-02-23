# Web Monitor + Summary

Track web pages for changes. See visual diffs and AI-generated summaries of what changed.

**🌐 Live Demo**: [Deploying to Render...](https://web-monitor.onrender.com) (Placeholder)

![Stack](https://img.shields.io/badge/Next.js%2016-black?logo=nextdotjs)
![Prisma 6](https://img.shields.io/badge/Prisma%206-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white)

## Features

- **URL Dashboard** - Add up to 8 links to monitor
- **Check Now** - Fetch, diff, and summarize changes in one click
- **Visual Diff Viewer** - Red/green unified diff with line-by-line coloring
- **AI Summaries** - LLM-powered change summaries via OpenRouter (using the fixed `openrouter/free` tier)
- **History** - Last 5 checks per link, auto-pruned
- **Status Page** - Real-time health of backend, database, and LLM

## Quick Start

### Prerequisites

- Node.js ≥ 20
- PostgreSQL database (local or [Render](https://render.com) free tier)
- [OpenRouter](https://openrouter.ai) API key (free)

### Setup

```bash
# Clone
git clone https://github.com/geeked-anshuk666/WebMonitor_and_summariser.git
cd WebMonitor_and_summariser

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
│   │   ├── check/        POST - run check (fetch -> diff -> summarize)
│   │   ├── history/[id]  GET  - last 5 checks for a link
│   │   ├── links/        GET/POST - list/add links
│   │   ├── links/[id]    DELETE   - remove link
│   │   └── status/       GET  - health check
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
└── prisma/              Prisma schema and migrations
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS + CSS custom properties |
| Database | PostgreSQL via Prisma 6 |
| LLM | OpenRouter (`openrouter/free`) |
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

## What is Done
- Full CRUD for monitored links (max 8)
- Automated check orchestration (Fetch -> Diff -> AI Summary)
- High-precision LLM grounding rules
- Multi-stage Docker setup and Render Blueprint
- System status monitoring with real-time latency

## What is Not Done
- **Email/SMS Notifications**: Currently, changes are only visible in the dashboard.
- **Authentication**: The dashboard is currently public; multi-user support with login is not implemented.
- **Advanced Scheduling**: Checks are triggered manually or via basic cron; complex cron scheduling (e.g., "every Monday at 9 AM") is not built into the UI.
- **PDF/Image Diffing**: Only text-based content is supported; visual "screenshot" diffing is an elective future improvement.

## License

MIT
