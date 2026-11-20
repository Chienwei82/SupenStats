# Progress

## Qué funciona

- 17 reportes con datos reales de SUPEN.
- Filtros por fondo/fechas con estado en URL y botón Restablecer.
- Selectores de vista en URL (periodicidad, corte, métrica, OPC, dataset).
- Gráficos con tooltip, leyenda clicable y notas educativas.
- **Navegación agrupada + buscador** (menú colapsable) y **nueva Home** por categorías.
- **Brush/zoom** y **toggle gráfico ⇄ tabla + exportación CSV** en series temporales.
- **Comparador de dos OPC** (nominal/real) con KPIs, tabla y exportación.
- **Simulador de pensión** con rentabilidad histórica y poder adquisitivo (degrada
  sin BCCR).
- **Glosario**, **rutas de aprendizaje**, **quiz** y **metodología**.
- **Exportación a CSV** (`utils/export.ts` + `ExportButton`).
- **PWA** (manifest + service worker) con soporte offline en producción.
- **Code splitting** (react / charts / vendor) y **SEO por ruta** (JSON-LD).
- **CI** (GitHub Actions), enlace "Saltar al contenido".
- Tema claro/oscuro, responsive, accesibilidad (ARIA, foco, reduced motion).
- **130 tests** (unitarios + componentes); lint sin errores; typecheck y build OK.

## Qué falta

- Integración **BCCR (IPC)** real para poder adquisitivo.
- Resolver los **9 warnings** de oxlint (`react/only-export-components`).
- **Lazy routes** (TanStack) + cargar Recharts solo al abrir un reporte.
- Tests **E2E** (Playwright) y accesibilidad automatizada (axe).

## Estado

- Fases 0–3 completadas en `feat/fase-1-interactividad` (base `main` = `f5fd7a5`).
- Verificación: `npm run verify` ✓ (0 errores, 130 tests), `npm run build` ✓.

## Issues conocidos

- Bundle de charts grande (~460 kB); se aísla en su propio chunk.
- Sin E2E ni monitoreo de errores.
- API de SUPEN lenta; la UX depende de caching y feedback de carga.
- `og:image`/canónica usan ruta relativa; conviene URL absoluta al conocer el dominio.

## Evolución de decisiones

- `App.tsx` + `useSupenData` → rutas file-based + `useReportQuery` (React Query).
- Filtros en memoria → estado en URL (compartibilidad/back).
- `?? 0` en agregaciones → preservación de `null` y "no disponible".
- Gráficos con markup duplicado → `ChartCard` unificado.
- Documentación desactualizada → README/SPEC corregidos + CONTRIBUTING.
- Sin Memory Bank → Memory Bank inicializado.
- Bundle único → code splitting (manualChunks).
- Navegación plana → menú agrupado con buscador + Home por categorías.
- Sin tests de componentes → `react-dom/server` + Vitest (sin dependencias nuevas).