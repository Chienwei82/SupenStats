# Active Context

## Estado actual

- Rama de trabajo: `chore/fase-0-quick-wins` (publicada en origin).
- Fase 0 completada y commiteada (`9e8ad1a`).
- `npm run verify` en verde: 0 errores de lint (5 warnings), typecheck OK,
  110 tests OK.
- Build de producción OK (~904 kB JS / 261 kB gzip, un solo chunk).

## Cambios recientes (Fase 0)

- README/SPEC corregidos: arquitectura real por rutas, puerto 3000, tipos de
  dominio y shapes; se añadió `CONTRIBUTING.md` y `docs/reportes/README.md`.
- 9 gráficos unificados en `ChartCard` (Activos, Afiliados, Aportantes,
  Beneficios, Cuentas, Demografía, Portafolio, Portafolio ISIN, Transferencias).
- `useMemo` en los gráficos que recalculaban agregaciones en cada render.
- SEO: title, description, keywords, robots, color-scheme, theme-color,
  Open Graph y Twitter Card.
- `public/og-image.svg` + `public/og-image.png` (1200×630).
- `ShareButton` para copiar la URL con filtros/selectores.
- `FilterBar` con botón **Restablecer** y `useUrlFilters.reset`.
- `npm run verify` (lint + typecheck + tests).

## Próximos pasos

1. **Fase 1 — Interactividad**: navegación agrupada/buscador, nueva Home,
   brush/zoom, cross-filter por OPC, tabla alternativa, simulador mejorado.
2. **Fase 2 — Educación**: glosario, rutas de aprendizaje, quizzes,
   metodología, comparador y exportación.
3. **Fase 3 — Plataforma**: CI, tests de componentes/E2E, code splitting, PWA,
   SEO avanzado y accesibilidad automatizada.

## Decisiones activas

- Mantener el estado de filtros/selectores en la URL (compartibilidad).
- No introducir dependencias nuevas sin justificación.
- Preservar `null`; nunca convertir ausencias a 0.
- Cada reporte nuevo requiere SPEC + DESIGN en `docs/reportes/<nombre>/`.
- Fase 0 no toca los scripts `scripts/git_*.py` (siguen modificados sin
  commitear).

## Preguntas abiertas

- ¿Dominio canónico para URLs absolutas de OG/canonical?
- ¿Integrar BCCR (IPC) para poder adquisitivo? (hoy degrada sin datos).
- ¿Estrategia de code splitting: lazy routes, manualChunks o ambas?

## Aprendizajes

- La API de SUPEN es lenta (portafolio 19–40 s) y algunos endpoints ignoran
  `Entidad`; el filtrado real ocurre en cliente.
- `/portafolioisin` está congelado desde 2026-01-31.
- Los shapes reales difieren de SPEC; la fuente verificada es
  `docs/docs/api-notes.md`.
- Recharts 3 + React 19 funcionan bien; el bundle es el principal riesgo de
  rendimiento.