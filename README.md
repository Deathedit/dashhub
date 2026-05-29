# DashHub

A lightweight, self-hosted dashboard for tracking GitHub branch status — latest commit, CI workflow results, and commit history — all from a single-page app with no backend required.

## Features

- **Branch tracking** — monitor up to 50 public GitHub branches from a single dashboard
- **CI status** — see the latest workflow run result (passing, failed, in progress, or no CI) at a glance
- **Commit history** — view the last 13 commits for any tracked branch
- **Dark mode** — class-based toggle with system preference detection, persisted in localStorage
- **Collapsible sidebar** — remembers collapsed/expanded state across sessions
- **Mobile responsive** — full-width header bar with slide-out overlay sidebar on small screens
- **GitHub PAT support** — optional token increases API rate limit from 60 to 5,000 requests/hour
- **Auto-refresh** — optional 60-second polling interval
- **In-memory caching** — commit history cached for 5 minutes to avoid redundant API calls
- **Single URL input** — paste a GitHub URL or use `owner/repo/branch` format; default branch is auto-detected

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | react-router-dom (HashRouter) |
| Icons | Lucide React |
| Deployment | Docker + nginx |

## Deploy with Docker

```bash
docker compose up -d --build
```

The app is available at `http://localhost:3000`.

To rebuild after changes:

```bash
docker compose up -d --build
```

To stop:

```bash
docker compose down
```

## Development

```bash
npm install
npm run dev
```

Other commands:

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check and production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## Configuration

All tunable constants are defined at the top of their respective files:

| Constant | File | Value | Purpose |
|---|---|---|---|
| `MAX_BRANCHES` | `src/pages/SettingsPage.tsx` | `50` | Maximum number of tracked branches |
| `COMMITS_PER_PAGE` | `src/pages/BranchPage.tsx` | `13` | Number of commits shown on branch detail page |
| `CACHE_TTL_MS` | `src/services/cache.ts` | `300000` (5 min) | How long commit data is cached in memory |
| Auto-refresh interval | `src/App.tsx` | `60000` (60s) | Polling interval when auto-refresh is enabled |

## Project Structure

```
src/
├── App.tsx                 # Root: HashRouter, context provider, layout
├── main.tsx                # React DOM entry point
├── index.css               # Tailwind v4 import + dark variant + body styles
├── types/
│   └── index.ts            # TrackedBranch, CommitInfo, CommitDetail, WorkflowStatus, parseGitHubUrl
├── hooks/
│   ├── useLocalStorage.ts   # Generic localStorage hook with lazy initializer
│   └── useBranchData.ts    # Fetches commit + workflow data for all tracked branches
├── services/
│   ├── github.ts           # GitHub API calls (fetchJSON, fetchCommits, verifyToken, etc.)
│   └── cache.ts            # In-memory commit cache with TTL
├── components/
│   ├── Sidebar.tsx          # Collapsible sidebar with nav links (Dashboard, Settings)
│   ├── BranchRow.tsx        # Dashboard row for a single branch
│   └── BranchRowSkeleton.tsx # Loading placeholder for branch rows
└── pages/
    ├── DashboardPage.tsx    # Branch list overview
    ├── SettingsPage.tsx     # General settings, GitHub token, add/remove branches
    └── BranchPage.tsx      # Branch detail with commit history and CI status
```

## AI Disclosure

This project was developed with significant assistance from AI tools, specifically large language models used through [opencode](https://opencode.ai), an AI-powered coding assistant. The model used was **GLM-5.1** (opencode-go/glm-5.1). The following aspects of the project involved AI assistance:

- **Code generation**: All React components, hooks, services, and configuration files were written or refined through AI-assisted development sessions. Human direction guided architecture decisions, feature requirements, and styling preferences, while the AI produced the implementation code.
- **Architecture & design**: Project structure, data flow patterns (localStorage → context → hooks → components), caching strategy, and state management approach were discussed and planned collaboratively between the developer and the AI assistant.
- **Docker & deployment**: The `Dockerfile`, `docker-compose.yml`, `nginx.conf`, and `.dockerignore` were generated with AI assistance, following multi-stage build and static serving best practices.
- **Documentation**: This `README.md` and the `AGENTS.md` reference document were written by the AI assistant based on the project's current codebase and the developer's direction.
- **Iterative refinement**: Features were built incrementally — the AI would produce initial implementations, the developer would review and request changes (e.g., moving sidebar controls to settings, swapping card grid for list rows, adding branch limits and caching), and the AI would iterate on the code.

No AI tool was used to write tests, as the project currently has no automated test suite. All final code was reviewed and accepted by the developer.