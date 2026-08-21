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
        │  (proxy Vite '/estadisticas' en dev)
        ▼
src/api/apiService.ts          Capa de acceso; construye query params y llama fetch
        │  respuesta cruda (lowercase / con tildes)
        ▼
src/utils/dataTransformers.ts  Transforma raw → tipos de dominio (PascalCase)
        │
        ▼
src/hooks/useSupenData.ts      Hook genérico: data, loading, error, refetch
        │
        ▼
src/components/charts/*.tsx    Componentes de Recharts (líneas, barras, donut)
```

### Principios de diseño

- **Lazy loading por pestaña**: cada reporte solo descarga sus datos cuando su
  pestaña está activa (`useSupenData(fetchFn, enabled)`). La pantalla de
  bienvenida (tab *Inicio*) no dispara ninguna petición, por lo que el arranque
  es instantáneo.
- **Capa de transformación separada**: la API devuelve campos en minúscula y
  con acentos (`beneficiocolones`, `codigofondo`) y datos desglosados por
  (sexo, edad, tipo). Los transformers agregan y normalizan antes de llegar a
  los gráficos. Los shapes verificados se documentan en `docs/docs/api-notes.md`.
- **Filtros por reporte**: cada pestaña mantiene su propio estado de filtros
  (fondo, rango de fechas, entidad). Los cambios en el `FilterBar` regeneran el
  `fetchFn` (via `useCallback`), lo que dispara un refetch automático.
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
├── types/suppen.ts              # Interfaces de dominio y Raw de la API
├── utils/dataTransformers.ts    # parseDate/formatters y transformers
├── hooks/useSupenData.ts        # Hook de fetching con enabled / lazy
├── constants/suppen.ts          # Colores OPC, rangos por defecto, mapas
├── components/
│   ├── layout/                  # Header, ReportTabs, WelcomeScreen
│   ├── charts/                  # 11 gráficos (Recharts)
│   └── ui/                      # FilterBar, skeletons, errores, boundary
├── App.tsx                      # Orquesta pestañas + hooks + vistas
└── main.tsx                     # Punto de entrada
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

El dashboard estará disponible en `http://localhost:5173`

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
calculado dinámicamente en `src/constants/suppen.ts`:

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

Editar `src/constants/suppen.ts`:

```typescript
export const OPC_COLORS: Record<string, string> = {
  'POPULAR PENSIONES': '#3b82f6',
  'BCR-PENSION': '#10b981',
  'BN-VITAL': '#f59e0b',
  'CCSS-OPC': '#ef4444',
  'VIDA PLENA OPC': '#8b5cf6',
  'BAC SJ PENSIONES': '#ec4899',
}
```

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
├── public/                    # Archivos estáticos
├── src/
│   ├── api/                   # Capa de acceso a datos
│   │   └── apiService.ts
│   ├── types/                 # Tipos de dominio + Raw de la API
│   │   └── supen.ts
│   ├── utils/                 # Transformers y formateadores
│   │   └── dataTransformers.ts
│   ├── hooks/                 # Custom hooks de React
│   │   └── useSupenData.ts
│   ├── constants/             # Constantes y configuración
│   │   └── supen.ts
│   ├── components/
│   │   ├── layout/            # Header, ReportTabs, WelcomeScreen
│   │   ├── charts/            # 11 gráficos de Recharts
│   │   └── ui/                # FilterBar, skeletons, errores
│   ├── App.tsx                # Orquestador: pestañas + hooks + vistas
│   └── main.tsx               # Punto de entrada
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── SPEC.md                    # Especificaciones técnicas
└── README.md                  # Este archivo
```

## Componentes

### Layout

- **Header**: Cabecera con gradiente azul, título y enlace al código fuente en GitHub
- **ReportTabs**: Navegación horizontal entre los 12 reportes (Inicio + 11 pestañas)
- **WelcomeScreen**: Pantalla de bienvenida con la lista de APIs de datos usadas

### Charts

- **RendimientoChart**: Gráfico de líneas con múltiples series (una por OPC)
- **ComisionesChart**: Gráfico de barras horizontales ordenado de menor a mayor
- **PortafolioChart**: Gráfico de donut con distribución por tipo de instrumento
- **AfiliadosChart**: Gráfico de área con evolución temporal
- **ActivosChart**: Gráfico de barras agrupadas por operadora
- **BeneficiosChart**: Pensionados por OPC
- **CuentasChart**: Activo neto del fondo por OPC
- **TransferenciasChart**: Libre transferencia saliente por OPC
- **AportantesChart**: Afiliados vs Aportantes por OPC
- **DemografiaChart**: Distribución por rango de edad y sexo
- **PortafolioISINChart**: Portafolio por instrumento (código ISIN)

### UI

- **FilterBar**: Filtros por fondo, rango de fechas y entidad (según el reporte)
- **LoadingSkeleton / LoadingOverlay**: Estados de carga
- **ErrorMessage**: Mensaje de error con botón de reintentar
- **ErrorBoundary**: Aislamiento de errores por gráfico

## Hooks Personalizados

### useSupenData

Hook genérico para fetching de datos con estados de carga y error:

```typescript
const { data, loading, error, refetch } = useSupenData(fetchFn, enabled)
```

- **data**: Array de datos obtenidos
- **loading**: Booleano indicando si está cargando
- **error**: Mensaje de error o null
- **refetch**: Función para reintentar la carga
- **enabled**: (opcional) si es `false`, no ejecuta el fetch. Se usa para la
  carga perezosa por pestaña.

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
npm run dev      # Servidor de desarrollo con hot reload
npm run build    # Build para producción
npm run preview  # Vista previa del build
npm run lint     # Verificación de código
```

### Agregar Nuevo Gráfico

1. Crear componente en `src/components/charts/`
2. Agregar un id y una etiqueta en `TABS` en `src/components/layout/ReportTabs.tsx`
3. En `App.tsx`: crear el estado de filtros, el `fetchFn` (con `useCallback`) y
   el hook `useSupenData(fetchFn, activeTab === 'miReporte')`
4. Crear la función `renderMiReporte()` con su `FilterBar` y registrarla en el
   mapa `views`

### Agregar Nuevo Endpoint

1. Definir la interfaz de dominio **y** el tipo `Raw*` en `src/types/suppen.ts`
   (verificar la forma real con la API antes)
2. Agregar función fetch en `src/api/apiService.ts`
3. Agregar la transformación en `src/utils/dataTransformers.ts`
4. Conectarla con `useSupenData` en `App.tsx` bajo su pestaña

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

## Créditos

- Datos: [Superintendencia de Pensiones de Costa Rica (SUPEN)](https://www.supen.fi.cr)
- Gráficos: [Recharts](https://recharts.org)
- Estilos: [Tailwind CSS](https://tailwindcss.com)
- Framework: [React](https://react.dev)
- Build: [Vite](https://vitejs.dev)
