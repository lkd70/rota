# Availability schedule

World Cup cover availability viewer — a reference Svelte 5 app with schema-validated data, timezone-aware domain logic, and layered CSS.

## Structure

```
schema/schedule.schema.json   JSON Schema for schedule data
data/schedule.json            Canonical schedule (validated at build + runtime)
scripts/validate-schedule.mjs CI validation (uses shared parseSchedule)
web/
  src/
    components/               Presentational UI
    lib/app/ScheduleLive      Reactive view-model (Svelte 5 class + runes)
    lib/domain/calendar.js    Timezone-aware ISO date math
    lib/domain/clock.js       Explicit Clock (no global mutable state)
    lib/data/parseSchedule.js Runtime + build validation (Ajv)
    styles/                   Modular CSS (@layer)
```

## Foundations

**Timezone-first calendar.** All date boundaries use `createCalendar(meta.timezone)` — week grids, formatting, and day arithmetic never rely on the browser's local timezone.

**Explicit clock.** `Clock` is constructed per render with optional spoofing for test mode. Domain functions take `nowMinutes` as an argument instead of reading global state.

**Validated data.** `validateScheduleDocument()` is the single validator — used in CI/build, and in dev via `assertSchedule.dev.js`. Production bundles trust the build-validated JSON (no Ajv in the shipped bundle).

**View-model class.** `ScheduleLive` holds `$state` / `$derived` fields with `$bindable` props in child components — no getter/setter facades.

**Preference boot.** A single `buildPreferenceBootSnippet()` is injected into `index.html` at build time via Vite — no runtime script injection, no duplicated theme logic.

## Commands

```bash
node scripts/validate-schedule.mjs   # validate schedule JSON
cd web && npm run dev
cd web && npm run check              # svelte-check
cd web && npm run test               # vitest (domain layer)
cd web && npm run lint
cd web && npm run build
```

CI runs `check`, `test`, `lint`, and `build` before deploy.

## URL params

- `?date=2026-06-27` or `?date=today` — scroll to a day
- `?test=1&date=…&time=…` — test harness with date/time spoofing

## Branches

- **`master`** — v2 (this architecture)
- **`v1`** — frozen snapshot of the original app
