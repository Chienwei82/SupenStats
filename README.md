# SUPEN Stats

Dashboard de visualización de datos financieros y de pensiones de Costa Rica, consumiendo la API pública de la Superintendencia de Pensiones (SUPEN).

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Recharts](https://img.shields.io/badge/Recharts-2-FF6384)

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

Editar `src/constants/suppen.ts`:

```typescript
export const DATE_RANGE_DEFAULT = {
  FechaInicio: '2020-01-01',  // Fecha de inicio
  FechaFinal: new Date().toISOString().split('T')[0],  // Fecha actual
}
```

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
| `GET /api/portafolio` | Composición del portafolio | `Entidad`, `Fondo` |
| `GET /api/portafolioisin` | Portafolio por código ISIN | `Entidad`, `Fondo` |
| `GET /api/afiliado` | Datos de afiliados | `Entidad`, `Fondo` |
| `GET /api/beneficio` | Datos de pensionados | `Entidad`, `Fondo` |
| `GET /api/cuenta` | Datos de cuentas | `Entidad`, `Fondo` |
| `GET /api/lt` | Libre transferencia | `Entidad`, `FechaInicio`, `FechaFinal` |

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
│   ├── types/                 # Definiciones de tipos
│   │   └── supen.ts
│   ├── utils/                 # Funciones utilitarias
│   │   └── dataTransformers.ts
│   ├── hooks/                 # Custom hooks de React
│   │   └── useSupenData.ts
│   ├── constants/             # Constantes y configuración
│   │   └── supen.ts
│   ├── components/
│   │   ├── layout/            # Componentes de layout
│   │   ├── charts/            # Componentes de gráficos
│   │   └── ui/                # Componentes de interfaz
│   ├── App.tsx                # Componente raíz
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

- **Header**: Cabecera con gradiente azul y título
- **KpiCards**: 4 tarjetas con indicadores clave (Rendimiento Promedio, OPC más Rentable, Total Afiliados, Comisión Promedio)

### Charts

- **RendimientoChart**: Gráfico de líneas con múltiples series (una por OPC)
- **ComisionesChart**: Gráfico de barras horizontales ordenado de menor a mayor
- **PortafolioChart**: Gráfico de donut con distribución por tipo de instrumento
- **AfiliadosChart**: Gráfico de área con evolución temporal
- **ActivosChart**: Gráfico de barras agrupadas por operadora

### UI

- **LoadingSkeleton**: Skeleton animado durante la carga
- **ErrorMessage**: Mensaje de error con botón de reintentar

## Hooks Personalizados

### useSupenData

Hook genérico para fetching de datos con estados de carga y error:

```typescript
const { data, loading, error, refetch } = useSupenData(fetchFn)
```

- **data**: Array de datos obtenidos
- **loading**: Booleano indicando si está cargando
- **error**: Mensaje de error o null
- **refetch**: Función para reintentar la carga

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
2. Importar hooks y servicios de API
3. Agregar en `App.tsx` dentro del grid

### Agregar Nuevo Endpoint

1. Definir interfaz en `src/types/suppen.ts`
2. Agregar función fetch en `src/api/apiService.ts`
3. Crear hook o usar `useSupenData` existente

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
