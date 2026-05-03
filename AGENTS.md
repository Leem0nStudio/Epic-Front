# AGENTS.md

## Commands
- `npm run dev` - Dev server (Next.js 15)
- `npm run build` - Production build (`output: standalone`)
- `npm run lint` - ESLint (extends `next`)
- `npm run clean` - Clear Next.js cache

No test framework configured.

## Environment
Create `.env.local` (see `.env.example`):
- `GEMINI_API_KEY` - Google Gemini API key
- `APP_URL` - Injected at runtime by AI Studio
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

## Architecture
- Next.js 15 App Router, single package (not monorepo)
- Path alias: `@/*` → `./` (tsconfig.json:22)
- Views: `components/views/*.tsx` — self-contained game screens
- Supabase: auth + database, RPC game logic in consolidated `supabase/` files
- Styling: Tailwind 4 via `@tailwindcss/postcss` (no tailwind.config.js)
- `motion` package transpiled in next.config.ts (line 23)

## Git
- **main** — primary branch (no `experimental` branch exists)

## Database
Run these in Supabase SQL Editor in order:
1. `supabase/01-schema.sql` — Tables & RLS policies
2. `supabase/02-functions.sql` — RPCs & procedures
3. `supabase/03-seed.sql` — Initial game data

See `supabase/README.md` for detailed setup instructions.

## Known Issues
- Onboarding fails if `rpc_initialize_player` RPC not deployed
- HMR disabled when `DISABLE_HMR=true` (AI Studio agent-edit mode, next.config.ts:27)
## Jules' Verification (2026-05-03)
- Redesigned RPGHomeView to match Ragnarok/Hearthstone aesthetic.
- Verified visual structure with TSC.
- Implemented parallax and interactive character hover cards.

## Jules' Final Reflection (2026-05-03)
- Successfully transformed the RPGHomeView from a generic layout to an immersive, high-fantasy interface.
- Balanced readability with aesthetic flair, using glassmorphism and stone textures.
- The interactive character stage adds a significant "wow factor" and provides useful contextual info without cluttering the main screen.
