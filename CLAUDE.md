# CLAUDE.md

## Project

DashHub — single-page GitHub branch status dashboard. No backend; state in localStorage, data from GitHub REST API. Static deploy via Docker + nginx. React 19, TypeScript, Vite 8, shadcn/ui (base-nova), Tailwind CSS v4.

## Commands

```bash
npm run dev       # Vite dev server + HMR
npm run build     # tsc -b && vite build (type-check + prod)
npm run lint      # ESLint
npm run preview   # Preview prod build
```
Add shadcn components: `npx shadcn@latest add <component>`

No tests. Always `npm run build` before committing; must pass type-check + build.

## Architecture

- **Routing**: `HashRouter` (react-router-dom). `/#/` (Dashboard), `/#/settings`, `/#/:owner/:repo/*` (wildcard so branch names with slashes work)
- **State**: `AppCtx` + `useApp()` live in `src/app-context.ts` (kept out of `App.tsx` so the component file only exports components — Fast Refresh). `App.tsx` builds the value. No external state lib.
- **Persistence**: `useLocalStorage` with `dashhub-` prefix. Keys: branches, auto-refresh, dark mode, sidebar collapsed, animated bg, token.
- **Token gate**: `TokenRequired` shown unless `token` is set. Settings always accessible.
- **API**: `fetchJSON(url, token)` in `src/services/github.ts`. Token always required.
- **Text**: `src/text.ts` — all UI strings in `text` object, plus `relativeTime()` utility.
- **Cache**: In-memory `Map`, 60min TTL (`src/services/cache.ts`). Token change calls `clearAllCache`; auto-refresh bypasses reads via a `force` flag.
- **Auto-refresh**: `useBranchData` refetches silently on the 5min tick — no skeleton flash, and a row that errors mid-refresh keeps its last-known-good data. Activity surfaces via the returned `isRefreshing` flag (drives the top bar).
- **Status mapping**: `getWorkflowDisplayStatus` in `src/services/github.ts` maps a run to `DisplayStatus`. `WorkflowStatusValue` (`src/types/index.ts`) models GitHub run **statuses** (`queued`/`in_progress`/`completed`/`waiting`/`pending`/`requested`) — not conclusions; pass/fail is read from `conclusion` only when `completed`. Unrecognized/in-flight statuses fall through to `unknown`.
- **Status styling**: `STATUS_META` in `src/lib/status.ts` — shared label/variant/className/border keyed by display status; consumed by `BranchRow` and `BranchPage` (status icons stay local since sizes differ).
- **Dashboard sort**: Priority-based: loading (0) → loaded with commit (1) → error/no-commit (2), tiebreak by commit date descending.
- **Layout**: Dashboard & branch page `max-w-3xl`, settings `max-w-2xl`. Mobile: `pt-14` offset, sidebar overlay below `md:`.

## Conventions

- **No comments** unless explicitly asked.
- **Dark mode**: Class-based via `@custom-variant dark (&:where(.dark, .dark *))` in `index.css`. Toggle `dark` class on `<html>`. Never use `dark:` media-query variant.
- **Tailwind v4** + `@tailwindcss/vite`. Use semantic tokens (`bg-card`, `text-foreground`, `bg-primary`, `border`). Blue-accent oklch palette.
- **shadcn/ui** base-nova style, `@base-ui/react` primitives. Uses `render` prop (not `asChild`). Add components: `npx shadcn@latest add <component>`.
- **Path alias**: `@/*` → `./src/*` (vite.config.ts, tsconfig.json, tsconfig.app.json, components.json).
- **Glassmorphism**: `GlassProvider` (`src/hooks/useGlass.tsx`) sets `.glass` class on root when `isGlass` (matrix bg + dark mode). Overrides `--card`, `--sidebar` etc. to translucent values. `GlassCtx`, `useGlassActive()`, and `cardClass`/`sidebarClass`/`subtleClass` live in `src/lib/glass.ts` (provider stays separate so its file only exports a component — Fast Refresh).
- **Animated bg**: `AnimatedBg` type = `"none" | "matrix"`. Matrix is canvas-based. Restricted to dark mode only.
- **Delete confirmation**: Inline icon swap (✓/✗). No browser `confirm()`.
- **Fetching indicator**: Thin animated bar, `bg-primary`, fixed top of viewport.
- **Scrollbar hidden**: `.scrollbar-hidden` utility in `index.css` hides scrollbar cross-browser.

## Adding Features

- **New page**: `src/pages/X.tsx`, add `<Route>` in `App.tsx`, nav link in `Sidebar.tsx`, consume `useApp()` + `useGlassActive()`.
- **New shadcn component**: `npx shadcn@latest add <component>`. Follow existing patterns, use `@/` imports.
- **New GitHub API call**: Add to `src/services/github.ts`, accept `token: string` last param, use `fetchJSON<T>`. Add cache in `src/services/cache.ts` if needed.
- **New localStorage key**: `useLocalStorage` in `App.tsx`, add to `AppContext` type + value object, consume via `useApp()`.

## Constants

| Constant | File | Value |
|---|---|---|
| `MAX_BRANCHES` | `SettingsPage.tsx` | 50 |
| `COMMITS_PER_PAGE` | `BranchPage.tsx` | 13 |
| `CACHE_TTL_MS` | `cache.ts` | 60min |
| Auto-refresh interval | `App.tsx` | 5min |
| `FRAME_MS` (matrix throttle) | `Background.tsx` | 65ms |

## Docker

Multi-stage: `node:24-alpine` → `nginx:alpine`. `NPM_CONFIG_UPDATE_NOTIFIER=false`.

```bash
docker compose up -d --build
docker compose down
```

`localhost:3000` → port 80. nginx caches `/assets/` 1yr, no-cache on `index.html`.
