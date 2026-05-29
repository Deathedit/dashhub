# AGENTS.md

Reference document for AI agents and contributors working on DashHub.

## Project Overview

DashHub is a single-page, self-hosted GitHub branch status dashboard. It has no backend — all state lives in the browser (localStorage) and all data comes from the public GitHub REST API. The app is built with React 19, TypeScript, Vite 8, and Tailwind CSS v4. It is deployed as static assets served by nginx inside a Docker container.

## Tech Stack & Versions

| Package | Version | Notes |
|---|---|---|
| react | ^19.2.6 | |
| react-dom | ^19.2.6 | |
| react-router-dom | ^7.16.0 | Uses `HashRouter` — no server-side routing needed |
| lucide-react | ^1.17.0 | Icon library |
| tailwindcss | ^4.3.0 | v4 with `@tailwindcss/vite` plugin |
| vite | ^8.0.12 | Build tool |
| typescript | ~6.0.2 | |

### Key Conventions

- **Dark mode**: Class-based via `@custom-variant dark (&:where(.dark, .dark *))` in `src/index.css`. Toggled by adding/removing `dark` class on `<html>`.
- **Routing**: `HashRouter` from react-router-dom. Routes: `/` (Dashboard), `/settings` (Settings), `/:owner/:repo/:branch` (Branch detail).
- **State**: React context (`AppCtx`) for global state; `useLocalStorage` hook for persistence. No external state library.
- **API calls**: All GitHub API calls go through `fetchJSON` in `src/services/github.ts`, which optionally attaches an `Authorization: token ...` header.
- **No comments in code**: Do not add comments unless explicitly asked.

## Architecture

### Data Flow

```
localStorage ──→ useLocalStorage hooks ──→ AppCtx (React Context)
                                              │
                                              ├── useBranchData hook
                                              │       │
                                              │       ├── fetchLatestCommit (GitHub API)
                                              │       ├── fetchLatestWorkflowRun (GitHub API)
                                              │       └── clearCommitCache on refresh
                                              │
                                              └── Components consume AppCtx via useApp()
                                                      │
                                                      └── BranchPage also calls fetchCommits directly
                                                          (with cache check via getCachedCommits)
```

### Component Hierarchy

```
App (HashRouter + AppCtx.Provider)
├── Sidebar (nav links, collapse toggle, mobile overlay)
└── Main content area (margin shifts with sidebar)
    ├── DashboardPage → BranchRow / BranchRowSkeleton
    ├── SettingsPage (add branch, token, general settings)
    └── BranchPage (commit list, CI status badge)
```

### GitHub API Endpoints Used

| Function | Endpoint | Purpose |
|---|---|---|
| `fetchLatestCommit` | `GET /repos/{owner}/{repo}/commits?sha={branch}&per_page=1` | Dashboard row: latest commit |
| `fetchLatestWorkflowRun` | `GET /repos/{owner}/{repo}/actions/runs?branch={branch}&per_page=1` | Dashboard row: CI status |
| `fetchDefaultBranch` | `GET /repos/{owner}/{repo}` | Settings: auto-detect default branch when adding |
| `fetchCommits` | `GET /repos/{owner}/{repo}/commits?sha={branch}&per_page={n}` | Branch page: commit history |
| `verifyToken` | `GET /user` | Settings: validate PAT |

### Caching Strategy

- `src/services/cache.ts` provides a module-level `Map` with TTL-based expiration.
- `getCachedCommits(key)` returns cached `CommitDetail[]` if not expired, otherwise `null`.
- `setCachedCommits(key, data)` stores result with `Date.now()` timestamp.
- `clearCommitCache()` clears all entries — called from `useBranchData` whenever dashboard data refreshes (branch list changes, token changes, auto-refresh tick).
- Cache TTL: 5 minutes (`CACHE_TTL_MS = 5 * 60 * 1000`).
- BranchPage checks cache before fetching; on cache hit, renders immediately with no loading spinner.

### Error Handling

- **404**: "Repository not found" or "Repository or branch not found" depending on context.
- **403**: Shows message linking to Settings to add a token.
- **fetchLatestWorkflowRun**: Errors are silently caught and return `null` (no CI data is acceptable).
- **fetchDefaultBranch**: Errors are surfaced to the user in SettingsPage with specific messages for 404/403.

## Routing

| Path | Component | Description |
|---|---|---|
| `/` | `DashboardPage` | Lists all tracked branches as rows |
| `/settings` | `SettingsPage` | General settings, GitHub token, add/remove branches |
| `/:owner/:repo/:branch` | `BranchPage` | Branch detail: CI status badge, last 13 commits |

All routes use hash-based URLs (`/#/...`) via `HashRouter`.

## State Management

### AppCtx (React Context)

Provided by `App.tsx`, consumed via `useApp()` hook:

| Key | Type | Description |
|---|---|---|
| `branches` | `TrackedBranch[]` | List of tracked branches |
| `setBranches` | setter | Update tracked branches |
| `data` | `BranchData[]` | Fetched data for each branch (commit, workflow, loading, error) |
| `collapsed` | `boolean` | Sidebar collapsed state |
| `onToggleCollapse` | `() => void` | Toggle sidebar |
| `autoRefresh` | `boolean` | Whether auto-refresh is enabled |
| `onToggleAutoRefresh` | `() => void` | Toggle auto-refresh |
| `darkMode` | `boolean` | Dark mode state |
| `onToggleDarkMode` | `() => void` | Toggle dark mode |
| `token` | `string` | GitHub PAT |
| `setToken` | setter | Update GitHub PAT |

### localStorage Keys

| Key | Default | Description |
|---|---|---|
| `dashhub-branches` | `[]` | Tracked branches (JSON array) |
| `dashhub-auto-refresh` | `false` | Auto-refresh toggle |
| `dashhub-dark-mode` | System preference | Dark mode (lazy initializer checks `prefers-color-scheme`) |
| `dashhub-sidebar-collapsed` | `true` | Sidebar collapsed by default |
| `dashhub-github-token` | `""` | GitHub PAT (stored as plaintext, same model as browser extensions like Octotree) |

## Tunable Constants

| Constant | File | Value | Purpose |
|---|---|---|---|
| `MAX_BRANCHES` | `src/pages/SettingsPage.tsx` | `50` | Hard limit on tracked branches |
| `COMMITS_PER_PAGE` | `src/pages/BranchPage.tsx` | `13` | Number of commits on branch detail page |
| `CACHE_TTL_MS` | `src/services/cache.ts` | `5 * 60 * 1000` | In-memory commit cache TTL (5 min) |
| Auto-refresh interval | `src/App.tsx` | `300000` | Polling interval when auto-refresh is on (5 min) |

To change a constant, edit the value at the top of the file. No config file is used — all values are inline for simplicity.

## Styling Conventions

- **Tailwind CSS v4** with `@tailwindcss/vite` plugin.
- **Dark mode**: `@custom-variant dark (&:where(.dark, .dark *))` in `src/index.css`. Toggle by adding/removing `dark` class on `<html>` via `useEffect` in `App.tsx`.
- **All styles are inline Tailwind classes** — no separate CSS modules or global classes beyond `body` in `index.css`.
- **Responsive pattern**: Mobile-first. Sidebar is a slide-out overlay on `md:` and below; persistent side panel on `md:` and up. Mobile header bar is `h-14` with `pt-14` on main content.
- **Component sizes**: Dashboard and branch page share `max-w-3xl`. Settings page uses `max-w-2xl`.

## Common Workflows

### Add a New Page

1. Create `src/pages/NewPage.tsx`.
2. Add a `<Route>` in `src/App.tsx` inside the `<Routes>` block.
3. If the page needs global state, consume via `useApp()`.
4. Add a nav link in `src/components/Sidebar.tsx` if it should appear in the sidebar.

### Add a New GitHub API Call

1. Add the function in `src/services/github.ts`. Follow the existing pattern:
   - Accept `token?: string` as the last parameter.
   - Use `fetchJSON<T>(url, token)` for the request.
   - Return a typed object, not raw API data.
2. Import and call from a hook (`useBranchData.ts`) or a page component.
3. If the result should be cached, add functions to `src/services/cache.ts` and follow the `getCachedCommits`/`setCachedCommits` pattern.

### Add a New localStorage Key

1. Use the existing `useLocalStorage` hook in `src/App.tsx`:
   ```ts
   const [myValue, setMyValue] = useLocalStorage<type>("dashhub-my-key", defaultValue);
   ```
2. Add the key and setter to the `AppContext` type.
3. Add them to the `value` object in `App.tsx`.
4. Consume via `useApp()` in any component.

## Build & Deploy

### Docker (primary)

```bash
docker compose up -d --build    # Build and start
docker compose down               # Stop
```

Served at `http://localhost:3000`. Uses nginx in the container on port 80, mapped to host port 3000.

### Development (local)

```bash
npm install
npm run dev          # Start dev server with HMR
npm run build        # Type-check + production build
npm run lint         # Run ESLint
npm run preview      # Preview production build locally
```

### Docker Files

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage: `node:22-alpine` build → `nginx:alpine` serve |
| `docker-compose.yml` | Single service, port 3000:80, restart unless-stopped |
| `nginx.conf` | Serves static files, gzip, caches `/assets/` for 1 year, no-cache on `index.html` |
| `.dockerignore` | Excludes `node_modules`, `dist`, `.git`, `*.md`, `Dockerfile`, etc. |

## Known Limitations

- **API rate limit**: 60 requests/hour without a PAT; 5,000/hour with one. Each tracked branch uses 2-3 API calls per refresh cycle.
- **Public repos only**: The PAT is stored in localStorage and sent as a query parameter. No OAuth flow. Private repos require a PAT with `repo` scope but the token is visible in browser DevTools.
- **Browser-only storage**: All state (branches, settings, token) lives in localStorage. Clearing browser data resets everything. There is no server-side persistence.
- **Maximum 50 branches**: Hard limit defined by `MAX_BRANCHES` constant.
- **No real-time updates**: Data refreshes on auto-refresh (60s interval) or when navigating to a branch page with a stale cache. No WebSocket or polling beyond the auto-refresh interval.
- **Cache is in-memory**: Commit history cache resets on page reload. Dashboard data always fetches fresh on load.