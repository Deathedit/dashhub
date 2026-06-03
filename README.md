# DashHub

A lightweight, self-hosted dashboard for tracking GitHub branch status — latest commit, CI workflow results, and commit history — from a single-page app with no backend. State is persisted in localStorage; data comes from the GitHub REST API.

Built with React 19, TypeScript, Vite 8, shadcn/ui (base-nova), Tailwind CSS v4, and deployed via Docker + nginx.

## Quick Start

```bash
npm install && npm run dev
```

| Command           | Purpose                       |
| ----------------- | ----------------------------- |
| `npm run dev`     | Dev server with HMR           |
| `npm run build`   | Type-check + production build |
| `npm run lint`    | ESLint                        |
| `npm run preview` | Preview production build      |

Add shadcn components: `npx shadcn@latest add <component>`

## Deploy

```bash
docker compose up -d --build
docker compose down
```

Available at `http://localhost:3000`. Multi-stage build: `node:24-alpine` → `nginx:alpine`. nginx caches `/assets/` for 1 year; `index.html` is no-cache.

## Architecture

- **Routing**: `BrowserRouter` (react-router-dom). `/` (Dashboard), `/settings`, `/:owner/:repo/:branch`
- **State**: `AppCtx` in `src/contexts/app-context.ts`, consumed via `useApp()`. No external state lib.
- **Persistence**: `useLocalStorage` with `dashhub-` prefix
- **Token gate**: `TokenRequired` shown unless `token` is set. Settings always accessible.
- **API**: `fetchJSON(url, token)` in `src/services/github.ts` with retry on 5xx
- **Data fetching**: `fetchBranchData()` in `src/services/fetchBranchData.ts` — pure async function. `useBranchData` hook orchestrates calls + stale-data retention.
- **Cache**: In-memory `Map` with 60min TTL + 100-entry FIFO cap (`src/services/cache.ts`). Clears on branch/token/refresh changes.
- **Text**: `src/constants/text.ts` — all UI strings in `text` object + `relativeTime()` utility
- **Glassmorphism**: `GlassProvider` toggles `.glass` class. Overrides `--card`, `--sidebar` etc. to translucent values. Restricted to dark mode + matrix bg.
- **Dark mode**: Class-based via `@custom-variant dark (&:where(.dark, .dark *))`. Toggle `dark` class on `<html>`.

## AI Disclosure

This project was developed with significant assistance from AI tools — initially [opencode](https://opencode.ai) using the **GLM-5.1** model, with ongoing work also using [Claude Code](https://claude.com/claude-code) (Claude Opus 4.8). Code, architecture, Docker config, and documentation were all produced through AI-assisted sessions with human direction. All final code was reviewed and accepted by the developer.
