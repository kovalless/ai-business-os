# AI Business OS

The daily workspace for a small business. Built strictly to VITRINE Volume I (Manifesto) and
Volume II (Visual Language).

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 — `/` redirects to `/today`.

## Rooms

| Route | Room | What it answers |
|---|---|---|
| `/today` | Today | Where you stand, what changed, three moves |
| `/table` | The Table | Work on one object with the machine in the margin |
| `/people` | Customers | Attention list, search, filters, standing |
| `/people/[id]` | A customer | Thread, conversations, invoices, company |
| `/reach` | Marketing | Seasons, content calendar, ideas, performance |
| `/work` | Tasks | Priorities, upcoming, settled, focus mode |
| `/ledger` | Ledger | Cash, invoices, standings, receipts |
| `/record` | Knowledge Base | Pinned, documents, playbooks, meetings |
| `/long-view` | Analytics | Six drill-downs and an executive briefing |
| `/settings` | Settings | Sources, the standing figure, opening hours |

Aliases (redirects, so no navigation path 404s): `/customers`, `/customers/[id]`, `/crm`,
`/tasks`, `/marketing`, `/analytics`, `/knowledge`, `/knowledge-base`, `/dashboard`.

## Keyboard

- `⌘K` / `Ctrl+K` — the Aperture (Go / Do / Ask / Make)
- `g` then `t a c m w l k v s` — Today, The Table, Customers, Marketing, Tasks, Ledger, Knowledge, Analytics, Settings
- `f` — focus mode in Tasks
- `m` — show or hide the margin
- `?` — the full list
- `esc` — close exactly one layer

## Architecture

```
src/
  app/            one folder per room, each with page + loading + error
  components/
    shell/        Frame, Rail, Lintel, Room, Margin, Aperture, Shortcuts, NightProvider
    ui/           20 primitives — Actuator, Field, Figure, Sill, DataTable, Seal, Chart…
    ai/           Proposal (warmth drain), MarginNote
  lib/
    data/         the business: Vaneck & Co, 8 customers, 8 invoices, 6 campaigns, 9 tasks, 6 notes
    hooks/        useMediaQuery
    motion.ts     durations, curves, variants
    types.ts      domain types
    utils.ts      money, num, pct, dayPhase, relativeDays
```

## The laws this code enforces

- One Sill per surface. State above it, meaning below it.
- Warm is the machine. `Proposal` drains its warmth to `--v-recess` on accept.
- No weight above 500. No bold anywhere.
- Elevation only on things Escape dismisses (Aperture, Shelf, Seal).
- No spinners, no skeletons. `Structure` renders the building; `Figure` holds last-known truth.
- Numbers never animate. Tabular figures, currency hanging in the gutter.
- Three moves maximum on Today.
- No badges, no counts, no red dots on the Rail.

## Design tokens

All in `src/app/globals.css` under `@theme`. Semantic aliases (`--v-ground`, `--v-ink`) flip under
`.night`, which `NightProvider` toggles from the local clock (Opening Hours). Override the phase in
Settings.
