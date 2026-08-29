# DESIGN — Rentabilidad real por OPC y Comisiones vs. Rentabilidad

Estado: **borrador para aprobación**. Acompaña a `SPEC.md` en esta misma carpeta.

---

## 1. Arquitectura general (reutilización del patrón existente)

SPA Vite + React 19 + TanStack Router (file-based) + TanStack Query + Recharts +
Tailwind 4. No se introducen dependencias nuevas.

Flujo de un reporte nuevo, idéntico al de `comisiones.tsx`:

```
routes/rendimiento-real.tsx        # createFileRoute + createReportRoute(...)
  └─ fetcher → src/api/apiService.ts   (funciones nuevas)
       └─ useReportQuery               (React Query, cache in-memory)
            └─ render → components/charts/RentabilidadRealChart.tsx
                      components/charts/ComisionVsRentabilidadChart.tsx
```

### Rutas nuevas
- `/rentabilidad-real` — Reporte 1.
- `/comision-rentabilidad` — Reporte 2.

Ambas usan la factory `src/routes/-shared/reportRoute.tsx` (`createReportRoute`),
con defaults nuevos en `src/constants/filters.ts`.

### Fetching (`src/api/apiService.ts`)
Funciones nuevas siguiendo el estilo existente:

```ts
export async function fetchRendimientos(fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<Rendimiento[]>
export async function fetchComisionesSaldo(fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<Comision[]> // o filtrado en el reporte
```

- Mismo `API_BASE = '/estadisticas/api'`, mismo timeout (90 s), `assertArray`,
  proxy Vite en dev / rewrite Vercel en prod. Nada nuevo aquí.
- Nota: `fetchComisiones` ya existe; para el Reporte 2 solo se filtra `tipo === 'SALDO'`
  en cliente (la API no filtra por tipo).

### Tipos y transformadores
`src/types/supen.ts` — tipos nuevos:

```ts
interface Rendimiento {
  entidad: string
  fondo: string
  codigofondo: string
  tipo: 'NOMINAL' | 'REAL'
  periodicidad: string          // 'ANUAL' | '3 AÑOS' | '5 AÑOS' | '10 AÑOS' | 'HISTÓRICA'
  rentabilidad: number | null
  fecha: Date                   // transformada desde ISO como en el resto
}

interface Comision { ... }      // ya existe; verificar que incluya tipo y comisión|null
```

`src/utils/dataTransformers.ts` — `transformRendimientos(raw)`: normaliza `tipo`
(uppercase-trim), mapea fecha, conserva `null` (¡no usar `?? 0`!: null = "no
disponible" y debe sobrevivir hasta la UI).

### Caching
React Query con los defaults ya existentes en `main.tsx` (staleTime 10 min,
gcTime 30 min, `placeholderData: prev => prev`). Query keys:

- `['rendimiento', fondo, desde, hasta]`
- `['comision-saldo', fondo, desde, hasta]`

Para el Reporte 2 el fetcher compone ambas queries: se usa `useQuery` dos veces en
el componente contenedor y el join se hace en memoria (simple, sin capa extra).
Si esto no calza en `createReportRoute`, se acepta una pequeña variante local en la
ruta (factory sigue siendo el camino preferido; decidir en implementación).

---

## 2. Modelo de datos derivado

```ts
// Reporte 1 — una fila por OPC
interface RentabilidadComparada {
  entidad: string
  nominal: number | null   // null => "no disponible"
  real: number | null
  fecha: Date              // corte
  periodicidad: string
}

// Reporte 2 — un punto por OPC (solo pares completos entran al scatter)
interface PuntoComisionRentabilidad {
  entidad: string
  comision: number         // % sobre saldo
  rentabilidad: number     // nominal o real según toggle
}
// + lista aparte: { entidad, motivo: 'sin comisión' | 'sin rentabilidad' }
```

Helpers puros en `src/utils/` con tests Vitest:
- `joinRendimientoNominalReal(rendimientos, periodicidad, corte)` → `RentabilidadComparada[]`
- `joinComisionConRentabilidad(comisiones, rendimientos)` → `{ puntos, excluidos }`
- `regresionLineal(puntos)` → `{ pendiente, intercepto, r }` (~15 líneas, solo si se aprueba R2.5)

---

## 3. Componentes UI

### Reporte 1 — `RentabilidadRealChart`
- Recharts `<BarChart>` con dos series (`nominal`, `real`) por OPC;
  `<XAxis dataKey="entidad">`. Barras `real` con valor `null`: Recharts omite la barra,
  lo cual es correcto **siempre que** la fila siga visible; añadir bajo el gráfico una
  línea "Sin dato real: <OPC listadas>" vía `ChartNote`.
- Selector de periodicidad: grupo de botones/chips arriba del chart (estado en URL
  search param `periodicidad`, validado con `validateSearch`). No es un filtro de
  fecha: es un parámetro más del query key.
- Selector de corte: si hay varios meses en el rango aplicado, dropdown "corte"
  (default = máximo). También en URL.
- Opcional (pendiente aprobación): tabla complementaria debajo con columnas
  OPC | Nominal | Real | Diferencial, celdas "—" cuando null.

### Reporte 2 — `ComisionVsRentabilidadChart`
- Recharts `<ScatterChart>`, X = comisión (%), Y = rentabilidad (%).
- Tooltip custom mostrando `entidad`, comisión y rentabilidad (patrón tooltip Recharts
  estándar; funciona en touch también).
- Toggle nominal/real: chips junto al FilterBar (URL param `tipo=nominal|real`,
  default nominal). Si no hay datos reales para el corte, el chip "real" se muestra
  deshabilitado con explicación.
- Tendencia (si se aprueba R2.5): `<ReferenceLine>` segmento calculado con
  `regresionLineal`; nota con r y n en `ChartNote`.

### Integración con navegación
Añadir las dos rutas a `ReportTabs` y a la pantalla de inicio (`WelcomeScreen`),
igual que los reportes existentes.

---

## 4. Errores y datos faltantes

- Red/API: manejo existente de `ReportView` (skeleton, overlay refetch, ErrorMessage
  con retry). Sin cambios.
- Faltantes: regla transversal — `null` nunca se convierte en 0 ni interpola. Las
  ausencias se comunican en la UI ("no disponible", lista de excluidos, ChartNote).

---

## 5. BCCR / IPC (decisión pendiente, documentada)

Investigación realizada:

- Servicio: `https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx`
  método `ObtenerIndicadoresEconomicos` con params
  `Indicador, FechaInicio, FechaFinal, Nombre, SubNiveles, CorreoElectronico, Token`
  (SOAP/XML o GET-XML; también JSON con `?format=json` en respuestas modernas).
- Autenticación: registro previo en el formulario de suscripción del BCCR
  (https://www.bccr.fi.cr/indicadores-economicos/servicio-web); llega un token por
  correo y tanto el correo registrado como el token viajan en cada request.
- **Bloqueo CORS**: el BCCR rechaza llamadas desde navegador ⇒ requeriría un proxy
  serverless (Vercel Function) y guardar correo+token como secrets de Vercel.
- Código de indicador IPC: la lista oficial completa está en
  https://gee.bccr.fi.cr/Indicadores/Suscripciones/UI/ConsultaIndicadores/ObtenerArchivo
  (al momento de escribir este documento devolvía 503, por lo que **el código exacto
  del nivel general del IPC queda por confirmar** contra ese archivo antes de
  implementar esta variante; no se documenta de memoria).

**Recomendación:** no integrar BCCR en v1. La serie REAL de SUPEN cubre el requisito
con cero dependencias nuevas. La vía BCCR queda como fase 2 opcional si algún día se
necesita calcular rentabilidad real propia (p. ej., periodos sin serie REAL publicada),
y en ese caso: Vercel Function proxy + env vars `BCCR_EMAIL`/`BCCR_TOKEN` + cache
agresivo del IPC mensual (React Query o edge cache; el IPC histórico es inmutable).

---

## 6. Plan de implementación (tras aprobación)

En **rama nueva** (p. ej. `feature/reportes-reales-comisiones`, idealmente vía git
worktree), en este orden:

1. Tipos + transformadores + helpers puros con tests Vitest
   (`joinRendimientoNominalReal`, `joinComisionConRentabilidad`).
2. `apiService.fetchRendimientos` (+ verificación manual contra API real).
3. Ruta + `RentabilidadRealChart` (Reporte 1).
4. Ruta + `ComisionVsRentabilidadChart` (Reporte 2) + regresión si aprobada.
5. Tabs/navegación, notas metodológicas, `oxlint` + `tsc -b --noEmit` + `vitest run`.

Verificación: `npm run lint && npm run typecheck && npm test`.

---

## 7. Notas post code-review

- **Cache fragmentado (decisión consciente):** las claves `['rendimiento-real']` /
  `['comision-rentabilidad']` no comparten cache con `['rendimiento']` / `['comisiones']`
  porque los transformadores difieren (los nuevos preservan periodicidad y nulls).
  Compartir clave corrompería la cache; se acepta el refetch al alternar entre
  reportes que leen el mismo endpoint.
- **Selectores en URL:** periodicidad, corte y métrica viven en search params vía
  `useUrlParam` (hook nuevo), cumpliendo R1.4.
