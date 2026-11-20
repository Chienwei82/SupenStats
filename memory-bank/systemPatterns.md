# System Patterns

## Arquitectura

SPA React + TypeScript con TanStack Router (file-based) y TanStack Query.

```text
src/routes/<reporte>.tsx  →  src/api/apiService.ts  →  src/utils/dataTransformers.ts
        ↓                          ↓
  createReportRoute<T>       fetch + timeout 90s + assertArray
        ↓
  useReportQuery (React Query)
        ↓
  components/charts/*.tsx (Recharts) + ChartCard + ChartNote
```

## Factory de rutas

`createReportRoute<T>` encapsula:

- validación de search params (`validateReportSearch` + zod),
- resolución de defaults (`resolveFilters`),
- filtros draft/applied (`useUrlFilters`),
- query de React Query,
- `FilterBar` + `ShareButton` + `ReportView`.

## Filtros y estado en URL

- `reportSearchSchema` (zod) es la única fuente de validación.
- `resolveFilters` aplica defaults y sanea fechas (mínimo 2010-01-01; rango
  invertido → defaults).
- `useUrlFilters`: `draft` en memoria; `consult()` escribe search params;
  `reset()` limpia fondo/fechas y conserva selectores propios.
- `useUrlParam`: selectores simples (periodicidad, corte, métrica, vista) en la
  URL.

## Integridad de datos

- Los transformers preservan `null`; la UI muestra "no disponible" y nunca 0
  inventado.
- Las agregaciones excluyen posiciones sin dato.
- Las métricas derivadas se etiquetan explícitamente (ej. variación neta vs.
  traslados reales).
- Los shapes crudos verificados viven en `docs/docs/api-notes.md`.

## UI

- `ChartCard`: contenedor accesible (`role="group"`, `aria-label`) para todos
  los gráficos.
- `ChartNote`: acordeón educativo con referencias.
- `FilterBar`: fondo/fechas + **Consultar** + **Restablecer**.
- `ShareButton`: copia la URL actual.
- `ReportView`: skeleton / overlay / error / retry.
- `ErrorBoundary`: aisla errores por gráfico.

## Tema

- Clase `.dark` en `<html>`, variantes `dark:` de Tailwind.
- Script inline en `index.html` evita FOUC.
- Persistencia en `localStorage` (`supen-theme`).

## Caching y carga

- React Query: `staleTime` 10 min, `gcTime` 30 min,
  `placeholderData: prev => prev`, `retry: 1`.
- `enabled` para vistas que alternan endpoints (ej. `/traslados`).
- `defaultPreload: 'intent'` en el router.
- Timeout de 90 s con `TimeoutError` diferenciado.

## Testing

- Vitest para lógica pura: transformers, cálculos de reportes, filtros,
  apiService.
- No hay tests de componentes ni E2E (pendiente).

## Convenciones

- Conventional Commits.
- Ramas `feat|fix|chore|refactor|hotfix|docs/<nombre>`.
- SPEC + DESIGN por reporte en `docs/reportes/<nombre>/`.
- Verificación: `npm run verify`.
- Memory Bank en `memory-bank/` con instrucciones en
  `.clinerules/memory-bank.md`.