# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ReadIt is a web article reader application that extracts and displays web content in a clean, distraction-free format. It consists of a React frontend (Vite) and a Cloudflare Workers backend (Hono), deployed as a single Cloudflare Pages application.

## Architecture

### Dual Entry Points

The project has two separate build contexts:

1. **Frontend (src/)**: React application built with Vite
   - Entry: `src/main.tsx`
   - Output: `dist/client/`
   - Config: `tsconfig.app.json`

2. **Worker (worker/)**: Cloudflare Worker using Hono framework
   - Entry: `worker/index.ts`
   - Config: `tsconfig.worker.json`, `wrangler.jsonc`
   - Serves both API endpoints and static assets

### Request Flow

The worker handles three types of requests:

1. **API endpoint** (`/api/read?url=...`): Returns parsed article as JSON
2. **Direct URL parsing** (e.g., `/<example.com/article>`): Fetches and renders article as HTML
3. **Static assets**: Falls back to serving Vite-built frontend from `ASSETS` binding

### Key Dependencies

- **@mozilla/readability**: Extracts main content from web pages
- **linkedom**: DOM parser for server-side HTML manipulation (Cloudflare Workers compatible)
- **hono**: Lightweight web framework for the worker
- **alchemy**: Infrastructure-as-code tool for Cloudflare deployment

## Development Commands

```bash
# Start development server (runs Vite + Cloudflare Pages locally)
bun run dev

# Build the application (compiles TypeScript and builds frontend)
bun run build

# Preview production build locally
bun run preview

# Deploy to Cloudflare Pages
bun run deploy

# Linting
bun run lint          # ESLint
bunx biome check .    # Biome linter/formatter

# Generate Cloudflare Workers types
bun run cf-typegen
```

## Code Style

- **Formatter**: Uses Biome with tab indentation and double quotes
- **Linter**: Biome with custom TypeScript rules (see biome.json)
- React hooks linting enabled via Biome

## TypeScript Configuration

The project uses TypeScript project references with three configs:

- `tsconfig.json`: Root configuration
- `tsconfig.app.json`: Frontend (React, DOM types)
- `tsconfig.worker.json`: Worker (Cloudflare Workers types, extends tsconfig.node.json)

Environment types are defined in `worker/env.ts` and reference the Alchemy deployment configuration.

## Cloudflare Deployment

- Configuration: `wrangler.jsonc` (uses Node.js compatibility for linkedom)
- Assets binding: Vite build output (`dist/client/`) is served via `ASSETS` binding
- Deployment uses Alchemy (`alchemy.run.ts`) for infrastructure management
