# frontend

React + TypeScript frontend for db-snaps, built with Vite.

Routing uses React Router (`src/App.tsx`). Current routes:

- `/` — placeholder home page (`src/pages/Home.tsx`)
- `/style` — style reference showing the Motus color palette, typography, spacing, buttons, form controls, cards, and navigation (`src/pages/StyleReference.tsx`)

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
