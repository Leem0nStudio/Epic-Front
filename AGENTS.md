# AGENTS.md

## Commands
- `npm run dev` - Dev server
- `npm run build` - Production build  
- `npm run lint` - ESLint

## Required Setup
Create `.env.local` with:
- `GEMINI_API_KEY` - Google Gemini API key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

## Git Workflow
- **experimental**: Primary development branch (default for all work)
- **main**: Stable production branch

## Architecture
- Next.js 15 App Router (`app/`).
- Views in `components/views/*.tsx` - each file is a self-contained game screen.
- Supabase for auth + database.
- RPC functions handle game logic in `supabase/Epic_schema.sql`.

## Database Setup
Execute `supabase/setup_complete.sql` in Supabase SQL Editor to:
1. Disable RLS on all tables
2. Add missing columns (exp, level) to players
3. Create chapters/stages tables for campaign
4. Insert seed data (jobs, skills, weapons, cards)
5. Insert campaign progress (3 stages)
6. Create/update RPC functions

## Assets Structure (`public/assets/`)
```
public/assets/
├── backgrounds/    # Fondos de vistas (battle, home, party, gacha, etc.)
├── sprites/         # Sprites de personajes (pixel art)
│   ├── novice_idle.png
│   ├── warrior_idle.png
│   ├── mage_idle.png
│   └── ranger_idle.png
├── ui/             # Elementos de interfaz
│   ├── icon_novice.png
│   ├── icon_warrior.png
│   ├── icon_mage.png
│   └── currency_gold_icon.png
├── bg/             # Fondos home y parallax
└── items/          # Iconos de armas, cartas, habilidades
```

## Asset Keys (AssetService)
- Sprites: `novice_idle.png`, `warrior_idle.png`, `mage_idle.png`, `ranger_idle.png`
- Icons: `icon_novice.png`, `icon_warrior.png`, `icon_mage.png`, `icon_ranger.png`
- UI: `currency_gold_icon.png`, `currency_gem_icon.png`

## Known Issues
- Onboarding fails if Supabase RPC `rpc_initialize_player` is not deployed (run setup_complete.sql)