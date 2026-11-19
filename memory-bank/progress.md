# Progress

## Qué funciona

- 17 reportes con datos reales de SUPEN.
- Filtros por fondo/fechas con estado en URL y botón Restablecer.
- Selectores de vista en URL (periodicidad, corte, métrica, OPC, dataset).
- Gráficos con tooltip, leyenda clicable y notas educativas.
- Simulador de pensión con rentabilidad histórica y poder adquisitivo (degrada
  sin BCCR).
- Tema claro/oscuro, responsive, accesibilidad (ARIA, foco, reduced motion).
- 110 tests unitarios; lint sin errores; typecheck y build OK.
- SEO básico y OG image.
- Botón Copiar enlace.
- Memory Bank inicializado.

## Qué falta

- **Fase 1**: navegación agrupada + buscador, nueva Home, brush/cross-filter,
  comparador, tabla alternativa, simulador mejorado.
- **Fase 2**: glosario, rutas de aprendizaje, quizzes, metodología, export,
  insights automáticos.
- **Fase 3**: CI, tests de componentes/E2E, code splitting, PWA, SEO avanzado.
- Integración BCCR (IPC) para poder adquisitivo.
- Resolver los 5 warnings de oxlint.
- Commitear o descartar los cambios en `scripts/git_*.py`.

## Estado

- Fase 0 completada en `chore/fase-0-quick-wins` y publicada en origin.
- Commit: `9e8ad1a`.
- Verificación: `npm run verify` ✓, `npm run build` ✓.

## Issues conocidos

- Bundle > 500 kB (advertencia de Vite).
- Sin CI ni monitoreo de errores.
- API de SUPEN lenta; la UX depende de caching y feedback de carga.
- `og:image` usa ruta relativa; conviene URL absoluta al conocer el dominio final.

## Evolución de decisiones

- `App.tsx` + `useSupenData` → rutas file-based + `useReportQuery` (React Query).
- Filtros en memoria → estado en URL (compartibilidad/back).
- `?? 0` en agregaciones → preservación de `null` y "no disponible".
- Gráficos con markup duplicado → `ChartCard` unificado.
- Documentación desactualizada → README/SPEC corregidos + CONTRIBUTING.
- Sin Memory Bank → Memory Bank inicializado.