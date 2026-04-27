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
- Supabase for auth + database (no tests configured).
- RPC functions handle game logic in `supabase/Epic_schema.sql`.

## Known Issues
- Onboarding fails if Supabase RPC `rpc_initialize_player` is not deployed.