# DESIGN — Reporte: Serie histórica de traslados entre operadoras

Estado: **borrador aprobado**. Acompaña a `SPEC.md`. Rama:
`feature/traslados-entre-operadoras`.

## 1. Arquitectura general (reutilización del patrón existente)

SPA Vite + React 19 + TanStack Router (file-based) + TanStack Query + Recharts
+ Tailwind 4 + zod. **Sin dependencias nuevas.** Chart lib: Recharts (ya está
en uso, no se introduce otra).

```
routes/traslados.tsx                       # createFileRoute (custom: dos vistas + selectores URL)
  └─ useReportQuery(['afiliados-traslados', …]) → fetchAfiliados
  └─ useReportQuery(['lt-matriz',          …]) → fetchLibreTransferenciaMatriz (NUEVO)
       └─ helpers puros en utils/traslados.ts (NUEVO)
            ├── construirSerieAfiliadosPorOpc(raw) → AfiliadoMensual[]
            ├── calcularVariacionNeta(serie, metrica) → VariacionPunto[]
            ├── construirBalanceTraslados(rawLT) → TrasladoBalance[]
            └── agregarFlujosPorOrigenDestino(rawLT) → TrasladoFlujo[]
       └─ charts:
            ├── VariacionNetaChart.tsx    (NUEVO, LineChart)
            ├── BalanceTrasladosChart.tsx (NUEVO, BarChart agrupado)
            └── TopFlujosTable.tsx        (NUEVO, tabla con sort)
```

### Ruta nueva
- `/traslados` — el reporte.

Se agrega a `TABS` en `src/components/layout/ReportTabs.tsx` y a
`WelcomeScreen` con su endpoint listado.

## 2. Modelo de datos y fetching

### 2.1 Datos de entrada (sin nuevos endpoints)
- **Vista A:** `fetchAfiliados(entidad?, fondo?, range?, signal?)` ya existe en
  `apiService.ts:135` y devuelve `Afiliado[]` (`CantidadAfiliados`,
  `FechaCorte`, `Entidad`, `Fondo`).
  - **Problema:** `transformAfiliados` actual hace `item.afiliados ?? 0`, lo
    que convierte nulos históricos (2010-2014 aprox, según `api-notes.md`) en
    ceros y arruina el delta. Necesitamos un transformador nuevo que preserve
    null: `transformAfiliadosMensual(raw): AfiliadoMensual[]` con
    `CantidadAfiliados: number | null`. Regla: si **todos** los registros de
    un `(entidad, fecha, fondo)` son null → `null`; si solo alguno es null, se
    suman los no-null. Nunca `?? 0`.
  - Esto no rompe el reporte de Afiliados existente, que sigue usando
    `transformAfiliados` (no se mutan transformers existentes; convención del
    proyecto).
- **Vista B:** `fetchLibreTransferencia(fondo?, range?, signal?)` ya existe y
  devuelve `LibreTransferencia[]` con
  `Entidad = "{ORIG} -> {DEST}"`, `CantidadTransferencias`, `MontoTransferido`,
  `FechaCorte`. **Pero la matriz cruda se pierde** al aplanar (la diagonal
  origen→origen no se conserva), así que para B1 necesitamos un fetcher nuevo
  que devuelva `RawLibreTransferencia[]` (la fila con las 8 columnas
  `{DEST}_C`/`{DEST}_M`).

### 2.2 Capa de derivación (helpers puros en `src/utils/traslados.ts`)

```ts
// Entrada para vista A: una fila por (entidad, mes) con total afiliados o null.
interface AfiliadoMensual {
  Entidad: string
  Fondo: string
  FechaCorte: string         // 'YYYY-MM-DD' (fin de mes, según API)
  CantidadAfiliados: number | null
}

// Salida: variación entre periodos consecutivos. null donde no se puede calcular.
interface VariacionPunto {
  fecha: string              // etiqueta corta ('ago 2025')
  [entidad: string]: string | number | null
}

// Salida para vista B1: balance neto por OPC y mes.
interface TrasladoBalance {
  fecha: string
  Entidad: string
  Ingresos: number
  Salidas: number
  Neto: number               // Ingresos - Salidas
}

// Salida para vista B2: flujos agregados origen→destino en el rango.
interface TrasladoFlujo {
  Origen: string
  Destino: string
  Cantidad: number
  Monto: number
}
```

Funciones puras (todas con tests Vitest en
`src/utils/__tests__/traslados.test.ts`):
- `construirSerieAfiliadosPorOpc(rawAfiliados): AfiliadoMensual[]` — agrupa
  por `(entidad, fecha, fondo)`, conserva null cuando aplica.
- `calcularVariacionNeta(serie, metrica: 'abs' | 'pct'): VariacionPunto[]` —
  une series por fecha, calcula delta entre t y t−1 solo cuando ambos son
  no-null.
- `construirBalanceTraslados(rawLT: RawLibreTransferencia[]): TrasladoBalance[]`
  — para cada `(origen, fecha)`: ingresos = suma de celdas `{DEST}_C` donde
  DEST ≠ origen; salidas = suma de la misma fila excluyendo la diagonal.
- `agregarFlujosPorOrigenDestino(rawLT): TrasladoFlujo[]` — agrupa por
  `(ORIG, DEST)` y suma cantidad/monto en el rango, excluye flujos con
  cantidad 0 (no son traslados reales).

### 2.3 Detalle no obvio de `/lt`

El shape crudo (visto en `api-notes.md`) tiene una sola fila por
`(origen, fecha)` con columnas `{DEST}_C` y `{DEST}_M` para cada destino. Para
calcular "salidas" de un origen basta sumar la fila excluyendo la diagonal.
Para "ingresos" hay que sumar la columna `{ORIG}_C` recorriendo todas las
filas. Como `transformLibreTransferencia` actual aplana la matriz y pierde la
diagonal, para B1 necesitamos el shape crudo.

Plan: introducir un fetcher paralelo que devuelva la matriz cruda sin pasar
por `transformLibreTransferencia`:

```ts
// apiService.ts (NUEVO)
export async function fetchLibreTransferenciaMatriz(
  fondo?: FondoTipo,
  range?: DateRange,
  signal?: AbortSignal,
): Promise<RawLibreTransferencia[]>
```

Es una función de ~10 líneas (mismo `fetchJson` + `assertArray`, sin
transformación). Query key: `['lt-matriz', fondo, desde, hasta]`. **El reporte
de "Transferencias" existente sigue usando `fetchLibreTransferencia` y el
transformador actual; nada cambia allá.**

### 2.4 Caching

React Query con los defaults globales (`staleTime` 10 min, `gcTime` 30 min,
`placeholderData: prev => prev` en `main.tsx`). Query keys:
- `['afiliados-traslados', fondo, desde, hasta]`
- `['lt-matriz', fondo, desde, hasta]`

Mismo criterio del proyecto: keys nuevas (no se reutiliza `['afiliados']` ni
`['lt']`) para no corromper caches con shapes/transformadores distintos.

## 3. Componentes UI

### 3.1 Página `/traslados` (ruta custom, no `createReportRoute`)

Justificación: el reporte tiene dos vistas con selectores adicionales
(`vista`, `metrica`) que no encajan limpio en la factory. Se sigue el patrón
del simulador: `createReportRoute` con un `render` que recibe ambos datasets y
los selectores URL se controlan con `useUrlParam`.

Estructura:
- `FilterBar` (fondo + rango de fechas).
- Toggle de vista (Neto / Traslados) con `useUrlParam('vista', …)`.
- Cuando vista = `neto`: toggle secundario de métrica (abs / pct) con
  `useUrlParam('metrica', …)`.
- Cuando vista = `traslados`: KPI cards + dos subsecciones (B1: balance, B2:
  top flujos).
- `ChartCard` envolviendo cada bloque + `ChartNote` para las notas
  metodológicas (R7).
- `ReportView` para estados de carga y error (patrón estándar).

### 3.2 `VariacionNetaChart.tsx`
- Recharts `<LineChart>`, una `<Line>` por OPC con `stroke={entityColor(opc)}`
  y `dot={false}`.
- **Crítico:** `connectNulls={false}` para no unir huecos silenciosamente. El
  `AfiliadosChart` existente usa `connectNulls`, lo cual sería incorrecto
  aquí.
- Eje Y: ticks formateados con `formatNumber`. Eje X: `formatDateShort`.
- Tooltip custom: muestra la fecha y, por cada serie, el valor o
  "no disponible" cuando es null.
- Tabla complementaria (R3.5) debajo del chart, con `sort` JS estándar por
  columna (sin librería de tablas).

### 3.3 `BalanceTrasladosChart.tsx`
- Recharts `<BarChart>` con un `<Bar>` por OPC. Colores: `entityColor(opc)`.
- Misma regla de nulos: si una OPC no tiene fila en un mes, su barra
  simplemente no aparece en ese mes (Recharts lo hace nativo cuando el punto
  es undefined).
- Tooltip muestra "Ingresos / Salidas / Neto".
- KPI cards encima: tres tarjetas con `formatNumber`.

### 3.4 `TopFlujosTable.tsx`
- Tabla HTML con `<thead>`/`<tbody>`. Click en `<th>` ordena por columna
  (asc/desc). N por defecto 15, configurable con un `<select>` pequeño
  ("Top 10/15/25").
- Columnas: Origen, Destino, Cantidad (formateada), Monto
  (`formatCurrencyMillions`).
- Sin librería nueva; las tablas ordenables se hacen con `useState` y
  `Array.sort`.

## 4. Errores y datos faltantes
- **Red/API:** `ReportView` (skeleton, overlay, `ErrorMessage` con retry) sin
  cambios.
- **Faltantes:** regla transversal — `null` nunca se convierte en 0 ni se
  interpola. La UI lo comunica explícitamente: hueco visible en la línea
  (gracias a `connectNulls={false}`), "—" en la tabla.
- **Caso borde:** si la API devuelve una serie con solo 1 punto para una OPC,
  no se calcula ningún delta. La línea queda vacía con la nota "se requiere
  al menos 2 periodos con dato para calcular variación".

## 5. Plan de implementación
1. Crear rama `feature/traslados-entre-operadoras` desde `main` actualizado.
2. Tipos en `src/types/suppen.ts`.
3. `transformAfiliadosMensual(raw)` en `dataTransformers.ts` (no muta el
   existente).
4. `fetchLibreTransferenciaMatriz(...)` en `apiService.ts`.
5. Helpers puros en `src/utils/traslados.ts` con tests Vitest.
6. Componentes: `VariacionNetaChart`, `BalanceTrasladosChart`,
   `TopFlujosTable`.
7. Ruta `src/routes/traslados.tsx` + entrada en `TABS` y `WelcomeScreen`.
8. Notas en `src/constants/chartNotes.ts` con `noteId = 'traslados'`.
9. Verificación: `npm run lint && npm run typecheck && npm test`.

## 6. Diferencias respecto al patrón estándar (conscientes)
- **Ruta custom en vez de `createReportRoute`:** el reporte combina dos
  endpoints distintos, dos vistas y dos selectores URL adicionales. El
  simulador y la pirámide ya establecieron este precedente.
- **Fetcher paralelo para `/lt`:** la matriz cruda es necesaria para calcular
  ingresos por OPC (recorrer columna) y salidas (suma de fila). El
  transformador actual pierde esa estructura al aplanar. Se añade un fetcher
  pequeño; el reporte existente no cambia.
- **Transformador paralelo para `/afiliado`:** `transformAfiliados` colapsa
  null → 0 (correcto para el reporte de Afiliados que solo quiere el total),
  pero destructivo para deltas. Se añade `transformAfiliadosMensual` que
  preserva null. Sigue la convención del proyecto de no mutar transformers en
  uso.
- **Sin `connectNulls`:** opuesto al `AfiliadosChart` existente; aquí los
  huecos son información.
