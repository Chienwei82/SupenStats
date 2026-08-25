# SPEC — Nuevos reportes: Rentabilidad real por OPC y Comisiones vs. Rentabilidad

Estado: **borrador para aprobación**. No se implementa nada hasta aprobar este documento
junto con `DESIGN.md`.

---

## Contexto y hallazgo clave

Al verificar la API real de SUPEN se confirmó que el endpoint
`GET /estadisticas/api/rendimiento` **ya devuelve tanto rentabilidad NOMINAL como REAL**
(campo `tipo` ∈ {`"NOMINAL"`, `"REAL"`}) por entidad/fondo y por periodicidad
(`ANUAL`, `3 AÑOS`, `5 AÑOS`, `10 AÑOS`, `HISTÓRICA`). Ejemplo verificado
(2026-05-31, fondo ROP):

```json
{"entidad":"BACSJ PENSIONES","tipo":"NOMINAL","periodicidad":"ANUAL","rentabilidad":10.49,...}
{"entidad":"BACSJ PENSIONES","tipo":"REAL","periodicidad":"HISTÓRICA","rentabilidad":5.47,...}
```

Esto significa dos cosas:

1. El Reporte 1 puede construirse **sin depender del BCCR**, usando directamente la
   serie `tipo="REAL"` que publica SUPEN (calculada por SUPEN con su propia
   metodología).
2. La integración con el BCCR (IPC) queda como **vía alternativa / verificación
   cruzada**: permitiría calcular la rentabilidad real nosotros mismos a partir de la
   nominal cuando SUPEN no publique la serie REAL para algún periodo, o validar sus
   números. Queda como **decisión pendiente** para el usuario (ver §5).

---

## REPORTE 1 — Rentabilidad nominal vs. real por OPC

### Objetivo
Mostrar, para cada OPC y fondo, la rentabilidad nominal y la real (ajustada por
inflación) del periodo más reciente disponible, con posibilidad de elegir periodo
cuando existan datos históricos.

### Fuente de datos (primaria)
- `GET /estadisticas/api/rendimiento?Fondo={ROP|FCL}&FechaInicio=...&FechaFinal=...`
- Filtrar `tipo ∈ {NOMINAL, REAL}`.
- Periodicidades disponibles: `ANUAL`, `3 AÑOS`, `5 AÑOS`, `10 AÑOS`, `HISTÓRICA`.

### Requerimientos funcionales

1. **R1.1 — Comparación por defecto.** Vista principal: comparación nominal vs. real
   por OPC para el corte (`fecha`) más reciente disponible del fondo seleccionado,
   con selector de **periodicidad** (default: `ANUAL`; alternativas: las 5 arriba).
2. **R1.2 — Visualización.** Gráfico de barras agrupadas (dos series: nominal y real)
   con una barra por OPC. Recharts, siguiendo el patrón de componentes existente.
   Alternativa complementaria: tabla con ambas columnas y el diferencial
   (nominal − real) si el usuario lo aprueba en DESIGN.md.
3. **R1.3 — Selector de fondo.** Reutilizar el `FilterBar` existente (fondo ROP/FCL).
4. **R1.4 — Selector de fecha de corte.** Si el rango de fechas solicitado devuelve
   varios cortes mensuales, mostrar por defecto el más reciente y ofrecer navegación
   entre cortes (mismo mecanismo draft/applied de URL search params que el resto
   de la app).
5. **R1.5 — Manejo de datos faltantes (obligatorio).**
   - Si para una OPC/periodo existe `NOMINAL` pero no `REAL`, mostrar explícitamente
     **"no disponible"** para la barra/columna real. Nunca omitir silenciosamente ni
     interpolar/inventar valores.
   - Si la serie `REAL` no existe para ningún registro del periodo consultado, mostrar
     un aviso visible en el reporte indicándolo (componente `ChartNote` o equivalente).
6. **R1.6 — Nota metodológica.** Texto fijo explicando que la serie "real" es la que
   calcula y publica SUPEN (no un cálculo propio), con enlace a la fuente.
7. **R1.7 — Errores de red/API.** Reutilizar `ReportView`/`ErrorMessage` (skeleton +
   error con reintento), igual que los demás reportes.

### Criterios de aceptación
- Dado Fondo=ROP y periodicidad=ANUAL, se muestran todas las OPC con sus barras
  nominal y real del corte más reciente.
- Toda OPC sin dato REAL muestra "no disponible" de forma explícita y contable
  (el usuario puede distinguir ausencia de dato de valor cero).
- Los filtros viven en la URL y son compartibles/back-navegables.

---

## REPORTE 2 — Comisiones vs. rentabilidad por OPC

### Objetivo
Responder: *¿las OPC que cobran más comisión realmente rinden más?*

### Fuentes de datos
- `GET /estadisticas/api/comision?Fondo=...&FechaInicio=...&FechaFinal=...`
  → campo `tipo` ∈ {`APORTE`, `RENDIMIENTO`, `SALDO`}, valor `comisión` (%).
  **Nota verificada:** para ROP reciente, solo `SALDO` tiene valor; `APORTE` y
  `RENDIMIENTO` vienen `null`.
- `GET /estadisticas/api/rendimiento?...` (misma fuente que Reporte 1).

### Requerimientos funcionales

1. **R2.1 — Scatter plot.** Un punto por OPC. Eje X: comisión cobrada. Eje Y:
   rentabilidad (nominal por defecto, con toggle a real si hay datos — decisión de UI
   en DESIGN.md). Tooltip con nombre de la OPC al hover/tap.
2. **R2.2 — Definición de comisión.** Se usa la comisión sobre **saldo** (`tipo=SALDO`)
   como métrica principal, por ser la única poblada en ROP reciente. Si para FCL u otro
   fondo aparecen tipos adicionales con datos, se decide en DESIGN.md cómo exponerlos.
3. **R2.3 — Alineación temporal comisión↔rentabilidad.** La comisión y la rentabilidad
   deben corresponder al mismo corte (`fecha`) y al mismo `codigofondo`. Regla default:
   usar el corte más reciente común a ambas fuentes. Si una OPC tiene comisión pero no
   rentabilidad (o viceversa) en ese corte, ese punto se excluye del gráfico y se lista
   aparte como "sin datos para emparejar" (visible, nunca silencioso).
4. **R2.4 — Selector de fondo y periodicidad.** Mismo FilterBar; la rentabilidad usa la
   periodicidad elegida (default `ANUAL`).
5. **R2.5 — Línea de tendencia (opcional, a decidir en DESIGN.md).** Regresión lineal
   simple por mínimos cuadrados sobre los puntos emparejados, mostrada como línea
   punteada con nota de correlación r. Es trivialmente calculable en cliente (~15 líneas);
   se propone incluirla, sujeta a aprobación.
6. **R2.6 — Nota interpretativa.** Aviso fijo: n puntos, qué mide cada eje, y que
   correlación ≠ causalidad.
7. **R2.7 — Datos faltantes y errores:** mismas reglas de R1.5/R1.7.

### Criterios de aceptación
- Con Fondo=ROP, el scatter empareja comisión SALDO con rentabilidad ANUAL del mismo
  corte y muestra ≥ 1 punto por OPC con datos completos.
- Hover/tap muestra el nombre de la OPC.
- Las OPC sin par completo aparecen listadas como excluidas, con motivo.

---

## Restricciones generales (ambos reportes)

- No inventar datos ni interpolar valores faltantes. Ausencia de dato = representación
  explícita ("no disponible").
- Reutilizar: capa `apiService.ts`, hook `useReportQuery` (React Query), factory
  `createReportRoute`, `FilterBar`, `ReportView`, `ChartCard`, Recharts. Sin librerías
  nuevas.
- Código simple; sin abstracciones prematuras.

## Decisiones pendientes para el usuario

1. **¿Usar la serie REAL de SUPEN (opción simple, recomendada) o calcular la real
   nosotros vía IPC del BCCR?** La segunda añade dependencia de un servicio externo con
   registro obligatorio (correo + token) y bloquea peticiones desde el navegador (CORS),
   lo que exigiría proxy serverless en Vercel.
2. Tabla adicional en Reporte 1 (sí/no).
3. Incluir línea de tendencia + r en Reporte 2 (recomendado sí).
