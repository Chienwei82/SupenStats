# SPEC — Reporte 7: Poder adquisitivo de la pensión proyectada

Estado: **borrador para aprobación**. No se implementa nada hasta aprobar este documento
junto con `DESIGN.md`.

---

## Dependencia crítica: integración con BCCR (NO implementada)

El cálculo de poder adquisitivo requiere una **tasa de inflación** para descontar el
monto nominal futuro a valor presente. Actualmente:

- **La integración con el BCCR (IPC) NO está implementada** en el código. Solo existe
  documentada como pendiente opcional en `docs/reportes/DESIGN.md` §5.
- **La API de SUPEN NO devuelve datos de inflación** — devuelve rentabilidad nominal
  y real (ya ajustada por SUPEN), pero no el componente inflación por separado.
- El histórico de rentabilidad REAL de SUPEN permite *aproximar* la inflación
  implícita (nominal − real), pero esto tiene limitaciones significativas:
  - No es una medición directa de inflación, sino un residuo.
  - La diferencia nominal − real puede incluir otros factores metodológicos de SUPEN.
  - No hay garantía de que la aproximación sea consistente entre OPCs o periodos.

**Decisión para esta fase:** el SPEC asume la futura integración del BCCR como
prerequisito. Si el usuario decide NO integrar BCCR, el reporte degrada
graciosamente (ver § Manejo de errores). No se inventan tasas de inflación.

---

## Objetivo

Extender el simulador de proyección existente (Reporte 4 — "¿Cuánto tendré al
pensionarme?") para mostrar el monto proyectado no solo en colones nominales futuros,
sino también en **"colones de hoy"** (valor presente), descontado por la inflación
acumulada estimada hasta el año de retiro.

---

## Cálculo

### Valor presente de la pensión proyectada

```
valor_presente = monto_proyectado_nominal / (1 + tasa_inflacion_anual)^años_hasta_retiro
```

Donde:
- `monto_proyectado_nominal`: el `montoFinal` que ya calcula `proyeccionPension()`.
- `años_hasta_retiro`: la diferencia `edadRetiro − edadActual` (ya disponible como
  `params.anios` en el simulador).
- `tasa_inflacion_anual`: la **tasa de inflación anual promedio** derivada del
  histórico del BCCR. Método exacto a definir en DESIGN.md (ej. promedio geométrico
  de la inflación IPC mensual de los últimos N años).

### Origen de la tasa de inflación

Si la integración BCCR está implementada:
- Obtener el IPC mensual histórico del BCCR.
- Calcular la tasa de inflación anual a partir de los datos mensuales.
- Promediar (método a definir en DESIGN.md) para obtener una tasa representativa.

Si la integración BCCR NO está implementada:
- No calcular valor presente.
- Mostrar solo el monto nominal con mensaje explícito de que el ajuste por inflación
  no está disponible.

---

## Requerimientos funcionales

1. **R7.1 — Valor presente junto al nominal.** Junto al monto nominal proyectado ya
   visible en el simulador, agregar una segunda cifra: **"Equivalente en colones de
   hoy"** con el valor presente calculado.

2. **R7.2 — Explicación contextual.** Debajo del valor presente, una breve nota
   explicando: "Este monto representa cuánto valdría hoy lo que recibirías en el
   futuro, considerando que la inflación reduce el poder adquisitivo del dinero."

3. **R7.3 — Degradación graciosa sin datos de inflación.**
   - Si no hay dato de inflación suficiente para calcular la proyección, mostrar
     **únicamente** el monto nominal.
   - Mostrar un mensaje explícito: "El ajuste por inflación no está disponible en
     este momento."
   - **NUNCA** mostrar una cifra "equivalente" inventada o calculada con datos
     insuficientes.

4. **R7.4 — Reutilización del simulador existente.** El cálculo del monto nominal
   NO cambia. Solo se agrega una capa de presentación que toma el `montoFinal` ya
   calculado y aplica el descuento por inflación.

5. **R7.5 — Parámetro visible de la tasa de inflación.** Mostrar la tasa de
   inflación anual promedio utilizada en el cálculo, junto con el periodo de datos
   del cual fue derivada (ej. "Basado en inflación promedio 2015-2025: X.XX%").

6. **R7.6 — Canastas básicas (opcional, a decidir en DESIGN.md).** Evaluar si
   incorporar en este reporte la conversión a "canastas básicas" del INEC, o si
   se deja para un reporte aparte. Requiere investigación adicional sobre
   disponibilidad y formato de datos del INEC.

---

## Manejo de errores

| Situación | Comportamiento |
|-----------|----------------|
| BCCR no integrado / sin datos de inflación | Mostrar solo monto nominal + mensaje "Ajuste por inflación no disponible" |
| Datos de inflación insuficientes (< N años, a definir) | Mostrar solo monto nominal + mensaje "Histórico de inflación insuficiente para proyectar" |
| Error de red al obtener inflación | Mostrar solo monto nominal + mensaje "No se pudo obtener datos de inflación" |
| Todos los datos disponibles | Mostrar ambas cifras (nominal + valor presente) con la tasa y periodo usados |

**Regla cardinal:** nunca inventar ni mostrar cifras de valor presente sin datos
suficientes y verificables.

---

## Restricciones

- No inventar tasas de inflación ni proyecciones sin dejar explícito el método
  usado y sus limitaciones.
- Reutilizar el cálculo y componentes del simulador existente; no duplicar lógica.
- Priorizar código simple y mantenible sobre abstracciones prematuras.
- Todos los commits van en el branch dedicado `feature/poder-adquisitivo-pension`.

---

## Decisiones aprobadas

1. **Integración BCCR:** se implementa la **Opción B** — el reporte degrada
   graciosamente sin BCCR (solo monto nominal + mensaje). El proxy BCCR se conecta
   en una fase posterior; la lógica del reporte queda lista para consumirlo
   (hook `useInflacion()` retornando `null` hoy).
2. **Canastas básicas INEC:** se deja para un reporte aparte.
3. **Periodo de promediación de inflación:** 10 años de histórico IPC.
4. **Método de promediación:** promedio geométrico de las inflaciones anuales
   derivadas del IPC mensual (detalle en DESIGN.md §5).
