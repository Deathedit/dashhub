# AGENTS.md

## Project

DashHub — single-page GitHub branch status dashboard. No backend; all state in localStorage, all data from GitHub REST API. Deployed as static assets via Docker + nginx.

## Commands

```bash
npm run dev       # Vite dev server with HMR
npm run build     # tsc -b && vite build (type-check + production build)
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

No test suite exists. `npm run build` is the primary verification step (includes type-check).

## Architecture

- **Routing**: `HashRouter` (react-router-dom). Routes: `/` (Dashboard), `/settings` (Settings), `/:owner/:repo/:branch` (Branch detail). All hash-based (`/#/...`).
- **State**: React context (`AppCtx`) in `App.tsx`, consumed via `useApp()`. No external state lib.
- **Persistence**: `useLocalStorage` hook with keys prefixed `dashhub-`. Values: branches, auto-refresh, dark mode, sidebar collapsed, animated bg, GitHub token.
- **Token gate**: All routes show `TokenRequired` unless `token` is set. Settings page is always accessible.
- **API**: All GitHub calls go through `fetchJSON(url, token)` in `src/services/github.ts`. Token is always required (`Authorization: token ...` header).

## Key Conventions

- **No comments in code** unless explicitly asked.
- **Dark mode**: Class-based via `@custom-variant dark (&:where(.dark, .dark *))` in `src/index.css`. Toggle `dark` class on `<html>` via `useEffect` in `App.tsx`. Do not use Tailwind's `dark:` media-query variant.
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin. All styles are inline Tailwind classes — no CSS modules or global classes beyond `body` in `index.css`.
- **Glassmorphism**: `useGlass()` hook returns context-aware class strings (`card`, `cardSubtle`, `sidebar`, `header`) that switch between solid and translucent+backdrop-blur based on `animatedBg === "matrix"`. Used by Sidebar, BranchRow, BranchRowSkeleton, BranchPage, SettingsPage, TokenRequired.
- **Animated backgrounds**: `AnimatedBg` type is `"none" | "matrix"`. Matrix is canvas-based with multi-drop per column for seamless loop, blue-tinted (`#3b82f6`/`#93c5fd` in dark, `#94a3b8`/`#64748b` in light), CSS `filter: blur(2px)`. Canvas class: `bg-animated-matrix` (defined in `index.css`).
- **Delete confirmation**: Inline swap — trash icon replaced with confirm (✓) and cancel (✗) icons. No browser `confirm()`.
- **Fetching indicator**: Thin animated blue bar fixed at top of viewport, opacity toggled by `isFetching`.

## Adding New Features

**New page**: Create `src/pages/NewPage.tsx`, add `<Route>` in `App.tsx`, add nav link in `Sidebar.tsx`, consume `useApp()` for global state. Apply `useGlass()` for glassmorphism support.

**New GitHub API call**: Add to `src/services/github.ts`. Always accept `token: string` as last param, use `fetchJSON<T>(url, token)`, return typed object. Call from `useBranchData.ts` or page component. Add cache support in `src/services/cache.ts` if needed.

**New localStorage key**: Use `useLocalStorage` hook in `App.tsx`, add to `AppContext` type and `value` object, consume via `useApp()`.

## Tunable Constants

All inline at top of their files. No config file.

| Constant | File | Value | Purpose |
|---|---|---|---|
| `MAX_BRANCHES` | `src/pages/SettingsPage.tsx` | `50` | Hard limit on tracked branches |
| `COMMITS_PER_PAGE` | `src/pages/BranchPage.tsx` | `13` | Commits on branch detail page |
| `CACHE_TTL_MS` | `src/services/cache.ts` | `60 * 60 * 1000` | In-memory commit cache TTL (60 min) |
| Auto-refresh interval | `src/App.tsx` | `300000` | Polling interval when auto-refresh is on (5 min) |

## Cache Behavior

- `src/services/cache.ts`: module-level `Map` with TTL-based expiration.
- `clearCommitCache()` called from `useBranchData` on branch list changes, token changes, and auto-refresh ticks.
- BranchPage checks `getCachedCommits` before fetching; cache hit renders immediately (no loading spinner).
- Cache is in-memory only — resets on page reload.

## Docker

Multi-stage build: `node:24-alpine` → `nginx:alpine`. `NPM_CONFIG_UPDATE_NOTIFIER=false` set in build stage.

```bash
docker compose up -d --build
docker compose down
```

Served at `http://localhost:3000` (host port 3000 → container port 80). `nginx.conf` caches `/assets/` for 1 year, no-cache on `index.html`.

## Component Sizes

- Dashboard and branch page: `max-w-3xl`
- Settings page: `max-w-2xl`
- Mobile: `pt-14` offset for header bar (`h-14`), sidebar becomes overlay on `md:` and below