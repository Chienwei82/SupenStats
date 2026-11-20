# SUPEN Stats

Dashboard de visualización de datos financieros y de pensiones de Costa Rica, consumiendo la API pública de la Superintendencia de Pensiones (SUPEN).

> **Aviso**: Este es un proyecto recreativo con fines educativos. No es oficial de la Superintendencia de Pensiones de Costa Rica (SUPEN) ni tiene afiliación alguna con entes gubernamentales. Es un proyecto de código abierto creado para practicar desarrollo web y visualización de datos.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Recharts](https://img.shields.io/badge/Recharts-2-FF6384)

## Herramientas de Desarrollo

En este proyecto se usaron los siguientes productos:

- **[OpenCode](https://opencode.ai)** — CLI de agente de código asistido
- **[DeepSeek](https://openrouter.com)** — modelo de lenguaje usado para asistencia de código
- **Big-Pickle** — asistencia adicional en el desarrollo

## Arquitectura

El proyecto es una SPA de React con TypeScript que consume la API pública de
SUPEN a través de un proxy local. El flujo de datos sigue una dirección única:

```
API SUPEN (webapps.supen.fi.cr)
        │  (proxy Vite '/estadisticas' en dev; rewrite en Vercel)
        ▼
src/routes/<reporte>.tsx        Ruta TanStack Router + createReportRoute
        │  fetcher
        ▼
src/api/apiService.ts          Query params + timeout 90s + validación de array
        │  respuesta cruda (lowercase / con tildes)
        ▼
src/utils/dataTransformers.ts  raw → tipos de dominio (PascalCase); preserva null
        │
        ▼
src/hooks/useReportQuery.ts    React Query: data, loading, error, refetch + caché
        │
        ▼
src/components/charts/*.tsx    Componentes de Recharts (líneas, barras, donut)
```

### Principios de diseño

- **Lazy loading por pestaña**: cada reporte solo descarga sus datos cuando su
  pestaña está activa (`useReportQuery(key, fetchFn, { enabled })`). La pantalla
  de bienvenida (tab *Inicio*) no dispara ninguna petición, por lo que el arranque
  es instantáneo.
- **Capa de transformación separada**: la API devuelve campos en minúscula y
  con acentos (`beneficiocolones`, `codigofondo`) y datos desglosados por
  (sexo, edad, tipo). Los transformers agregan y normalizan antes de llegar a
  los gráficos. Los shapes verificados se documentan en `docs/docs/api-notes.md`.
- **Filtros por reporte**: cada ruta mantiene su estado de filtros (fondo, rango
  de fechas) en la URL. `FilterBar` usa un patrón draft/applied: el borrador
  vive en memoria y **Consultar** escribe los search params, lo que cambia la
  query key y dispara el refetch. **Restablecer** vuelve a los defaults del
  reporte y limpia esos search params.
- **Tema claro/oscuro**: la app ofrece un toggle de tema (claro/oscuro) con
  look futurista inspirado en la paleta *Palenight* de Material Theme. La
  elección se guarda en `localStorage` y, si no existe, se usa la preferencia
  del sistema (`prefers-color-scheme`). El tema se aplica con la clase `.dark`
  en `<html>` y variantes `dark:` de Tailwind.
- **Notas educativas**: cada gráfico incluye un acordeón *"¿Cómo leer este
  gráfico?"* que explica en lenguaje sencillo qué significa y cómo interpretar
  el dato, con referencias a SUPEN y otras fuentes, para apoyar la educación
  financiera de la ciudadanía.
- **Accesibilidad (WCAG)**: la UI usa etiquetas asociadas a controles, patrón
  WAI-ARIA tabs con navegación por teclado, `role="alert"`/`role="status"` para
  errores y carga, foco visible (`:focus-visible`) y respeta
  `prefers-reduced-motion`.
- **Predeterminados sensatos**:
  - Fondo por defecto: `ROP`.
  - Rango de fechas por defecto: **últimos 5 años** (dinámico) para reportes
    históricos (`DATE_RANGE_DEFAULT`).
  - `PORTFOLIO_RANGE`: últimos ~3 meses, porque el endpoint de portafolio es
    muy pesado (decenas de MB sin filtro).

### Componentes

```
src/
├── api/apiService.ts            # Fetchers por endpoint + query builder
├── types/supen.ts              # Interfaces de dominio y Raw de la API
├── utils/dataTransformers.ts    # parseDate/formatters y transformers
├── hooks/
│   ├── useReportQuery.ts        # React Query + useUrlFilters + useUrlParam
│   ├── useInflacion.ts          # IPC/BCCR (degrada si no está configurado)
│   └── useTheme.ts              # Tema claro/oscuro (localStorage + sistema)
├── constants/
│   ├── supen.ts                # Colores OPC, rangos por defecto, mapas
│   ├── filters.ts              # Defaults por reporte + validación zod
│   └── chartNotes.ts            # Notas educativas y referencias por gráfico
├── routes/                      # Rutas file-based (una por reporte)
│   ├── __root.tsx               # Layout, Header, ReportTabs, footer
│   ├── index.tsx                # Pantalla de bienvenida
│   └── -shared/reportRoute.tsx  # Factory createReportRoute<T>
├── components/
│   ├── layout/                  # Header, ReportTabs, WelcomeScreen, ThemeToggle
│   ├── charts/                  # Gráficos (Recharts) + tablas
│   ├── Simulador.tsx            # Proyección de pensión
│   ├── Traslados.tsx            # Vistas neto/traslados
│   └── ui/                      # ChartCard, FilterBar, ShareButton, skeletons, errores
└── main.tsx                     # Punto de entrada + QueryClient + Router
```

## Inicio Rápido

### Requisitos

- Node.js 18+
- npm 9+ (o yarn/pnpm)

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd SupenStats

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El dashboard estará disponible en `http://localhost:3000`

### Build para Producción

```bash
npm run build
```

Los archivos estáticos se generan en `dist/`

### Vista Previa de Producción

```bash
npm run preview
```

## Configuración

### Proxy de API

El proxy está configurado en `vite.config.ts` para desarrollo:

```typescript
server: {
  proxy: {
    '/estadisticas': {
      target: 'https://webapps.supen.fi.cr',
      changeOrigin: true,
      secure: false,
    },
  },
},
```

Para producción, configurar un proxy inverso (Nginx, Apache, etc.) o consumir la API directamente.

### Cambiar Período de Datos

El rango por defecto de los reportes históricos son los **últimos 5 años**,
calculado dinámicamente en `src/constants/supen.ts`:

```typescript
export const DATE_RANGE_DEFAULT = {
  FechaInicio: isoDate(5),  // 5 años atrás desde hoy
  FechaFinal: new Date().toISOString().split('T')[0],  // Fecha actual
}
```

Cada pestaña permite además ajustar el rango en su barra de filtros.

### Cambiar Fondo por Defecto

```typescript
export const FONDO_DEFAULT = 'ROP' as const  // O 'FCL', 'VOL', etc.
```

### Personalizar Colores de OPCs

Editar `src/constants/supen.ts`:

```typescript
export const OPC_COLORS: Record<string, string> = {
  'POPULAR PENSIONES': '#3b82f6',
  'BCR-PENSION': '#10b981',
  'BN-VITAL': '#f59e0b',
  'CCSS-OPC': '#ef4444',
  'VIDA PLENA OPC': '#8b5cf6',
  'BAC SJ PENSIONES': '#ec4899',
  // Regímenes básicos (fondo BASI)
  'FONDO IVM-CCSS': '#0ea5e9',
  'MAGISTERIO NAL': '#f97316',
  'PODER JUDICIAL': '#14b8a6',
  'FONDO BOMBEROS': '#e11d48',
  'TRANS. MAGIST.': '#a855f7',
  // Regímenes ocupacionales (fondo OCUP)
  'FONDO FBNCR': '#06b6d4',
  'FONDO FICE': '#84cc16',
  'FONDO FRE-CCSS': '#d946ef',
  'FONDO VEND LOT': '#f43f5e',
}
```

> `OPC_LIST` se mantiene separado de `OPC_COLORS` para que el filtro de libre
> transferencia solo liste operadoras (OPC), sin incluir los regímenes básicos
> u ocupacionales.

### Tema Claro/Oscuro

La app incluye un toggle de tema en el encabezado. La elección se guarda en
`localStorage` (`supen-theme`) y, si no hay elección previa, se usa la
preferencia del sistema operativo (`prefers-color-scheme`). El dark mode usa
una paleta inspirada en *Palenight* de Material Theme.

Para evitar un destello al cargar, `index.html` aplica la clase `dark` antes
del primer render con un script inline. El modo oscuro se activa con la clase
`.dark` en `<html>` y las variantes `dark:` de Tailwind (configuradas con
`@custom-variant dark` en `src/index.css`).

## Uso de la API

### Endpoints Disponibles

| Endpoint | Descripción | Parámetros |
|----------|------------|-----------|
| `GET /api/comision` | Comisiones de administración | `Fondo`, `FechaInicio`, `FechaFinal` |
| `GET /api/rendimiento` | Rendimientos históricos | `Fondo`, `Entidad`, `FechaInicio`, `FechaFinal` |
| `GET /api/portafolio` | Composición del portafolio | `Entidad`, `Fondo`, `FechaInicio`, `FechaFinal` |
| `GET /api/portafolioisin` | Portafolio por código ISIN | `Entidad`, `Fondo` (pesado, usar rangos) |
| `GET /api/afiliado` | Datos de afiliados (sexo, edad, aportantes) | `Entidad`, `Fondo`, `FechaInicio`, `FechaFinal` |
| `GET /api/beneficio` | Datos de pensionados | `Entidad`, `Fondo`, `FechaInicio`, `FechaFinal` |
| `GET /api/cuenta` | Estado contable del fondo | `Entidad`, `Fondo`, `FechaInicio`, `FechaFinal` |
| `GET /api/lt` | Libre transferencia | `Entidad`, `FechaInicio`, `FechaFinal` |

> Nota: los endpoints respetan los filtros de fecha solo cuando se envían
> **ambos** `FechaInicio` y `FechaFinal`. Sin ellos devuelven todo el histórico
> (desde 2010), lo que alarga mucho la respuesta.

### Ejemplos de Uso

```bash
# Obtener comisiones del ROP
curl "https://webapps.supen.fi.cr/estadisticas/api/comision?Fondo=ROP"

# Obtener rendimiento de una OPC específica
curl "https://webapps.supen.fi.cr/estadisticas/api/rendimiento?Entidad=POPULAR%20PENSIONES"

# Obtener portafolio de inversión
curl "https://webapps.supen.fi.cr/estadisticas/api/portafolio?Fondo=ROP"
```

### Uso en Código TypeScript

```typescript
import {
  fetchComisiones,
  fetchRendimiento,
  fetchPortafolio
} from './api/apiService'

// Obtener comisiones del ROP
const comisiones = await fetchComisiones('ROP', {
  FechaInicio: '2023-01-01',
  FechaFinal: '2023-12-31'
})

// Obtener rendimiento de todas las OPCs
const rendimientos = await fetchRendimiento('ROP')

// Obtener portafolio de una OPC específica
const portafolio = await fetchPortafolio('POPULAR PENSIONES', 'ROP')
```

## Estructura del Proyecto

```
SupenStats/
├── public/                    # Archivos estáticos (favicon, iconos, OG image)
├── src/
│   ├── api/                   # Capa de acceso a datos
│   │   └── apiService.ts
│   ├── types/                 # Tipos de dominio + Raw de la API
│   │   └── supen.ts
│   ├── utils/                 # Transformers, formateadores y cálculos de reportes
│   │   ├── dataTransformers.ts
│   │   └── reportes.ts
│   ├── hooks/                 # React Query, filtros URL, tema, inflación
│   │   ├── useReportQuery.ts
│   │   ├── useTheme.ts
│   │   └── useInflacion.ts
│   ├── constants/             # Colores, rangos, filtros y notas educativas
│   │   ├── supen.ts
│   │   ├── filters.ts
│   │   └── chartNotes.ts
│   ├── routes/                # Rutas file-based (TanStack Router)
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   └── <reporte>.tsx
│   ├── components/
│   │   ├── layout/            # Header, ReportTabs, WelcomeScreen
│   │   ├── charts/            # Gráficos de Recharts y tablas
│   │   └── ui/                # ChartCard, FilterBar, ShareButton, estados
│   └── main.tsx               # Punto de entrada
├── docs/                      # SPEC/DESIGN por reporte + notas de API
├── memory-bank/               # Contexto persistente para Cline
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
├── SPEC.md                    # Especificaciones técnicas
└── README.md                  # Este archivo
```

## Componentes

### Layout

- **Header**: Cabecera con gradiente azul, título y enlace al código fuente en GitHub
- **ReportTabs**: Navegación horizontal entre los reportes (Inicio + pestañas: rendimiento, rendimiento-real, comisiones, comisión-rentabilidad, portafolio, afiliados, activos, beneficios, cuentas, transferencias, aportantes, demografía, simulador, pirámide, instrumentos)
- **WelcomeScreen**: Pantalla de bienvenida con la lista de APIs de datos usadas

### Charts

- **RendimientoChart**: Gráfico de líneas con múltiples series (una por OPC)
- **ComisionesChart**: Evolución de la comisión de administración por OPC (líneas temporales)
- **PortafolioChart**: Gráfico de donut con distribución por tipo de instrumento
- **AfiliadosChart**: Gráfico de área con evolución temporal
- **ActivosChart**: Gráfico de barras agrupadas por operadora
- **BeneficiosChart**: Pensionados por OPC (barras horizontales)
- **CuentasChart**: Activo neto del fondo por OPC (líneas temporales)
- **TransferenciasChart**: Libre transferencia saliente por OPC
- **Traslados** (`src/components/Traslados.tsx`): dos vistas — variación neta de afiliados (estimado derivado) y traslados reales desde /lt (balance neto por OPC + top flujos origen→destino)
- **AportantesChart**: Afiliados vs Aportantes por OPC
- **DemografiaChart**: Distribución por rango de edad y sexo
- **Simulador** (`src/components/Simulador.tsx`): Proyección del saldo al retiro a partir de saldo/aporte/edad del usuario y la rentabilidad histórica promedio de la OPC
- **PiramideChart** (`src/components/charts/PiramideChart.tsx`): Pirámide poblacional de afiliados/pensionados por sexo y rango de edad (barras opuestas)
- **PortafolioISINChart**: Portafolio por instrumento (código ISIN)

### UI

- **ChartCard**: contenedor estándar de gráfico (título + descripción accesible)
- **FilterBar**: Filtros por fondo y rango de fechas, con **Consultar** y
  **Restablecer**
- **ShareButton**: copia la URL actual (con filtros y selectores) al portapapeles
- **LoadingSkeleton / LoadingOverlay**: Estados de carga
- **ErrorMessage**: Mensaje de error con botón de reintentar
- **ErrorBoundary**: Aislamiento de errores por gráfico

## Hooks Personalizados

### useReportQuery

Hook genérico de fetching sobre TanStack Query con estados de carga y error:

```typescript
const { data, loading, error, refetch } = useReportQuery(key, fetchFn, { enabled })
```

- **data**: Array de datos obtenidos (nunca `undefined`; `[]` si no hay datos)
- **loading**: `isFetching` (true en primera carga y en refetch con datos previos)
- **error**: Mensaje de error o null
- **refetch**: Función para reintentar la carga
- **enabled**: (opcional) si es `false`, no ejecuta el fetch. Se usa cuando una
  vista alterna entre endpoints (ej. `/traslados`).

### useUrlFilters / useUrlParam

- `useUrlFilters(defaults)`: patrón draft/applied sobre los search params de la
  URL. Devuelve `{ draft, setDraft, consult, reset }`.
- `useUrlParam(key, isValid, fallback)`: lee y escribe un selector simple
  (periodicidad, corte, métrica, vista) en la URL, con validación.

## Funciones de Transformación

### Formateo de Fechas

```typescript
parseDate('2023-12-31')        // → Date object
formatDate('2023-12-31')       // → "dic 2023"
formatDateShort('2023-12-31')  // → "12/23"
```

### Formateo de Moneda

```typescript
formatCurrency(1500000)        // → "₡1.500.000"
formatCurrencyMillions(1500000) // → "₡1.5M"
formatCurrencyBillions(1500000000) // → "₡1.50B"
```

### Formateo de Porcentajes

```typescript
formatPercent(7.25)  // → "7.25%"
```

### Agrupación y Ordenamiento

```typescript
groupBy(data, 'Entidad')           // Agrupa por campo
getUniqueValues(data, 'Entidad')   // Valores únicos
sortByDateAsc(data, 'FechaCorte')  // Ordena por fecha ascendente
```

## Desarrollo

### Comandos Disponibles

```bash
npm run dev       # Servidor de desarrollo con hot reload (puerto 3000)
npm run build     # Build para producción
npm run preview   # Vista previa del build
npm run lint      # Verificación de código (oxlint)
npm run typecheck # Verificación de tipos (tsc -b --noEmit)
npm test          # Tests unitarios (Vitest)
npm run verify    # lint + typecheck + tests
```

### Agregar Nuevo Gráfico

1. Crear componente en `src/components/charts/` usando `ChartCard` + `ChartNote`.
2. Agregar un id y una etiqueta en `TABS` en `src/components/layout/ReportTabs.tsx`.
3. Crear la ruta en `src/routes/<nombre>.tsx` con `createFileRoute` +
   `createReportRoute<T>` (o una variante local si compone varias queries).
4. Definir los defaults del reporte en `src/constants/filters.ts` si usa fechas.

### Agregar Nuevo Endpoint

1. Definir la interfaz de dominio **y** el tipo `Raw*` en `src/types/supen.ts`
   (verificar la forma real contra la API y documentarla en
   `docs/docs/api-notes.md`).
2. Agregar función fetch en `src/api/apiService.ts` (con `assertArray`).
3. Agregar la transformación en `src/utils/dataTransformers.ts` (preservar
   `null`, nunca convertir ausencias a `0`).
4. Conectarla en la ruta del reporte con `useReportQuery`.

> Para el detalle completo de convenciones, ver `CONTRIBUTING.md`.

## Troubleshooting

### Error CORS

El proxy de Vite debería resolver esto en desarrollo. Para producción, configurar un proxy inverso.

### Datos No Se Muestran

1. Verificar que la API de SUPEN esté accesible
2. Revisar la consola del navegador para errores
3. Verificar los parámetros de filtro (Fondo, Fechas)

### Build Falla

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## Contribuir

Las convenciones de ramas, commits, verificación y creación de reportes están en
[`CONTRIBUTING.md`](CONTRIBUTING.md). El contexto persistente del proyecto para
asistentes de código vive en `memory-bank/`.

## Créditos

- Datos: [Superintendencia de Pensiones de Costa Rica (SUPEN)](https://www.supen.fi.cr)
- Gráficos: [Recharts](https://recharts.org)
- Estilos: [Tailwind CSS](https://tailwindcss.com)
- Framework: [React](https://react.dev)
- Build: [Vite](https://vitejs.dev)
