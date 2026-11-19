# Tech Context

## Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | React | 19.2 |
| Lenguaje | TypeScript | ~6.0 |
| Build | Vite | 8.2 |
| Router | @tanstack/react-router | 1.170 |
| Data | @tanstack/react-query | 5.102 |
| Gráficos | Recharts | 3.10 |
| Estilos | Tailwind CSS | 4.3 |
| Validación | Zod | 4.4 |
| Tests | Vitest | 4.1 |
| Lint | oxlint | 1.75 |
| Deploy | Vercel | - |

## Setup

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run preview
npm run verify   # lint + typecheck + tests
```

## Proxy / API

- Dev: Vite proxy `/estadisticas` → `https://webapps.supen.fi.cr`.
- Prod: rewrite en `vercel.json` (mismo path).
- Base: `https://webapps.supen.fi.cr/estadisticas/api`.
- Endpoints: `comision`, `rendimiento`, `portafolio`, `portafolioisin`,
  `afiliado`, `beneficio`, `cuenta`, `lt`.

## Restricciones

- La API es lenta y pesada: `portafolio`/`portafolioisin` pueden tardar 19–40 s
  y devolver decenas de MB sin filtro de fechas.
- `Entidad` no filtra en varios endpoints; el filtrado por OPC es en cliente.
- `/lt` ignora `Entidad` y solo acepta `Fondo` + fechas.
- `/portafolioisin` está congelado desde 2026-01-31.
- BCCR/IPC no está integrado; `useInflacion()` degrada a sin datos.
- Node.js 18+ y npm 9+.

## Dependencias principales

- UI: React, React DOM, Tailwind CSS.
- Datos: TanStack Query/Router, Zod, fetch nativo.
- Gráficos: Recharts.
- Infra: Vercel Analytics, Speed Insights.
- Dev: Vite, TypeScript, Vitest, oxlint.

## Tooling

- Lint: `oxlint` (plugins react/typescript/oxc).
- Types: `tsc -b --noEmit`.
- Tests: `vitest run`.
- Build: `tsc -b && vite build`.
- Deploy: Vercel (SPA + rewrites).

## Problemas conocidos

- Bundle único de ~904 kB (261 kB gzip); sin code splitting.
- Sin CI (`.github/workflows` ausente).
- Sin tests de componentes ni E2E.
- 5 warnings de oxlint (`react/only-export-components`).
- `scripts/git_*.py` con cambios locales sin commitear.