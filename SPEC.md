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
| Lenguaje | TypeScript | 5.x |
| Gráficos | Recharts | 2.x |
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

### Comision

```typescript
interface Comision {
  Entidad: string          // Nombre de la OPC
  Fondo: string            // Tipo de fondo (ROP, FCL, etc.)
  FechaCorte: string       // Fecha de corte YYYY-MM-DD
  ComisionAdministracion: number  // Comisión por administración (%)
  ComisionReserva: number  // Comisión de reserva (%)
  ComisionTotal: number    // Comisión total (%)
}
```

### Rendimiento

```typescript
interface Rendimiento {
  Entidad: string          // Nombre de la OPC
  Fondo: string            // Tipo de fondo
  FechaCorte: string       // Fecha de corte
  RendimientoNominal: number  // Rendimiento nominal (%)
  RendimientoReal: number  // Rendimiento real (descontando inflación)
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
  Monto: number            // Monto invertido (₡)
  Porcentaje: number       // Porcentaje del portafolio (%)
}
```

### Afiliado

```typescript
interface Afiliado {
  Entidad: string          // Nombre de la OPC
  Fondo: string            // Tipo de fondo
  FechaCorte: string       // Fecha de corte
  CantidadAfiliados: number  // Número de afiliados
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
  CantidadCuentas: number  // Número de cuentas
  SaldoPromedio: number    // Saldo promedio por cuenta (₡)
}
```

### Libre Transferencia

```typescript
interface LibreTransferencia {
  Entidad: string          // Nombre de la OPC
  FechaCorte: string       // Fecha de corte
  CantidadTransferencias: number  // Número de transferencias
  MontoTransferido: number  // Monto transferido (₡)
}
```

## Arquitectura

```
src/
├── api/
│   └── apiService.ts          # Capa de acceso a datos
├── types/
│   └── supen.ts               # Definiciones de tipos
├── utils/
│   └── dataTransformers.ts    # Funciones de transformación
├── hooks/
│   └── useSupenData.ts        # Hook genérico de fetching
├── constants/
│   └── supen.ts               # Constantes y configuración
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Cabecera del dashboard
│   │   └── KpiCards.tsx       # Tarjetas de indicadores clave
│   ├── charts/
│   │   ├── RendimientoChart.tsx    # Gráfico de líneas
│   │   ├── ComisionesChart.tsx     # Gráfico de barras
│   │   ├── PortafolioChart.tsx     # Gráfico de donut
│   │   ├── AfiliadosChart.tsx      # Gráfico de área
│   │   └── ActivosChart.tsx        # Gráfico de barras agrupadas
│   └── ui/
│       ├── LoadingSkeleton.tsx     # Estado de carga
│       └── ErrorMessage.tsx        # Manejo de errores
├── App.tsx                     # Componente raíz
└── main.tsx                    # Punto de entrada
```

## Funcionalidades

### 1. Dashboard Responsive

- Layout de grid 4 columnas en desktop, 2 en tablet, 1 en mobile
- Tarjetas KPI en la parte superior
- Gráficos en grid de 2 columnas

### 2. Tarjetas KPI

- **Rendimiento Promedio**: Promedio nominal de todas las OPCs
- **OPC más Rentable**: Entidad con mayor rendimiento
- **Total Afiliados**: Suma de afiliados del sistema
- **Comisión Promedio**: Promedio de comisiones de administración

### 3. Gráfico de Rendimiento (Líneas)

- Línea por cada OPC
- Tooltip interactivo con fecha y valor
- Leyenda clickeable
- Eje X: fechas, Eje Y: rendimiento %

### 4. Gráfico de Comisiones (Barras Horizontales)

- Ordenado de menor a mayor comisión
- Colores diferenciados por OPC
- Tooltip con valor exacto

### 5. Gráfico de Portafolio (Donut)

- Desglose por tipo de instrumento
- Labels con porcentaje
- Tooltip con monto y porcentaje

### 6. Gráfico de Afiliados (Área)

- Evolución temporal de afiliados por OPC
- Áreas con transparencia
- Formato numérico con separadores

### 7. Gráfico de Activos (Barras Agrupadas)

- Comparación de activos netos por OPC
- Montos en formato de billones (₡B)

### 8. Estados de Carga y Error

- Skeleton animado durante la carga
- Mensaje de error con opción de reintentar
- Manejo de errores de red

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
