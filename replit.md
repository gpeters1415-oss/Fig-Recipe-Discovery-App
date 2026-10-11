# Fig

Fig is a personal recipe discovery and social cooking app that helps people collect recipes, understand what their regular diners like, and decide what to make.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/fig` — Fig's React + Vite web app.
- `artifacts/api-server` — shared API server scaffold; Fig's first-stage prototype does not use it.
- `lib/api-spec/openapi.yaml` — shared API contract source of truth.
- `lib/db/src/schema/` — shared database schema source.

## Architecture decisions

- Keep Fig's first release focused on the visual identity, Home, Recipe Box, recipe details, and the meal-planning conversation.
- Clearly identify demonstration recipes and activity. Do not imply demo popularity, people, recipes, or recommendations are real.
- Browser-local prototype state is not a user account or server persistence. Privacy controls in the prototype do not enforce access.
- Do not present recipe importing, authentication, invitations, ratings, or AI recommendations as implemented until built and verified.
- Keep the exact primary navigation labels: Home, Discover, Recipe Box, At My Table, My Taste.

## Product

Stage 1 is a polished, mobile-first recipe experience with a home cooking hub, an organized Recipe Box, recipe details, and a multi-step Fig meal-planning flow. Later stages expand At My Table, Discover, authentication, persistence, privacy enforcement, recipe import, and data-grounded recommendations.

## User preferences

- Use fig purple, fresh green accents, warm off-white backgrounds, editorial typography, and real food photography where available.
- Never generate images for recipes, people, or user profiles. Never use a generated image as if it belonged to a real person or recipe.
- Keep the experience refined, professional, food-centric, and mobile-first; avoid generic SaaS styling, clutter, and childish illustrations.
- Refer to the collection as “Recipe Box,” not “cookbook.”

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
