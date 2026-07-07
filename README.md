<div align="center">

![MJW Design](https://mjwdesign.ca/wp-content/uploads/2024/01/mjw-design-logo.png)

**Built with [MJW Design](https://mjwdesign.ca) — AI-Powered Development**

---

</div>

# MJW Janky Workday

A personal dashboard that aggregates real-time data from the tools and services that power a day in the MJW ecosystem. It surfaces GitHub activity, Trello cards, Google Calendar events, Homebase schedule data, escape room stock levels, weather, chat tasks, idea capture, and app status — all in a single draggable card-based interface. Each card talks to a dedicated Netlify Function so no API secrets ever reach the browser.

## Screenshots

| Dashboard Overview | Expanded Card View |
| :---- | :---- |
| ![MJW Janky Workday dashboard overview — placeholder](screenshots/dashboard-overview.png) | ![MJW Janky Workday expanded card view — placeholder](screenshots/expanded-card.png) |

## What It Does

Rather than switching between GitHub, Trello, Google Calendar, Homebase, and a weather service throughout the day, this dashboard pulls everything into one tab. Each service is represented as an independent card that fetches data through its own serverless function.

| Card | Data Source | What It Shows |
| :---- | :---- | :---- |
| **GitHub Activity** | GitHub API via Netlify Function | Recent commits, push events, and repo activity. |
| **Trello Cards** | Trello API via Netlify Function | Active cards from the Escape Maze org board. |
| **Google Calendar** | Google Calendar API via Netlify Function | Upcoming events for the day or week. |
| **Homebase Schedule** | Homebase Gmail parsing via Netlify Function | Parsed shift schedule and staffing overview. |
| **Escape Stock** | PocketBase via Netlify Function (admin auth) | Escape room prop and supply inventory levels. |
| **Weather** | Weather service | Current conditions and forecast. |
| **Chat Tasks** | PocketBase (direct frontend write) | Quick task capture linked to conversations. |
| **Idea Capture** | PocketBase (direct frontend write) | Rapid idea logging for later review. |
| **App Status** | Static / mock data | Status indicators for connected MJW apps. |

**Key interactions:**

- Each card refreshes independently; failed cards degrade gracefully without breaking the layout.
- Click any card to expand it into a full overlay for detailed reading.
- Cards that support write operations (Chat Tasks, Idea Capture) post directly to PocketBase with open collection rules.
- Server-side cards (GitHub, Trello, Google Calendar, Homebase, Escape Stock) never expose tokens to the browser.

## How to Use

Open the dashboard and all cards begin loading in parallel. Cards backed by Netlify Functions show their current data once the function responds. Cards backed by PocketBase (Chat Tasks, Idea Capture) connect to `VITE_POCKETBASE_URL` directly from the browser. Cards for which no API credentials are configured display a graceful empty or error state rather than crashing the page.

The Escape Stock card uses a privileged PocketBase admin session maintained inside the `escape-stock` Netlify Function — `PB_ADMIN_EMAIL` and `PB_ADMIN_PASSWORD` are never placed in frontend code.

## Stack

| Layer | Technology |
| :---- | :---- |
| UI framework | React 18 \+ TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Frontend data (tasks/ideas) | PocketBase ^0.27 |
| Backend data (admin/secrets) | Netlify Functions \+ PocketBase admin auth |
| Third-party integrations | GitHub API, Trello API, Google Calendar API, Homebase Gmail parsing |
| Hosting | Netlify |

## Local Development

npm install

npm run dev

The app runs with **no environment variables** in a degraded but functional state — cards that require Netlify Function secrets will show empty or error states, while layout, mock data, and PocketBase-backed cards work immediately.

For full local functionality, copy `.env.example` to `.env.local` and fill in the values described in the Environment Variables section below.

## Quality Checks

npm run typecheck

npm run lint

npm run build

## Available Scripts

npm run dev        # Start development server (http://localhost:5173)

npm run build      # Production build → dist/

npm run preview    # Preview production build locally

npm run lint       # ESLint check

npm run typecheck  # TypeScript type check (no emit)

## Environment Variables

Frontend variables (`VITE_` prefix) are safe to expose in the browser. All other variables are **Netlify Function secrets** and must be set in the Netlify dashboard under **Site configuration → Environment variables** — never in a committed `.env` file.

| Variable | Required? | Scope | Enables | Description |
| :---- | :---- | :---- | :---- | :---- |
| `VITE_POCKETBASE_URL` | Optional | Frontend/public | Chat Tasks and Idea Capture direct writes | Public PocketBase/PocketHost URL. Example: `https://mjwdesign-core.pockethost.io`. |
| `PB_ADMIN_EMAIL` | Optional | Netlify Function only | Escape Stock admin reads | PocketBase superuser email for the `escape-stock` function. Never use as a `VITE_` variable. |
| `PB_ADMIN_PASSWORD` | Optional | Netlify Function only | Escape Stock admin reads | PocketBase superuser password. Never use as a `VITE_` variable. |
| `GITHUB_TOKEN` | Optional | Netlify Function only | GitHub Activity card | Personal access token for the `github-activity` function. |
| `TRELLO_API_KEY` | Optional | Netlify Function only | Trello card data | Trello API key for the `trello-cards` function. |
| `TRELLO_TOKEN` | Optional | Netlify Function only | Trello card data | Trello user token for the `trello-cards` function. |
| `GOOGLE_CLIENT_ID` | Optional | Netlify Function only | Google Calendar \+ Homebase Gmail parsing | OAuth 2.0 client ID shared by `google-calendar` and `homebase-schedule` functions. |
| `GOOGLE_CLIENT_SECRET` | Optional | Netlify Function only | Google Calendar \+ Homebase Gmail parsing | OAuth 2.0 client secret. Never use as a `VITE_` variable. |
| `GOOGLE_REFRESH_TOKEN` | Optional | Netlify Function only | Google Calendar \+ Homebase Gmail parsing | Long-lived refresh token used to obtain access tokens server-side. |

## Netlify Functions

Each integration has a dedicated function in `netlify/functions/`. Browser code calls `/.netlify/functions/<name>` and never holds API secrets directly.

| Function | File | Secrets Used | Purpose |
| :---- | :---- | :---- | :---- |
| `escape-stock` | `escape-stock.mts` | `PB_ADMIN_EMAIL`, `PB_ADMIN_PASSWORD` | Authenticates as PocketBase admin and reads escape room inventory. |
| `github-activity` | `github-activity.mts` | `GITHUB_TOKEN` | Fetches recent GitHub events for the configured user. |
| `google-calendar` | `google-calendar.mts` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` | Reads upcoming calendar events via OAuth. |
| `homebase-schedule` | `homebase-schedule.mts` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` | Parses Homebase shift emails from Gmail via the same OAuth credentials. |
| `trello-cards` | `trello-cards.mts` | `TRELLO_API_KEY`, `TRELLO_TOKEN` | Fetches active cards from the Escape Maze Trello org. |

## PocketBase Setup

The Chat Tasks and Idea Capture cards write directly from the browser to PocketBase using open collection rules. Set `VITE_POCKETBASE_URL` to your PocketHost URL.

The Escape Stock card uses a privileged admin session inside the `escape-stock` Netlify Function. Configure `PB_ADMIN_EMAIL` and `PB_ADMIN_PASSWORD` in the Netlify dashboard only — never in frontend code.

### Recommended Collections

| Collection | Access | Key Fields |
| :---- | :---- | :---- |
| `chat_tasks` | Open write from browser | `text`, `linked_chat`, `created`, `done` |
| `idea_capture` | Open write from browser | `title`, `body`, `tags`, `created` |
| `escape_stock` | Admin-only via Netlify Function | `item_name`, `quantity`, `location`, `updated` |

## Netlify Deployment

The `netlify.toml` at the project root configures the Vite build and the functions directory. Functions are bundled with `esbuild`. API routes are served with `Cache-Control: no-store` to prevent stale data.

| Setting | Value |
| :---- | :---- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` |
| Node bundler | `esbuild` |

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

Deploy first with no environment variables to confirm the layout and mock data render correctly, then add secrets one integration at a time in the Netlify dashboard.

## Project Structure

```
src/
  cards/
    AppStatusCard.tsx         # MJW app health indicators
    CalendarCard.tsx          # Google Calendar events
    ChatTasksCard.tsx         # PocketBase-backed quick task capture
    EscapeStockCard.tsx       # Escape room inventory (admin-authenticated)
    GitHubCard.tsx            # Recent GitHub activity
    HomebaseCard.tsx          # Homebase shift schedule
    IdeaCaptureCard.tsx       # PocketBase-backed idea logging
    TrelloCard.tsx            # Trello board cards
    WeatherCard.tsx           # Weather conditions and forecast
  components/
    CardShell.tsx             # Shared card wrapper with expand support
    ExpandedOverlay.tsx       # Full-screen card detail overlay
  lib/
    pocketbase.ts             # PocketBase client wrapper
  mockData/
    appStatus.ts              # Static mock for app status card
    calendar.ts               # Mock calendar events
    escapeStock.ts            # Mock inventory data
    github.ts                 # Mock GitHub events
    homebase.ts               # Mock schedule data
    trello.ts                 # Mock Trello cards
    weather.ts                # Mock weather data
  App.tsx                     # Root layout and card grid
  main.tsx                    # Entry point
  types.ts                    # Shared TypeScript types

netlify/
  functions/
    escape-stock.mts          # PocketBase admin auth + inventory reads
    github-activity.mts       # GitHub API integration
    google-calendar.mts       # Google Calendar OAuth reads
    homebase-schedule.mts     # Homebase Gmail schedule parsing
    trello-cards.mts          # Trello API integration
```

## Changelog

### v0.1.0 — Initial Dashboard Build

- Built card-based dashboard layout with independent per-card data fetching and graceful error states.
- Added Netlify Functions for GitHub, Trello, Google Calendar, Homebase, and Escape Stock integrations.
- Added PocketBase direct-write support for Chat Tasks and Idea Capture cards.
- Added mock data fallbacks for all cards to support layout development without live credentials.
- Configured `netlify.toml` with `esbuild` bundler and no-cache headers on API routes.
- Documented all environment variables and deployment instructions.

---

Part of the **MJW Personal App Platform**.