# SPEC — Reporte 4: Simulador "¿cuánto tendré al pensionarme?" y Reporte 5: Pirámide poblacional de afiliados/pensionados

Estado: **borrador para aprobación**. No se implementa nada hasta aprobar este documento
junto con `DESIGN.md`. Todo el trabajo vive en la rama `feature/simulador-y-piramide-poblacional`.

---

## Fuentes de datos (verificadas contra la API real de SUPEN)

Se consultó la especificación OpenAPI publicada por SUPEN en
`https://webapps.supen.fi.cr/Estadisticas/API/documentacion/api.json`
(OpenAPI 3.0.1). Los endpoints relevantes y sus parámetros exactos son:

| Endpoint | Parámetros query | Uso en este trabajo |
|----------|------------------|---------------------|
| `GET /estadisticas/api/rendimiento` | `Fondo`, `FechaInicio`, `FechaFinal` (el cliente existente también envía `Entidad`) | **Reporte 4** — rentabilidad histórica por OPC/fondo |
| `GET /estadisticas/api/afiliado` | `Fondo`, `FechaInicio`, `FechaFinal` | **Reporte 5** — afiliados por sexo y rango de edad |
| `GET /estadisticas/api/beneficio` | `Fondo`, `FechaInicio`, `FechaFinal` | **Reporte 5** — pensionados por sexo y rango de edad |

Forma de acceso en la app: `API_BASE = '/estadisticas/api'` con proxy Vite en dev y
rewrite de Vercel en prod (sin cambios). `Fondo ∈ {ROP, FCL, VOL, BASI, OCUP, ...}`.

### Forma de los datos crudos (campos reales de SUPEN, ya modelados en `src/types/supen.ts`)

- **rendimiento** (`RawRendimiento`): `entidad`, `tipo` (`'NOMINAL' | 'REAL'`),
  `periodicidad` (`'ANUAL' | '3 AÑOS' | '5 AÑOS' | '10 AÑOS' | 'HISTÓRICA'`),
  `rentabilidad: number | null`, `fecha`, `codigoregimen`, `régimen`, `codigofondo`, `fondo`.
- **afiliado** (`RawAfiliado`): `entidad`, `codigosexo`, `sexo`, `rangoedad`,
  `afiliados: number | null`, `aportantes: number | null`, `fecha`, `codigofondo`, `fondo`.
- **beneficio** (`RawBeneficio`): `entidad`, `sexo`, `rangoedad`, `tipobeneficio`,
  `beneficio: number | null` (cantidad de pensionados), `beneficiocolones: number | null`,
  `fecha`, `codigofondo`, `fondo`.

> **Nota importante de campo:** `transformBeneficios` hoy **descarta** `sexo` y
> `rangoedad` (suma solo por `entidad|fecha|tipobeneficio`). Para la pirámide de
> pensionados por sexo/edad se requiere un **nuevo transformador** que preserve esos
> campos (ver `DESIGN.md` §2).

---

## REPORTE 4 — Simulador "¿cuánto tendré al pensionarme?"

### Objetivo
El usuario ingresa su saldo actual del ROP, su aporte mensual estimado, su edad actual y
su edad de retiro, y ve una proyección del monto acumulado a la edad de retiro.

### Fuente de datos
- `GET /estadisticas/api/rendimiento?Fondo=ROP&FechaInicio=...&FechaFinal=...` (rango
  histórico amplio, p. ej. últimos 5–10 años).
- Se usa la serie `periodicidad = 'ANUAL'` de la OPC seleccionada como **tasa de
  crecimiento proyectada** = promedio de los valores `rentabilidad` (tipo `NOMINAL` por
  defecto, con toggle a `REAL` si el usuario lo prefiere).

### Inputs del usuario (formulario local, no son filtros de API)
1. **Saldo actual del ROP** (colones).
2. **Aporte mensual estimado** (colones).
3. **Edad actual** (años, entero 18–99).
4. **Edad de retiro** (años, entero > edad actual y ≤ 99).
5. **OPC/fondo de referencia** (selector de `Entidad` + `Fondo`, default `Fondo=ROP`):
   provee la rentabilidad histórica promedio que se usa como tasa.

### Cálculo (todo en cliente, función pura)
- Años a proyectar `n = edadRetiro − edadActual`.
- Tasa anual `r` = promedio de la serie `ANUAL` (tipo elegido) de la OPC en el rango.
- Proyección con aporte mensual al final de cada mes:
  `S = saldo0 * (1 + r)^(n)` sumando el valor futuro de una anualidad de 12 aportes/mes a
  tasa `r` anual. Se genera la **curva año a año** `S(t)` para `t = 1..n`.
- La tasa `r` se calcula solo sobre cortes que tengan `rentabilidad` no nulo.

### Requerimientos funcionales
1. **R4.1 — Resultado principal.** Monto proyectado al retiro en colones (formato
   `Intl.NumberFormat('es-CR', currency: CRC)`).
2. **R4.2 — Curva de crecimiento.** Gráfico de línea año a año del saldo proyectado
   (`S(t)`), con tooltip por año. Recharts `<LineChart>`.
3. **R4.3 — Aviso de proyección (obligatorio).** Texto fijo, visible: *"Proyección
   basada en la rentabilidad histórica promedio de la OPC seleccionada. No es una
   garantía de rendimiento futuro."*
4. **R4.4 — Selectores reutilizados.** `FilterBar` para `Fondo` + rango de fechas (acota
   el histórico usado). Selector adicional de `Entidad` (OPC) para elegir la referencia.
   `metrica` (nominal/real) vía `useUrlParam` (igual que los reportes de rentabilidad).
5. **R4.5 — Manejo de histórico insuficiente (obligatorio).** Si la OPC no tiene
   suficientes cortes con `rentabilidad` no nulo para un promedio confiable (umbral
   propuesto `MIN_CORTES_RENTABILIDAD = 12`, configurable), se muestra explícitamente:
   *"Histórico insuficiente para la OPC X (n=… cortes). No se calcula proyección."* y **no**
   se usa ningún valor supuesto ni por defecto.
6. **R4.6 — Validación de inputs.** Edad de retiro > edad actual; montos ≥ 0; si hay
   error de rango, el botón/resultado se deshabilita con mensaje claro. No se proyecta
   con inputs inválidos.
7. **R4.7 — Errores de red/API.** Reutilizar `ReportView` (skeleton + ErrorMessage con
   reintento) para la carga de la rentabilidad de referencia.

### Criterios de aceptación
- Con `Fondo=ROP`, rango con ≥12 cortes y OPC con datos, se muestra monto proyectado +
  curva y el aviso de proyección.
- Con una OPC sin suficiente histórico, se muestra el aviso de R4.5 y ningún número de
  proyección.
- Todos los selectores viven en la URL (compartible/back-navegable).

---

## REPORTE 5 — Pirámide poblacional de afiliados/pensionados

### Objetivo
Visualizar la distribución de afiliados y/o pensionados por rango de edad y sexo en
forma de pirámide poblacional (barras horizontales opuestas por sexo).

### Fuentes de datos
- **Afiliados:** `GET /estadisticas/api/afiliado` → `transformAfiliadosDemograficos`
  (ya existe) devuelve `{ Entidad, Fondo, FechaCorte, Sexo, RangoEdad, CantidadAfiliados }`.
- **Pensionados:** `GET /estadisticas/api/beneficio` → **nuevo** `transformBeneficiosDemograficos`
  que preserve `{ Entidad, Fondo, FechaCorte, Sexo, RangoEdad, TipoBeneficio, CantidadPensionados }`
  (el transformador actual pierde sexo/rangoedad, ver nota arriba).

### Requerimientos funcionales
1. **R5.1 — Pirámide.** Gráfico de barras horizontales: eje Y = `RangoEdad` (en el orden
   exacto que devuelva la API, sin re-etiquetar ni inventar rangos); dos barras por rango:
   una para `Masculino` (hacia la izquierda, valor negado y con `tickFormatter` a absoluto)
   y una para `Femenino` (hacia la derecha, positivo). Recharts `<BarChart>` (patrón
   back-to-back estándar, sin librería nueva).
2. **R5.2 — Toggle afiliados vs pensionados.** Control que elige el dataset a mostrar
   (afiliados activos | pensionados). Por defecto "afiliados activos". La distinción es
   real porque vienen de endpoints distintos.
3. **R5.3 — Filtro por OPC (a definir por lo que devuelva la API).** Selector
   "Todas las OPC" (suma) o una OPC concreta, reutilizando el patrón de `Entidad`.
4. **R5.4 — Corte temporal.** Usar el `FechaCorte` más reciente del rango consultado;
   selector de corte en URL si hay varios (igual que `RentabilidadRealChart`).
5. **R5.5 — Datos faltantes por rango/sexo (obligatorio).** Si para un `RangoEdad` o una
   categoría el dato viene nulo/ausente, esa barra se muestra como **"no disponible"**
   (vacía y etiquetada), **no** se omite del eje ni se rellena con 0 implícito. Si un
   rango de edad completo falta para un sexo, se conserva la fila en el eje con marca de
   "no disponible".
6. **R5.6 — Errores de red/API.** Mismas reglas de `ReportView` que los demás reportes.

### Criterios de aceptación
- Con `Fondo=ROP` y corte reciente, la pirámide muestra todos los `RangoEdad` devueltos
  por la API, separados por sexo, para afiliados y (vía toggle) pensionados.
- Una categoría sin dato se ve explícitamente como "no disponible", distinguible de 0.
- El filtro de OPC y el corte viven en la URL.

---

## Restricciones generales (ambos reportes)
- No inventar datos ni interpolar valores faltantes. Ausencia = "no disponible" explícito.
- Reutilizar: `apiService.ts`, `useReportQuery`/`useUrlParam`, `createReportRoute`
  (o ruta custom para el simulador), `FilterBar`, `ReportView`, `ChartCard`, `ChartNote`,
  Recharts, Tailwind. **Sin librerías nuevas.**
- Código simple; sin abstracciones prematuras. Tests Vitest para helpers puros.
- Todos los commits en `feature/simulador-y-piramide-poblacional`.

## Decisiones pendientes para el usuario
1. **Tasa del simulador:** ¿NOMINAL (recomendado, es la "rentabilidad histórica" bruta) o
   permitir toggle a REAL? (Se propone toggle nominal/real, default NOMINAL.)
2. **Umbral de histórico suficiente** (`MIN_CORTES_RENTABILIDAD`): ¿12 cortes (1 año) está
   bien, o pedir más (p. ej. 36)?
3. **Pensionados:** ¿sumar todos los `tipobeneficio` o solo alguno (ej. "JUBILACION")?
   Requiere confirmar los valores reales de `tipobeneficio` contra la API antes de
   implementar (no se asume de memoria).
4. **Pirámide:** ¿toggle excluyente afiliados/pensionados, u opción de superponer ambos?
