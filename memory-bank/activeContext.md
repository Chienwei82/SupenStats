# Active Context

## Estado actual

- Rama de trabajo: `feat/fase-1-interactividad` (contiene Fases 1, 2 y 3).
- Base: `main` en `f5fd7a5` (PR #17, Fase 0 ya fusionada).
- `npm run verify` en verde: 0 errores de lint (9 warnings de
  `react/only-export-components`, mismo patrón que `piramide.tsx`/`traslados.tsx`),
  typecheck OK, **130 tests** OK (antes 110).
- `npm run build` OK con **code splitting**: chunks `react` (~290 kB),
  `charts` (~460 kB, Recharts), `vendor` (~59 kB) e `index` (~146 kB).

## Cambios recientes (Fases 1–3)

### Fase 1 — Interactividad
- `ReportTabs`: menú **agrupado** (Reportes / Aprender) + **buscador** sin
  distinción de acentos; navegación por teclado sobre la lista filtrada.
- `WelcomeScreen` (nueva Home): tarjetas por categoría temática + sección Aprender.
- `TimeSeriesChart`: **Brush/zoom** temporal (si >12 cortes) y **toggle
  gráfico ⇄ tabla** con **DataTable** + **ExportButton** (CSV).
- `Comparador` (ruta `/comparador`): compara dos OPC (nominal/real) en el tiempo,
  KPIs (último valor + diferencia), tabla y exportación = **cross-filter por OPC**.

### Fase 2 — Educación
- `Glosario` (`/glosario`): `constants/glossary.ts` + `GlossaryView` con buscador
  y enlaces cruzados entre términos.
- `Aprender` (`/aprender`): `constants/learningPaths.ts` + `LearningPathsView`
  (rutas guiadas) y `Quiz` interactivo (`constants/quiz.ts`, scoring puro
  `evaluateQuiz`).
- `Metodología` (`/metodologia`): `constants/methodology.ts` + `MethodologyView`
  (fuente de datos, nulos≠0, poder adquisitivo, limitaciones, referencias).
- **Exportación** a CSV: `utils/export.ts` (`toCsv`, `safeFilename`,
  `downloadCsv`) + `ExportButton`.

### Fase 3 — Plataforma
- **CI**: `.github/workflows/ci.yml` (lint + typecheck + tests + build + artefacto).
- **Tests de componentes**: `DataTable.test.tsx` con `react-dom/server`
  (`renderToStaticMarkup`), sin jsdom ni dependencias nuevas. Tests nuevos de
  `export`, `search`, `quiz`.
- **Code splitting**: `manualChunks` (función, Vite 8/Rolldown) en `vite.config.ts`.
- **PWA**: `public/manifest.webmanifest` + `public/sw.js` (network-first para
  navegación, cache-first para estáticos, nunca cachea `/estadisticas`),
  registro en `main.tsx` solo en PROD.
- **SEO**: `hooks/usePageMeta.ts` (título, description, canónica, JSON-LD) usado
  por las rutas nuevas.
- **Accesibilidad**: enlace "Saltar al contenido" en `__root.tsx`.

## Próximos pasos (opcionales / backlog)

1. Integrar **BCCR (IPC)** real para el poder adquisitivo (hoy degrada sin datos).
2. Resolver los **9 warnings** de oxlint (`react/only-export-components`).
3. **Lazy routes** con `lazy()`/`splitting` de TanStack Router (además del manualChunks).
4. Tests **E2E** (Playwright) y accesibilidad automatizada (axe).
5. Code splitting más fino: cargar Recharts solo al abrir un reporte con gráficos.

## Decisiones activas

- Mantener el estado de filtros/selectores en la URL (compartibilidad).
- **No introducir dependencias nuevas** (tests de componentes con renderToStaticMarkup).
- Preservar `null`; nunca convertir ausencias a 0 (tablas muestran "N/D" al final).
- Cada reporte nuevo requiere SPEC + DESIGN en `docs/reportes/<nombre>/`.
- PWA y code splitting sin plugins extra (manifest + SW a mano, manualChunks).

## Preguntas abiertas

- ¿Dominio canónico para URLs absolutas de OG/canonical? (afecta `usePageMeta`).
- ¿Integrar BCCR (IPC) para poder adquisitivo?
- ¿Añadir Playwright para E2E en CI?

## Aprendizajes

- Vite 8 usa **Rolldown**: `manualChunks` debe ser **función**, no objeto.
- El tanstack router plugin **regenera `routeTree.gen.ts`** en `vite build`;
  por eso se corre `vite build` antes de `tsc` al añadir rutas.
- `verbatimModuleSyntax` + `erasableSyntaxOnly`: usar `import type`, sin enums.
- Tests de componentes sin DOM: `react-dom/server` + Vitest (entorno node).
- La API de SUPEN es lenta; el bundle y el caching siguen siendo el riesgo de UX.