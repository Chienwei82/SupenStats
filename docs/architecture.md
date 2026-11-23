# Arquitectura del sistema

## Visión general

SUPEN Stats es una SPA (Single Page Application) construida con React 19, TypeScript y TanStack Router. Consume la API pública de la Superintendencia de Pensiones de Costa Rica (SUPEN) y presenta los datos a través de gráficos interactivos, tablas y herramientas educativas.

## Flujo de datos

```
┌─────────────────────────────────────────────────────────────┐
│  API SUPEN (webapps.supen.fi.cr)                            │
│  └─ Datos públicos en JSON, campos en minúscula con acentos │
└─────────────────────────────────────────────────────────────┘
                        │ proxy Vite /estadisticas (dev)
                        │ rewrite en Vercel (prod)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  src/api/apiService.ts                                      │
│  └─ Fetcher con assertArray, timeout 90s, validación array  │
└─────────────────────────────────────────────────────────────┘
                        │ respuesta cruda (raw types)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  src/utils/dataTransformers.ts                              │
│  └─ raw → tipos de dominio (PascalCase), preserva null      │
│     Nunca convierte null en 0. Un valor ausente es "N/D".   │
└─────────────────────────────────────────────────────────────┘
                        │ datos de dominio tipados
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  src/hooks/useReportQuery.ts                                │
│  └─ React Query: data, loading, error, refetch, caché       │
│     Lazy loading por pestaña (solo consulta cuando está activa)│
└─────────────────────────────────────────────────────────────┘
                        │ datos listos para UI
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  src/components/charts/*.tsx  (Recharts)                    │
│  src/components/ui/ChartCard.tsx                            │
│  src/components/ui/ReportView.tsx                           │
│  └─ Gráficos, KPIs, tablas, estados de carga/error           │
└─────────────────────────────────────────────────────────────┘
```

## Principios de diseño

### 1. Lazy loading por pestaña

Cada reporte solo descarga sus datos cuando su pestaña está activa. La pantalla de bienvenida (tab *Inicio*) no dispara ninguna petición, por lo que el arranque es instantáneo.

```typescript
useReportQuery(key, fetchFn, { enabled: isActiveTab })
```

### 2. Capa de transformación separada

La API devuelve campos en minúscula y con acentos (`beneficiocolones`, `codigoFondo`). Los transformadores los convierten a tipos de dominio en PascalCase. **Regla de oro: nunca convertir `null` en `0`.** Un valor ausente sobrevive hasta la UI como "no disponible".

### 3. Estado compartible en la URL

Los filtros (periodicidad, corte, métrica, vista) se escriben en los search params de la URL mediante `useUrlParam` y `useUrlFilters`. Esto permite:
- Compartir enlaces a vistas específicas
- Navegación hacia atrás/adelante del navegador
- Recargar la página sin perder el estado

### 4. Accesibilidad WCAG

- Enlace "Saltar al contenido" al inicio de cada página
- Navegación completa por teclado
- Foco visible en elementos interactivos
- `prefers-reduced-motion` respetado en animaciones
- `aria-live="polite"` en notificaciones de estado
- `role="group"` en contenedores de gráficos

### 5. PWA (Progressive Web App)

- Service worker cachea el app shell para uso offline
- Instalable como aplicación en móviles y escritorio
- Manifiesto web con iconos y colores de marca

## Gestión de errores

| Escenario | Comportamiento |
|-----------|---------------|
| Error de red / API | `ReportView` muestra `ErrorMessage` con botón de reintento |
| Error con datos previos | Se muestran los datos "stale" con el error encima |
| Carga inicial sin datos | Se muestra esqueleto (`ChartSkeleton`) |
| Refetch con datos previos | Se muestra `LoadingOverlay` sobre los datos existentes |

## Endpoints principales de SUPEN consumidos

- `rendimiento` — rentabilidad de fondos
- `comisiones` — comisiones cobradas por operadoras
- `activos` — activos netos por fondo
- `cuentas` — desglose contable
- `afiliados` — afiliados por operadora
- `aportantes` — aportantes activos
- `beneficios` — pensionados y beneficios
- `demografia` — distribución por sexo y edad
- `piramide` — pirámide poblacional
- `transferencias` — transferencias entre fondos
- `traslados` — flujos y balance entre operadoras
- `isin` — instrumentos por código ISIN
- `portafolio` — distribución de inversiones

