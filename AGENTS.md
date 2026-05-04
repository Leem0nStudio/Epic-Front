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
Run these in Supabase SQL Editor in order (after clearing existing tables):
1. `supabase/01-schema.sql` — Tables, constraints, indexes
2. `supabase/02-functions.sql` — RPCs & stored procedures
3. `supabase/04-seed.sql` — Initial game data

Use `supabase/00-cleanup.sql` for full reset before reinstalling.

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

## Jules' Redesign Update (2026-05-03)
- Implemented Global Header and Navigation components for persistent UI.
- Redesigned GachaView with an immersive summoning focal point and reward modals.
- Redesigned TavernView with detailed mercenary cards and recruitment timers.
- Integrated tactile feedback (scale/glow) into the base Button component.
- Standardized Spanish localization for all primary UI labels.

## Redesign Learnings (2026-05-03)
- **Centralized Layout**: Moving common UI elements (Header, Nav) to `app/page.tsx` ensures a single source of truth for the app's frame and state-driven navigation.
- **ViewShell Pattern**: Using a `ViewShell` component for all sub-views ensures consistent backgrounds, headers, and padding without repeating code.
- **Visual Feedback**: Small touches like scale-on-hover and glow-on-active significantly improve the "feel" of a game-like UI.
- **Localization**: Centralizing Spanish strings in the view components ensures the RPG theme remains immersive for the target audience.
