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
- Tests: `vitest run` (unitarios + componentes con `react-dom/server`).
- Build: `tsc -b && vite build` (Vite 8 / **Rolldown**).
- Deploy: Vercel (SPA + rewrites) + **PWA** (manifest + `sw.js`).
- CI: `.github/workflows/ci.yml` (lint + typecheck + tests + build).

## Code splitting (Fase 3)

- `vite.config.ts` usa `manualChunks` como **función** (Rolldown no acepta objeto).
- Chunks: `react` (react, react-dom, @tanstack), `charts` (recharts, d3),
  `vendor` (resto de node_modules) e `index` (código propio).
- Pendiente: lazy routes de TanStack para cargar Recharts solo al abrir un reporte.

## PWA (Fase 3)

- `public/manifest.webmanifest` (name, icons, theme/background, standalone).
- `public/sw.js`: navegación network-first (offline fallback a index), estáticos
  cache-first con revalidación; **nunca** cachea `/estadisticas` (API de datos).
- Registro en `src/main.tsx` solo si `import.meta.env.PROD`.

## SEO por ruta (Fase 3)

- `src/hooks/usePageMeta.ts`: título, `<meta description>`, canónica, Open Graph
  y JSON-LD (schema.org). Se llama en el componente de cada página nueva.

## Tests de componentes (Fase 3)

- Sin jsdom ni dependencias nuevas: `renderToStaticMarkup` de `react-dom/server`.
- Ejemplo: `src/components/ui/__tests__/DataTable.test.tsx`.

## Problemas conocidos

- Bundle de charts grande (~460 kB); aislado en su chunk, aún sin lazy route.
- Sin E2E (Playwright) ni axe.
- 9 warnings de oxlint (`react/only-export-components`), no bloqueantes.
- `scripts/git_*.py` con cambios locales guardados en `git stash`.
- API de SUPEN lenta; UX depende de caching y feedback de carga.