# Agent Guidelines

## Commands
- **Build:** `bun run build` (runs `tsc -b && vite build`)
- **Lint:** `bun run lint` (ESLint) & `bunx biome check .` (Formatter/Linter)
- **Test:** No test runner currently configured.
- **Dev:** `bun run dev` (Vite + Cloudflare Pages)

## Code Style
- **Formatter:** Biome (Tabs, Double Quotes, Semicolons). Run `bunx biome check . --apply` to fix.
- **Types:** Strict TypeScript. Use interfaces for data structures (e.g., `interface Article`).
- **Imports:** Organized by Biome.
- **Naming:** PascalCase for Components/Interfaces, camelCase for variables/functions.
- **Error Handling:** Use `try/catch` blocks. Always check `if (e instanceof Error)` for type safety.
- **Frontend:** React 19 + Vite. Functional components with Hooks.
- **Backend:** Cloudflare Workers + Hono. Use `c.json()` for API responses.
- **Env:** Environment variables defined in `worker/env.ts`.
