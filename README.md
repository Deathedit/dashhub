# DashHub

A lightweight, self-hosted dashboard for tracking GitHub branch status — latest commit, CI workflow results, and commit history — from a single-page app with no backend.

Built with React 19, TypeScript, Vite 8, Tailwind CSS v4, and deployed via Docker + nginx.

## Quick Start

```bash
npm install && npm run dev
```

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

## Deploy

```bash
docker compose up -d --build
docker compose down
```

Available at `http://localhost:3000`.

## AI Disclosure

This project was developed with significant assistance from AI tools — specifically [opencode](https://opencode.ai) using the **GLM-5.1** model. Code, architecture, Docker config, and documentation were all produced through AI-assisted sessions with human direction. All final code was reviewed and accepted by the developer.