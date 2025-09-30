# CLAUDE.md

Guidance for LLM coding agents working in this repository.

## Quick Commands
- `pnpm install` — ensure deps (Tailwind v4, shadcn packages) are present
- `pnpm dev` — Vite dev server with hot reload
- `pnpm build` — Type check then build for production
- `pnpm preview` — Preview the production bundle locally
- `pnpm lint` — Run Biome across `src`

## Styling Defaults
- Tailwind CSS v4 drives all styling
- Avoid adding bespoke css utility classes. Prefer composing Tailwind utilities in JSX. If a helper is unavoidable, document the rationale.
- Safe-area padding is handled by the mini app host
- Shared components live under `src/components/ui/`

## Application Flow
- `src/App.tsx` renders the single-screen mini-app layout. Keep it mobile-first, single-column
- The Farcaster Mini App SDK **must** call `sdk.actions.ready()` on mount; never remove this effect.
- Wallet connectivity relies on `wagmi` with the Farcaster connector configured in `src/wagmi.ts`. Any new components that need account state should consume the existing hooks.
- For comprehensive Farcaster Mini App SDK actions, haptics, and features, see @MINIAPPS.md

## Build & Deployment Notes
- `vite.config.ts` injects `@tailwindcss/vite`, sets up the HTML replacement plugin, and resolves the `@` alias to `./src`.
- Template metadata lives in `src/lib/constants.ts` and feeds the HTML replacement placeholders `{{APP_URL}}` / `{{PROJECT_TITLE}}`.
- The production bundle currently trips Vite’s 500 kB chunk warning due to wagmi/viem; this is expected. Consider code-splitting only if size becomes a problem for your deployment target.

## Available Libraries
- **Three.js** (`three` + `@types/three`) - 3D graphics library for creating and displaying animated 3D computer graphics in web browsers

## Missing / Future
- No automated visual regression or E2E tests are bundled; add them if your use case needs assurance beyond manual checks.
- Additional shadcn components can be generated as needed, but follow the "no custom CSS" rule unless Tailwind utilities cannot express the requirement.
