# SPEC — Reporte: Serie histórica de traslados entre operadoras

Estado: **borrador aprobado**. Rama: `feature/traslados-entre-operadoras`.

---

## Contexto y fuentes de datos (verificadas en vivo)

Se contrastó la documentación OpenAPI oficial de SUPEN
(`https://webapps.supen.fi.cr/Estadisticas/API/documentacion/api.json`) con
peticiones reales a la API:

| Endpoint | ¿Qué devuelve? | Periodicidad confirmada | Filtros soportados |
|----------|-----------------|-------------------------|--------------------|
| `GET /estadisticas/api/afiliado` | Registros por `(entidad, fecha, sexo, rangoedad)` con `afiliados: number \| null` y `fecha` (corte mensual) | **Mensual** desde 2010 (12 fechas en 2020 verificadas) | `Fondo`, `FechaInicio`, `FechaFinal` |
| `GET /estadisticas/api/lt` | Matriz por `(entidadorigen, fecha)` con columnas `{DEST}_C` y `{DEST}_M` para cada destino | **Mensual** desde 2010 (12 fechas en 2024 verificadas) | `Fondo`, `FechaInicio`, `FechaFinal` (no filtra por `Entidad`) |

Implicación: la API sí expone series temporales de afiliados por entidad y una
matriz de traslados por periodo. El reporte combina dos vistas complementarias
sobre el mismo dominio (Fondo + rango de fechas):

1. **Vista A — Variación neta de afiliados (estimado derivado)**
2. **Vista B — Traslados reales desde `/lt` (conteo directo)**

La vista B se subdivide a su vez en dos gráficos (B1: balance neto por OPC; B2:
top de flujos origen→destino).

## REPORTE — Objetivo general

Mostrar la tendencia de **afiliados ganados/perdidos** por cada OPC a lo largo
del tiempo, como señal indirecta de qué operadoras atraen o pierden afiliados,
y complementar con los traslados reales que reporta SUPEN.

## Restricciones metodológicas (transversal)

- La vista A **es un estimado derivado**: no distingue entre traslados entre
  OPCs, nuevas afiliaciones (alta de nuevos trabajadores) y bajas (pensionados,
  fallecidos, retiros). La UI debe decirlo de forma prominente.
- La vista B sí es conteo directo de traslados entre OPCs (cantidad y monto),
  pero **tampoco equivale a "afiliados netos"**: alguien que se traslada dos
  veces en el mismo mes cuenta dos veces; y los afiliados que entran por
  primera vez al sistema o salen por pensión no aparecen aquí.
- **No inventar ni interpolar** valores faltantes. Una celda sin dato se ve
  como hueco/guion en la serie, no como cero ni como prolongación del valor
  anterior.

## Requerimientos funcionales

**R1 — Fuente y periodicidad**
- R1.1 La vista A consume `GET /api/afiliado?Fondo=…&FechaInicio=…&FechaFinal=…`.
  La periodicidad efectiva es mensual (la API corta por mes). Se documenta en
  la UI.
- R1.2 La vista B consume `GET /api/lt?Fondo=…&FechaInicio=…&FechaFinal=…`.
  Periodicidad mensual.
- R1.3 Rango por defecto: últimos 5 años (igual que el resto de la app,
  `DATE_RANGE_DEFAULT`).
- R1.4 Fondo por defecto: `ROP`. Selector de fondo igual que en los demás
  reportes.

**R2 — Selector de vista**
- R2.1 Toggle en la URL (`?vista=neto|traslados`, default `neto`).
- R2.2 Al cambiar de vista se preservan fondo + rango de fechas.

**R3 — Vista A: Variación neta de afiliados**
- R3.1 Gráfico de líneas (Recharts `<LineChart>`): una línea por OPC, eje X =
  mes, eje Y = **variación absoluta** de afiliados (personas).
- R3.2 Toggle secundario "absoluta / porcentual" (`?metrica=abs|pct`, default
  `abs`): vista porcentual usa
  `(afiliados(t) − afiliados(t−1)) / afiliados(t−1) * 100`.
- R3.3 Un periodo se considera "con dato" cuando ambas observaciones (t y t−1)
  existen y son no-nulas. Si falta una, ese delta se omite (la línea muestra
  hueco, no cero). Esto es visible en el tooltip y se anota en la nota
  metodológica.
- R3.4 Etiqueta fija en la UI: "Variación neta — estimado derivado. Incluye
  traslados entre OPCs, nuevas afiliaciones y bajas (pensionados, fallecidos,
  retiros)."
- R3.5 Tabla complementaria debajo: una fila por OPC con "variación total en
  el rango", "variación % total", "mes con mayor ganancia", "mes con mayor
  pérdida". Celdas con dato faltante → "—".

**R4 — Vista B1: Balance neto de traslados por OPC**
- R4.1 Gráfico de barras agrupadas (Recharts `<BarChart>`): una barra por OPC
  por mes, valor = `ingresos − salidas` en cantidad de traslados.
- R4.2 Mismo principio de faltantes: si la API no trae la fila de una OPC en
  un mes, esa barra se omite y el tooltip lo indica.
- R4.3 KPI cards encima del gráfico: total de traslados en el rango, OPC con
  mayor balance positivo, OPC con mayor balance negativo (todos en cantidad de
  personas).

**R5 — Vista B2: Top flujos origen → destino**
- R5.1 Tabla ordenable con los **N principales flujos**
  (`{ORIGEN} → {DESTINO}`) del rango, agregando cantidad y monto. N por
  defecto = 15, configurable.
- R5.2 Celdas con dato faltante → "—".

**R6 — Filtros**
- R6.1 Reutilizar `FilterBar` (fondo + rango de fechas).
- R6.2 Todos los selectores viven en la URL (compartible / back-navegable),
  igual que el resto de la app.

**R7 — Notas metodológicas (`ChartNote`)**
- R7.1 Nota fija explicando qué es la "variación neta" y qué no es.
- R7.2 Nota que aclara que `/lt` solo cuenta movimientos entre OPCs (no altas
  ni bajas del sistema).
- R7.3 Enlace a la fuente (manual API de SUPEN).

**R8 — Manejo de errores y datos faltantes (obligatorio)**
- R8.1 Red/API: `ReportView` estándar (skeleton, overlay refetch,
  `ErrorMessage` con retry). Cero cambios.
- R8.2 Faltantes: regla transversal — `null` nunca se convierte en 0 ni se
  interpola. Las ausencias se comunican explícitamente en UI ("—", hueco en la
  serie, lista de excluidos).
- R8.3 Si `/afiliado` no trae la fila de una OPC en un mes, ese delta no se
  calcula. Si la API devuelve `afiliados: null` para una celda, tampoco.

**R9 — Criterios de aceptación**
- Con `Fondo=ROP` y un rango de 5 años, la vista A muestra líneas por OPC con
  mes a mes; las OPCs con datos faltantes muestran huecos visibles, no ceros.
- La vista B muestra KPIs (totales + extremos) y la tabla de top flujos con
  valores consistentes con la suma de las celdas `{DEST}_C` y `{DEST}_M` del
  endpoint `/lt`.
- Conmutar entre vistas preserva los filtros. Las URLs son compartibles.
- Ningún valor se rellena ni se extrapola silenciosamente.
