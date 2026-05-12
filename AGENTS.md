# AGENTS.md

## Quick start
- Install deps with `pnpm install` (pnpm lockfile present; avoid npm/yarn unless updating locks).
- Local dev: `pnpm dev` (Vite).
- Build: `pnpm build` (runs `tsc -b` then `vite build`).
- Lint: `pnpm lint` (eslint flat config).

## Env/config gotchas
- Requires Supabase envs in `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Vite alias `@` maps to `./src` (see `vite.config.ts`).

## Entry points
- App bootstraps in `src/main.tsx` with React Router (`RouterProvider`) inside `App`.

## Supabase
- Local Supabase config in `supabase/config.toml`; edge function `sync-calendar` uses `supabase/functions/sync-calendar/index.ts`.
