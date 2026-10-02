# frontend

React + TypeScript frontend for db-snaps, built with Vite.

This is a clickable prototype of the Motus UI. It uses mock data from `src/data/mockData.ts` and in-memory state, so changes reset on reload. There is no backend connection yet, and new analyses show generated sample data.

Routing uses React Router (`src/App.tsx`). Pages:

- `/` — home: list of databases, with a button to add a new one
- `/databases/new` — new database: name, connection string, credentials, Test Connection and Create
- `/databases/new/settings` — settings for the new database (snapshot frequency; table/column selection is a placeholder); saving creates the database and opens its dashboard
- `/databases/:databaseId` — database dashboard: analysis cards, Add Analysis, and Settings
- `/databases/:databaseId/settings` — the same settings page for an existing database
- `/databases/:databaseId/analyses/new` — choose an analysis type; creates a new card on the dashboard
- `/databases/:databaseId/analyses/:analysisId` — closer look at one analysis: chart and data table
- `/style` — style reference for colors, typography, spacing, and controls

Design tokens live as CSS custom properties in `src/index.css`; shared component styles are in `src/App.css`.

## Run locally

```bash
npm install
npm run dev
```

## Build and lint

```bash
npm run build
npm run lint
```
