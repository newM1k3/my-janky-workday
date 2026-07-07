<div align="center">

![MJW Design](https://mjwdesign.ca/wp-content/uploads/2024/01/mjw-design-logo.png)

**Built with [MJW Design](https://mjwdesign.ca) — AI-Powered Development**

---

</div>

# MJW Janky Workday

A personal operations dashboard that aggregates live data from multiple services into a single, glanceable card-based interface. It surfaces GitHub activity, Trello board state, Google Calendar events, Homebase staff schedules, PocketBase-backed idea capture and chat tasks, and escape-room inventory — all in one place. Each card is independently powered by a secure **Netlify Function** so API secrets never reach the browser.

## Screenshots

| Dashboard Overview | Expanded Card View |
| :---- | :---- |
| ![MJW Janky Workday dashboard overview — placeholder](screenshots/dashboard-overview.png) | ![MJW Janky Workday expanded card overlay — placeholder](screenshots/expanded-card.png) |

## What It Does

Rather than context-switching between GitHub, Trello, Google Calendar, Homebase, and your PocketBase projects, this dashboard pulls everything into a unified card grid that refreshes on demand.

| Card | Data Source | What It Shows |
| :---- | :---- | :---- |
| **GitHub Activity** | GitHub API (via Netlify Function) | Recent commits, pushes, and repo events. |
| **Trello Cards** | Trello API (via Netlify Function) | Active cards across the Escape Maze org boards. |
| **Calendar** | Google Calendar API (via Netlify Function) | Upcoming events from the connected Google account. |
| **Homebase Schedule** | Homebase Gmail parsing (via Netlify Function) | Staff shift schedule parsed from Homebase emails. |
| **Escape Stock** | PocketBase admin API (via Netlify Function) | Escape-room inventory records with server-side auth. |
| **Idea Capture** | PocketBase direct (frontend) | Quick idea logging with open-rule PocketBase writes. |
| **Chat Tasks** | PocketBase direct (frontend) | Lightweight task list backed by PocketBase. |
| **Weather** | Weather API / mock | Current conditions at a configured location. |
| **App Status** | Internal / mock | Health or status indicators for connected services. |

**Key interactions:**

- Each card loads independently; a single failing service does not break the rest of the dashboard.
- Click any card to expand it into a full-screen overlay for detailed reading or interaction.
- Cards with PocketBase integration (Idea Capture, Chat Tasks) write directly from the browser using open collection rules.
- Cards backed by third-party secrets (GitHub, Trello, Google, Homebase, EscapeStock) proxy all requests through Netlify Functions.
- Mock data modules are included for every card so the dashboard renders without any configured services.

## How to Use

Open the dashboard and all cards will attempt to load their data in parallel. Cards that cannot reach their backing service fall back to a graceful empty or mock state. Use the Idea Capture card to jot notes that land immediately in PocketBase. Use the Trello and GitHub cards for a morning stand-up glance. Expand any card for a larger reading area. Because this is a personal ops dashboard, there is no authentication layer on the frontend — it is intended to be deployed to a private or access-controlled Netlify URL.

## Stack

| Layer | Technology |
| :---- | :---- |
| UI framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Frontend persistence | PocketBase (direct browser writes) |
| Supabase client | @supabase/supabase-js (available for future use) |
| Serverless functions | Netlify Functions (esbuild bundler) |
| Hosting | Netlify |

## Local Development

```
npm install
```

```
npm run dev
```

The dashboard will render with mock data for every card that has no configured environment variable. Copy `.env.example` to `.env.local` and fill in the values for any services you want to connect. At minimum, `VITE_POCKETBASE_URL` is needed for Idea Capture and Chat Tasks.

```
cp .env.example .env.local
```

## Quality Checks

```
npm run typecheck
```

```
npm run lint
```

```
npm run build
```

## Available Scripts

```
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint check
npm run typecheck  # TypeScript type check (no emit)
```

## Environment Variables

Frontend variables (`VITE_` prefix) are bundled into the browser build. All other variables are **Netlify Function secrets** and must be set in the Netlify dashboard — never in a committed `.env` file.

| Variable | Required? | Scope | Enables | Description |
| :---- | :---- | :---- | :---- | :---- |
| `VITE_POCKETBASE_URL` | Recommended | Frontend/public | Idea Capture and Chat Tasks direct writes | Public PocketBase/PocketHost URL. Example: `https://mjwdesign-core.pockethost.io`. |
| `PB_ADMIN_EMAIL` | Optional | Netlify Function/server only | EscapeStock server-side PocketBase auth | Admin email for privileged PocketBase reads in the `escape-stock` function. Never expose as a `VITE_` variable. |
| `PB_ADMIN_PASSWORD` | Optional | Netlify Function/server only | EscapeStock server-side PocketBase auth | Admin password paired with `PB_ADMIN_EMAIL`. Never expose as a `VITE_` variable. |
| `GITHUB_TOKEN` | Optional | Netlify Function/server only | GitHub Activity card | Personal access token for the `github-activity` function. Increases rate limits and enables private repo events. |
| `TRELLO_API_KEY` | Optional | Netlify Function/server only | Trello Cards card | Trello REST API key for the `trello-cards` function. |
| `TRELLO_TOKEN` | Optional | Netlify Function/server only | Trello Cards card | Trello OAuth token paired with `TRELLO_API_KEY`. |
| `GOOGLE_CLIENT_ID` | Optional | Netlify Function/server only | Google Calendar and Homebase cards | OAuth 2.0 client ID for `google-calendar` and `homebase-schedule` functions. |
| `GOOGLE_CLIENT_SECRET` | Optional | Netlify Function/server only | Google Calendar and Homebase cards | OAuth 2.0 client secret. Never expose as a `VITE_` variable. |
| `GOOGLE_REFRESH_TOKEN` | Optional | Netlify Function/server only | Google Calendar and Homebase cards | Long-lived refresh token used to obtain access tokens server-side. |

## PocketBase Setup

Two cards write directly from the browser using open collection rules: **Idea Capture** and **Chat Tasks**. No user authentication is required for these cards — they rely on PocketBase collections configured with permissive create/list rules suitable for a private personal dashboard.

Set `VITE_POCKETBASE_URL` to your PocketHost or self-hosted PocketBase instance URL. The frontend PocketBase client is initialised in `src/lib/pocketbase.ts`.

The **EscapeStock** card uses a different pattern: its Netlify Function authenticates as a PocketBase admin using `PB_ADMIN_EMAIL` and `PB_ADMIN_PASSWORD` from server-side environment variables, then performs privileged reads before returning sanitised data to the browser. Admin credentials are never included in the frontend bundle.

### Recommended Collections

| Collection | Access Pattern | Key Fields |
| :---- | :---- | :---- |
| `ideas` | Open create/list rules (frontend direct) | `title`, `body`, `created` |
| `chat_tasks` | Open create/list/update rules (frontend direct) | `task`, `done`, `created` |
| `escape_stock` | Admin-only (server-side function) | `item`, `quantity`, `location`, `updated` |

## Netlify Functions

Each third-party integration is implemented as a separate Netlify Function. Browser code calls `/.netlify/functions/<name>`; it never calls external APIs directly and never includes secret tokens in frontend code.

| Function | File | Backing Service |
| :---- | :---- | :---- |
| `escape-stock` | `netlify/functions/escape-stock.mts` | PocketBase (admin auth) |
| `github-activity` | `netlify/functions/github-activity.mts` | GitHub REST API |
| `google-calendar` | `netlify/functions/google-calendar.mts` | Google Calendar API |
| `homebase-schedule` | `netlify/functions/homebase-schedule.mts` | Homebase via Google/Gmail |
| `trello-cards` | `netlify/functions/trello-cards.mts` | Trello REST API |

All functions are bundled with esbuild as configured in `netlify.toml`. API responses from `/api/*` paths are served with `Cache-Control: no-store` to ensure freshness.

## Netlify Deployment

Connect this repository to Netlify and configure the following production settings.

| Setting | Value |
| :---- | :---- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` |
| Node bundler | esbuild |
| Node/package install | Netlify default Node environment with `npm install` |

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "no-store"
```

Deploy first with no environment variables to confirm all cards render with mock data, then add service-specific secrets one at a time to bring each card live.

## Mock Data

Every card has a corresponding mock data module in `src/mockData/`. This means the dashboard is always renderable — useful for UI development, screenshots, and deployments where a particular service is not yet configured.

| Mock File | Card |
| :---- | :---- |
| `appStatus.ts` | App Status Card |
| `calendar.ts` | Calendar Card |
| `escapeStock.ts` | Escape Stock Card |
| `github.ts` | GitHub Activity Card |
| `homebase.ts` | Homebase Schedule Card |
| `trello.ts` | Trello Cards Card |
| `weather.ts` | Weather Card |

## Project Structure

```
src/
  cards/
    AppStatusCard.tsx         # Service health indicators
    CalendarCard.tsx          # Google Calendar events
    ChatTasksCard.tsx         # PocketBase-backed task list
    EscapeStockCard.tsx       # Escape-room inventory (proxied)
    GitHubCard.tsx            # GitHub activity feed
    HomebaseCard.tsx          # Homebase staff schedule
    IdeaCaptureCard.tsx       # Quick idea logging to PocketBase
    TrelloCard.tsx            # Trello board cards
    WeatherCard.tsx           # Current weather conditions
  components/
    CardShell.tsx             # Shared card wrapper with expand affordance
    ExpandedOverlay.tsx       # Full-screen card overlay
  lib/
    pocketbase.ts             # PocketBase client initialisation
  mockData/
    appStatus.ts              # Mock data — App Status
    calendar.ts               # Mock data — Calendar
    escapeStock.ts            # Mock data — Escape Stock
    github.ts                 # Mock data — GitHub
    homebase.ts               # Mock data — Homebase
    trello.ts                 # Mock data — Trello
    weather.ts                # Mock data — Weather
  types.ts                    # Shared TypeScript types
  App.tsx                     # Root layout + card grid
  main.tsx                    # Entry point

netlify/
  functions/
    escape-stock.mts          # PocketBase admin auth + inventory reads
    github-activity.mts       # GitHub REST API proxy
    google-calendar.mts       # Google Calendar OAuth proxy
    homebase-schedule.mts     # Homebase schedule via Google/Gmail proxy
    trello-cards.mts          # Trello REST API proxy
```

## Changelog

### v0.1.0 — Initial Dashboard

- Built card grid with independent loading states and mock data fallbacks for all nine cards.
- Implemented five Netlify Functions proxying GitHub, Trello, Google Calendar, Homebase, and PocketBase admin APIs.
- Added PocketBase direct-write integration for Idea Capture and Chat Tasks cards.
- Added expandable card overlay, shared CardShell wrapper, and Tailwind-based responsive layout.
- Configured Netlify deployment with esbuild function bundling and no-store cache headers on API routes.
- Documented all environment variables with scope, purpose, and security guidance.

---

Part of the **MJW Personal App Platform**.