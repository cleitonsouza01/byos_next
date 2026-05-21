# BYOS Next.js for TRMNL 🖥️

[![License](https://img.shields.io/github/license/usetrmnl/byos_next)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Integrated-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](https://github.com/usetrmnl/byos_next/pulls)
[![GitHub Stars](https://img.shields.io/github/stars/usetrmnl/byos_next?style=social)](https://github.com/usetrmnl/byos_next/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/usetrmnl/byos_next?style=social)](https://github.com/usetrmnl/byos_next/network/members)

## 🚀 Overview
**BYOS (Build Your Own Server) Next.js** is a Next.js implementation that powers device management, playlist-driven content scheduling, and on-demand BMP/PNG generation for e-ink displays.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fusetrmnl%2Fbyos_next&env=AUTH_ENABLED&envDefaults=%7B%22AUTH_ENABLED%22%3A%22false%22%7D&envDescription=User%20authentication%20is%20disabled.&envLink=https%3A%2F%2Fgithub.com%2Fusetrmnl%2Fbyos_next%3Ftab%3Dreadme-ov-file&project-name=byos-next&repository-name=byos_next&demo-title=BYOS%20NextJS&demo-description=BYOS%20(Build%20Your%20Own%20Server)%20Next.js%2C%20TRMNL%20server%20with%20local%20recipe%20rendering%20and%20cloud%20proxy%20support.&demo-url=https%3A%2F%2Fbyos-next-demo.vercel.app&demo-image=https%3A%2F%2Fusetrmnl.com%2Fimages%2Fbrand%2Ficons%2Ficon--brand.svg&products=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22neon%22%2C%22productSlug%22%3A%22neon%22%2C%22protocol%22%3A%22storage%22%2C%22group%22%3A%22postgres%22%7D%5D)

## 🆕 What's New (May 2026)
- **Two wall-display weather recipes for the 12.48" BWR panel** — `weather2` (Editorial) and `weather3` (Timeline), both designed for 1304×984 viewed from across a room. `weather2` leads with a 380px DM Serif Display temperature + italic serif condition and a quiet stats column; `weather3` makes a 24-hour temperature curve the centerpiece (red precip bands + a NOW marker) with a 5-day strip below. Both honor a 60% rule (Humidity/Wind values render at 60% of the temperature font), use the location's timezone for the clock (Open-Meteo `timezone=auto`), report pressure in **hPa**, and swap sun glyphs for moon glyphs at night via Open-Meteo's hourly `is_day` flag.
- **Crisp heavy-weight type in recipes** — `lib/fonts.ts` now registers Inter **Bold (700)** and **Black (900)** plus **DM Serif Display**, mapped to the right Takumi weights, so `font-bold`/`font-extrabold` stop dropping into Takumi's pixel-bitmap fallback. `extractFontFamily()` returns `undefined` when an element has no `font-*` class (instead of forcing `blockkie` on everything), restoring normal CSS font inheritance from the recipe root.
- **Liquid renderer hardening (fixes the "Advanced RSS" plugin)** — community plugins that fail to parse now render. `lib/recipes/liquid-renderer.ts` normalizes `{% else if %}`→`{% elsif %}` and `&&`/`||`→`and`/`or`; extracts `{% template %}` blocks from `full.liquid` too (not just shared/partials) so `{% render %}` can find layouts defined there; applies the script-wrap + paren-strip preprocessing to **every** `.liquid` file so registered partials get it (previously only the concatenated full template did); follows polling-URL redirects manually, re-validating **every hop** against the SSRF guard (real RSS feeds redirect constantly, so `redirect: "error"` broke them); and merges a single polling URL's JSON at the root context per TRMNL convention so `{% for item in items %}` resolves.
- **Firmware OTA push is now opt-in** — `/api/display` previously sent `update_firmware: true` whenever the device's version trailed the latest GitHub release, pointing at `FW{version}.bin` on S3. Those binaries 404 (every version, including the device's current one), so the firmware looped on a failing OTA download and **never rendered the screen** — devices polled every few seconds and the display froze. The push is now gated behind `ENABLE_FIRMWARE_OTA` (default off) and, even when enabled, HEAD-checks the binary so a dead URL can never trigger the loop. See `.env.example`.
- **`manage.sh` container helper** — wraps the common docker-compose flows (`./manage.sh rebuild` rebuilds + restarts the app and waits until it's reachable; also `up`/`down`/`restart`/`logs`/`status`/`shell`/`db`/`render <slug>`).
- **New device support: Waveshare ESP32 Driver Board + 12.48" Module B** (`waveshare_1248b`, 1304×984, 3-color BWR). Adds the model entry to `data/trmnl/models.local.json` with `palette_ids: ["color-3bwr"]`, a new BWR render pipeline (`lib/recipes/render-bwr-png.ts`) that quantizes RGB pixels to the firmware's exact 3-color palette per the device's HTTP contract (rules at §2.4 of the firmware-side `byos-waveshare-1248b.md`), dispatch in `/api/png/[[...slug]]` that picks the BWR vs 1-bit pipeline by output dimensions, a relaxed `/api/display` rule so any `mime_type=image/png` model routes to `/api/png` regardless of bit depth, a `1304×984` device-size preset, and a `setup-waveshare-1248b.png` placeholder served by `/api/setup` for unboxed pairings. Existing 800×480 / 640×384 / XIAO C6 paths are unchanged. v1 caveat: recipes still emit B/W only, so the red plane is unused until templates start using `#FF0000`; the pipeline is already correct for it.
- **Catalog-installed liquid recipes now render** — `installCommunityRecipe` stores recipes with `user_id = <current user>` for tenancy, but the recipe page and the `/api/bitmap` & `/api/png` routes were calling `renderLiquidRecipe(slug)` / `fetchRecipeFiles(slug)` without a userId, so the DB query filtered to `user_id IS NULL` and missed every catalog install — the preview rendered "Failed to render liquid template" and the bitmap fell back to "Screen Not Found". The recipe page (`app/(app)/recipes/[slug]/page.tsx`) now resolves `getCurrentUserId()` once and threads it into `fetchLiquidRecipeSettings` and the three `LiquidRenderComponent` previews; the bitmap/PNG routes fall back to `getCurrentUserId()` when no firmware API key is present so dashboard previews of liquid recipes work too.
- **Admin pages reachable in mono-user mode** — when `AUTH_ENABLED=false` the synthetic mono-user is implicitly admin, but `/admin/*` used to redirect to `/` and the user-avatar menu (where admin links live in multi-user mode) wasn't rendered, so device deletion was effectively unreachable from the UI. Now `app/(app)/admin/layout.tsx` renders children when `auth` is null, `requireAdmin()` in `app/actions/admin-*.ts` short-circuits in mono-user mode (matching the existing `canReadSystemLogs` / `canRunSetupSql` pattern), and the sidebar gains a collapsible **Admin** group (Manage devices / Manage users) visible only when auth is disabled.
- **Weather recipe now imperial** — Open-Meteo fetch uses `temperature_unit=fahrenheit&wind_speed_unit=mph`, and the component labels are `°F` / `mph`. Pressure is reported in **hPa** (Open-Meteo's native unit; the older inHg conversion was dropped).
- **Weather small-screen hero shows humidity + wind** — on 640×384 panels the hero adds a humidity (💧 %) and wind (💨 mph) stack at text-7xl (75% of the temperature's text-8xl) on the right side, with inline `sizedHumidityIcon` / `sizedWindIcon` helpers so the icons scale with the typography.
- **New device support: Seeed XIAO ESP32-C6 + Waveshare 7.5" V1** (`xiao_c6_75v1`, 640×384, 1-bit B/W). Full plan and contract reference at [`docs/superpowers/plans/2026-05-14-byos-xiao-c6-75v1-support.md`](docs/superpowers/plans/2026-05-14-byos-xiao-c6-75v1-support.md).
- **1-bit PNG rendering pipeline** — new `/api/png/[[...slug]]` endpoint mirrors `/api/bitmap` but emits 1-bit PNG for firmwares (like the XIAO) that don't accept BMP. `/api/display` auto-routes PNG vs BMP based on the device model's `mime_type` and `bit_depth`.
- **Device Model selector in the edit UI** — pick a model from the merged registry and the form auto-fills `screen_width`, `screen_height`, `grayscale`, and the size preset together. Adds a `640×384` size preset.
- **`/api/setup` autofill** — when the firmware's `Model` header matches a known model, the new device row is pre-populated with the right dimensions and grayscale. Unknown models still pair, just without autofill.
- **Local model overrides via `data/trmnl/models.local.json`** — add devices that aren't in the public `usetrmnl.com` registry. Local entries override upstream by `name` and survive the 24h upstream sync.
- **Bug fixes:**
  - `utils/render-png.ts` now correctly returns the encoded buffer (was silently resolving `undefined` due to a missing Promise wrap).
  - `/api/setup` derives `image_url` from forwarded/host headers instead of the container's internal `0.0.0.0` bind.
  - `/catalog` honors `ENABLE_EXTERNAL_CATALOG` at runtime. The page is rendered with `cacheComponents: true` (PPR), so it was being statically prerendered at `next build` time when the env var was unset — flipping the var at runtime had no effect because the cached "External catalog is disabled" HTML was served. Fixed with `await connection()` so the page re-renders per request. Same pattern as the earlier `/sign-in` fix for `ERROR_ENV_VAR_DATABASE_URL_NOT_SET` — any server component that reads runtime-only state under PPR needs the `connection()` marker.

### ✨ Features
- Device management UI with MAC/API key registration, status tracking, and refresh scheduling.
- Playlist-based screen rotation with time and weekday rules, custom durations, and per-device assignment.
- On-demand screen rendering to 1-bit BMP or 1-bit PNG via Takumi/Satori with caching and revalidation; per-device format auto-selected from the model registry.
- Postgres backed persistence for devices, logs, and playlists.
- Recipes gallery to prototype screens and compare direct vs. bitmap rendering before pushing to hardware.
- Tailwind v4 + TypeScript + Next.js 16 + React 19; Biome lint/format baseline.
- Docker Compose for app + Postgres; deploy-ready Vercel button with Supabase/Neon integration.

## Table of Contents
- [BYOS Next.js for TRMNL 🖥️](#byos-nextjs-for-trmnl-️)
  - [🚀 Overview](#-overview)
  - [🆕 What's New (May 2026)](#-whats-new-may-2026)
    - [✨ Features](#-features)
  - [Table of Contents](#table-of-contents)
  - [Highlights](#highlights)
  - [Demo \& Screens](#demo--screens)
  - [Quickstart](#quickstart)
    - [Deploy to Vercel](#deploy-to-vercel)
    - [Run with Docker Compose (app + Postgres)](#run-with-docker-compose-app--postgres)
    - [Run Locally](#run-locally)
  - [Environment](#environment)
    - [Renderer Options](#renderer-options)
    - [Database Options](#database-options)
  - [Project Structure](#project-structure)
  - [Playlists](#playlists)
  - [Recipes](#recipes)
  - [Documentation](#documentation)
  - [Roadmap](#roadmap)
  - [Support \& Feedback](#support--feedback)
  - [License](#license)

## Highlights
- Dynamic BMP generation with Next.js 16, React 19, Tailwind CSS v4, and TypeScript.
- Supabase-backed device management, logging, and playlist scheduling.
- No-DB fallback mode for quickly previewing screens without a database.
- Docker Compose support for local PostgreSQL.
- Recipes gallery for rapid screen prototyping before deploying to devices.
- Clean codebase with Biome linting and formatting.

## Demo & Screens
- Live demo: [https://byos-next-demo.vercel.app](https://byos-next-demo.vercel.app)

![Dashboard](docs/screenshots/dashboard.png)

## Quickstart

### Deploy to Vercel
1. Click the Vercel button above.
2. Link a Supabase or Neon project when prompted.
3. Deploy, then open the app and initialize tables.
4. Point your TRMNL device at the deployed URL.
5. Sync environment variables locally via `vercel link` and `vercel env pull` if you also develop on your machine.

### Run with Docker Compose (app + Postgres)
1. Copy `.env.example` to `.env` and fill in the required values. At minimum:
   ```
   POSTGRES_PASSWORD=your_password
   BETTER_AUTH_SECRET=a_random_32_character_secret
   ```
   `docker-compose.yml` reads from `.env` (not `.env.local`). Generate a secret with `openssl rand -base64 32`.
2. Start the stack:
   ```bash
   docker-compose up -d
   # visit http://localhost:3000
   ```

#### Browser-based renderer (optional)
For pixel-perfect TRMNL Framework UI compatibility, run the browser renderer alongside a headless Chrome container:
```bash
docker-compose -f docker-compose.yml -f docker-compose.browser.yml up -d
```
This sets `REACT_RENDERER=browser` and starts a Chromium debugger that renders recipes via `/recipes/[slug]/preview`. See the `Environment` section for renderer options.

### Run Locally
```bash
git clone https://github.com/usetrmnl/byos_next
cd byos_next
pnpm install
```

Start the dev server:
```bash
pnpm dev
```

Format/lint:
```bash
pnpm lint
```

## Environment
Create `.env.local` (for `pnpm dev`) or `.env` (for Docker Compose) with the keys you need. See `.env.example` for the full list. Common variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. |
| `POSTGRES_PASSWORD` | Used by `docker-compose.yml` to bootstrap the Postgres container. |
| `BETTER_AUTH_SECRET` | Required when `AUTH_ENABLED=true`. Generate with `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | Public URL of your deployment (defaults to `http://localhost:3000`). |
| `AUTH_ENABLED` | Set to `false` to disable authentication (mono-user mode). |
| `ADMIN_EMAIL` | Email that receives admin role on first sign-up. |
| `REACT_RENDERER` | `takumi` (default), `satori`, or `browser`. See below. |
| `ENABLE_EXTERNAL_CATALOG` | Allow fetching the community / TRMNL recipe catalog. |

### Renderer Options
- **`takumi`** (default): fast Rust-backed Satori-compatible renderer.
- **`satori`**: original Vercel Satori renderer.
- **`browser`**: headless Chrome via `puppeteer-core`, required for full TRMNL Framework UI components and pixel-perfect parity with the official cloud. Use the `docker-compose.browser.yml` overlay or set `BROWSER_URL` to a reachable Chrome DevTools endpoint.

### Database Options
- **Supabase or Neon:** run migrations in `migrations/` in order, or use the in-app Initialize button on first launch. **Note:** migration `0009_add_user_tenancy.sql` assumes a `postgres` superuser role. On managed providers where the connection role differs, edit `GRANT byos_app TO <your_role>` before running it (see [#46](https://github.com/usetrmnl/byos_next/issues/46)).
- **Docker/Postgres:** set `POSTGRES_PASSWORD` and `BETTER_AUTH_SECRET` in `.env`, then run `docker-compose up -d`.
- **No-DB mode:** run `pnpm dev` without DB env vars to preview screens only (device management disabled).

## Project Structure
- `app/` - Next.js routes and screens (including `/recipes`).
- `components/` - UI components.
- `migrations/` - SQL migrations for Postgres.
- `public/` - Static assets and screenshots.
- `scripts/`, `utils/`, `lib/` - helpers for rendering, caching, and device logic.
- `docs/api.md` - HTTP API reference.

## Playlists
- Schedule screens by time and weekday with custom durations.
- Assign playlists to devices to rotate content automatically.
- Enable playlist mode per device in the UI.

## Recipes
Visit `/recipes` to browse screens and compare direct vs. bitmap rendering. To add one:
1. Create a folder under `app/recipes/screens`.
2. Add your component and data fetching logic.
3. Register it in `app/recipes/screens.json`.

See `docs/recipes.md` for more detail.

## Documentation
- API endpoints and payloads: `docs/api.md`
- Recipes reference: `app/recipes/README.md`
- Contributing guide: `CONTRIBUTING.md`

## Roadmap
- Better recipe management system
- Compatibility with TRMNL recipes

## Support & Feedback
- GitHub Issues: https://github.com/usetrmnl/byos_next/issues
- Discussions: https://github.com/usetrmnl/byos_next/discussions
- Email: manglekuo@gmail.com
- TRMNL Discord: reply to the maintainer thread.

## License
MIT - see `LICENSE`.
