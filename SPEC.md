# SPEC.md - Especificaciones del Proyecto SUPEN Stats

## Visión General

SUPEN Stats es un dashboard de visualización de datos financieros y de pensiones de Costa Rica, construido para consumir la API pública de la Superintendencia de Pensiones (SUPEN) y presentar reportes ejecutivos e interactivos.

## Objetivo

Generar reportes gráficos que muestren:
- Comparativa de Rendimiento Real (línea de tiempo) entre todas las OPCs para el ROP
- Comparativa de Comisiones de Administración (gráfico de barras)
- Distribución del Portafolio de Inversión por Operadora (gráfico de donut)
- Evolución de Afiliados por Operadora
- Activos Netos por Operadora

## Stack Técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Bundler | Vite | 8.x |
| Framework | React | 19.x |
| Lenguaje | TypeScript | 6.x |
| Gráficos | Recharts | 3.x |
| Estilos | Tailwind CSS | 4.x |
| HTTP | Fetch API nativo | - |

## API de SUPEN

### Base URL

```
https://webapps.supen.fi.cr/estadisticas/api
```

### Documentación Oficial

```
https://webapps.supen.fi.cr/Estadisticas/API/documentacion/index.html
```

### Endpoints Implementados

| Endpoint | Path | Parámetros |
|----------|------|-----------|
| Comisiones | `GET /api/comision` | `Fondo`, `FechaInicio`, `FechaFinal` |
| Rendimiento | `GET /api/rendimiento` | `Fondo`, `Entidad`, `FechaInicio`, `FechaFinal` |
| Portafolio | `GET /api/portafolio` | `Entidad`, `Fondo` |
| PortafolioISIN | `GET /api/portafolioisin` | `Entidad`, `Fondo` |
| Afiliados | `GET /api/afiliado` | `Entidad`, `Fondo` |
| Beneficios | `GET /api/beneficio` | `Entidad`, `Fondo` |
| Cuentas | `GET /api/cuenta` | `Entidad`, `Fondo` |
| Libre Transferencia | `GET /api/lt` | `Entidad`, `FechaInicio`, `FechaFinal` |

### Parámetros de Filtro

- **Fondo**: Tipo de régimen de pensiones (`ROP`, `FCL`, `VOL`, `BASI`, `OCUP`)
- **Entidad**: Nombre de la Operadora de Pensiones Complementarias (OPC)
- **FechaInicio**: Fecha de inicio del rango (formato `YYYY-MM-DD`)
- **FechaFinal**: Fecha final del rango (formato `YYYY-MM-DD`)

### Tipos de Fondos

| Código | Descripción |
|--------|------------|
| ROP | Régimen Obligatorio de Pensiones Complementarias |
| FCL | Fondo de Capitalización Laboral |
| VOL | Régimen Voluntario de Pensiones |
| BASI | Regímenes Básicos |
| OCUP | Regímenes Ocupacionales |

### Operadoras de Pensiones (OPC)

| Entidad | Color en Dashboard |
|---------|-------------------|
| POPULAR PENSIONES | #3b82f6 (azul) |
| BCR-PENSION | #10b981 (verde) |
| BN-VITAL | #f59e0b (ámbar) |
| CCSS-OPC | #ef4444 (rojo) |
| VIDA PLENA OPC | #8b5cf6 (violeta) |
| BAC SJ PENSIONES | #ec4899 (rosa) |

## Estructura de Datos

> Los tipos de dominio normalizan la respuesta cruda de la API (campos en
> minúscula y con tildes) y **preservan `null`** cuando la API no reporta un
> valor. Los shapes crudos verificados están documentados en
> `docs/docs/api-notes.md`.

### Comision

```typescript
interface Comision {
  Entidad: string          // Nombre de la OPC
  Fondo: string            // Tipo de fondo (ROP, FCL, etc.)
  FechaCorte: string       // Fecha de corte YYYY-MM-DD
  ComisionTotal: number | null  // Comisión sobre saldo (%); null = no reportada
}
```

### Rendimiento

```typescript
interface Rendimiento {
  Entidad: string          // Nombre de la OPC
  Fondo: string            // Tipo de fondo
  FechaCorte: string       // Fecha de corte
  RendimientoNominal: number | null  // null = no reportado; no pintar como 0%
  RendimientoReal: number | null     // Real (descontando inflación)
  ValorCuota: number       // Valor de la cuota
}
```

### Portafolio

```typescript
interface Portafolio {
  Entidad: string          // Nombre de la OPC
  Fondo: string            // Tipo de fondo
  FechaCorte: string       // Fecha de corte
  TipoInstrumento: string  // Tipo de instrumento de inversión
  Monto: number | null     // Monto invertido (₡); null = posición no reportada
}
```

### Afiliado

```typescript
interface Afiliado {
  Entidad: string          // Nombre de la OPC
  Fondo: string            // Tipo de fondo
  FechaCorte: string       // Fecha de corte
  CantidadAfiliados: number | null  // null = celda no reportada; no sumar como 0
  MontoAportes: number     // Monto total de aportes (₡)
}
```

### Beneficio

```typescript
interface Beneficio {
  Entidad: string          // Nombre de la OPC
  Fondo: string            // Tipo de fondo
  FechaCorte: string       // Fecha de corte
  CantidadPensionados: number  // Número de pensionados
  MontoBeneficios: number  // Monto total de beneficios (₡)
}
```

### Cuenta

```typescript
interface Cuenta {
  Entidad: string          // Nombre de la OPC
  Fondo: string            // Tipo de fondo
  FechaCorte: string       // Fecha de corte
  CuentaTipo: string       // Categoría contable (ACTIVO, PASIVO, PATRIMONIO, ...)
  MontoColones: number | null  // null = monto no reportado
}
```

### Libre Transferencia

```typescript
interface LibreTransferencia {
  Entidad: string          // OPC origen (normalizada)
  Fondo: string            // Tipo de fondo
  FechaCorte: string       // Fecha de corte
  CantidadTransferencias: number  // Número de transferencias
  MontoTransferido: number  // Monto transferido (₡)
}
```

## Arquitectura

```
src/
├── api/
│   └── apiService.ts          # Fetchers por endpoint + query builder + timeout
├── types/
│   └── supen.ts               # Tipos de dominio + Raw de la API
├── utils/
│   ├── dataTransformers.ts    # parseDate, formatters y transformers
│   └── reportes.ts            # Cálculos puros (rentabilidad, inflación, proyección)
├── hooks/
│   ├── useReportQuery.ts      # React Query + filtros en URL (useUrlFilters/useUrlParam)
│   ├── useInflacion.ts        # IPC/BCCR (degrada si no está configurado)
│   └── useTheme.ts            # Tema claro/oscuro
├── constants/
│   ├── supen.ts               # Colores OPC, rangos por defecto, mapas
│   ├── filters.ts             # Defaults por reporte + validación zod
│   └── chartNotes.ts          # Notas educativas por gráfico
├── routes/
│   ├── __root.tsx             # Layout + Header + ReportTabs + footer
│   ├── index.tsx              # Bienvenida
│   └── -shared/reportRoute.tsx # Factory createReportRoute<T>
├── components/
│   ├── layout/                # Header, ReportTabs, WelcomeScreen, ThemeToggle
│   ├── charts/                # Gráficos Recharts + tablas
│   └── ui/                    # ChartCard, FilterBar, ShareButton, estados
└── main.tsx                   # QueryClient + Router + entrypoint
```

## Funcionalidades

### Navegación

- SPA con **17 reportes** organizados en un menú desplegable accesible
  (WAI-ARIA menu, navegación por teclado, cierre con Escape/click fuera).
- Estado de filtros y selectores en la URL: cada vista es compartible y
  soporta back/forward del navegador.

### Reportes

| Reporte | Contenido |
|---------|-----------|
| Rendimiento / Rend. Real | Rentabilidad nominal y real por OPC, con periodicidad y corte seleccionables |
| Comisiones / Comisión vs Rend. | Evolución de comisiones y dispersión comisión–rentabilidad |
| Portafolio / Instrumentos | Distribución por tipo de instrumento y por ISIN |
| Afiliados / Aportantes | Evolución y comparación de afiliados vs. aportantes |
| Activos / Cuentas | Activos netos y desglose contable por OPC |
| Beneficios | Pensionados por OPC y tipo de beneficio |
| Transferencias / Traslados | Libre transferencia y balance neto entre operadoras |
| Demografía / Pirámide | Distribución por sexo y rango de edad (afiliados y pensionados) |
| Simulador | Proyección del saldo al retiro con rentabilidad histórica y poder adquisitivo |

### Interacción y UX

- Filtros por fondo y rango de fechas con patrón draft/applied y botón
  **Restablecer**.
- Gráficos con tooltip, leyenda clicable y selectores en URL (periodicidad,
  corte, métrica, OPC).
- Botón **Copiar enlace** para compartir la vista exacta.
- Notas educativas colapsables en cada gráfico (`ChartNote`).
- Tema claro/oscuro persistente y respeto por `prefers-reduced-motion`.

### Estados de carga y error

- Skeleton en la primera carga, overlay cuando hay datos previos y
  `ErrorBoundary` por gráfico.
- Timeout de 90 s con mensaje diferenciado para APIs lentas.
- Mensaje de error con opción de reintentar.

## Decisiones de Diseño

### Proxy de API

Se configuró un proxy en Vite para redirigir las llamadas a `/estadisticas` hacia `https://webapps.supen.fi.cr`, eliminando problemas de CORS en desarrollo.

### Manejo de Fechas

La función `parseDate` maneja múltiples formatos:
- `YYYY-MM-DD` (formato ISO)
- `DD/MM/YYYY` (formato local)
- `YYYY/MM/DD`
- Strings con marcador de tiempo `T`

### Agrupación de Datos

Los datos se agrupan por `Entidad` (OPC) para crear series separadas en cada gráfico.

### Colores por Defecto

Cada OPC tiene un color asignado en `constants/supen.ts` para mantener consistencia visual en todos los gráficos.
