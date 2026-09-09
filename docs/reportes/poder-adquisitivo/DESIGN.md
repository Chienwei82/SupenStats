# DESIGN — Reporte 7: Poder adquisitivo de la pensión proyectada

Estado: **borrador para aprobación**. Acompaña a `SPEC.md` en esta misma carpeta.

---

## 1. Dependencia: integración BCCR (prerequisito no implementado)

### Estado actual

La integración con el BCCR para obtener el IPC (inflación) **NO está implementada**.
Solo existe documentada como pendiente en `docs/reportes/DESIGN.md` §5. Los datos
relevantes de esa investigación:

- **Servicio:** `https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx`
- **Método:** `ObtenerIndicadoresEconomicos`
- **Parámetros:** `Indicador, FechaInicio, FechaFinal, Nombre, SubNiveles, CorreoElectronico, Token`
- **Autenticación:** Registro previo en `https://www.bccr.fi.cr/indicadores-economicos/servicio-web`; token enviado por correo; ambos (correo + token) viajan en cada request.
- **CORS:** El BCCR rechaza llamadas desde navegador ⇒ requiere proxy serverless (Vercel Function).
- **Indicador IPC:** Código exacto del nivel general del IPC **pendiente de confirmar** contra la lista oficial (no documentar de memoria).
- **Proxy necesario:** Vercel Function con env vars `BCCR_EMAIL` y `BCCR_TOKEN` como secrets.

### Decisión aprobada: Opción B (degradación graciosa)

**Aprobado 2026-09-09:** se implementa la Opción B. El reporte se diseña y
construye asumiendo la futura integración BCCR. Sin datos de inflación, el
reporte muestra solo el monto nominal con mensaje explícito; el cálculo de
valor presente se activa automáticamente cuando el proxy BCCR exista y devuelva
datos. La lógica del reporte (helpers + UI) queda lista para consumir BCCR sin
cambios adicionales.

---

## 2. Arquitectura general

### Reutilización del simulador existente

El simulador actual (`src/components/Simulador.tsx`) ya calcula:
1. Promedio de rentabilidad histórica → `calcularRentabilidadPromedio()`
2. Proyección mensual → `proyeccionPension()` → `montoFinal` + `curva`

El Reporte 7 **no modifica** ese flujo. Solo agrega una capa post-proyección:

```
proyeccionPension(params) → { montoFinal, curva }
                                    ↓
                         valorPresente(montoFinal, años, tasaInflacion)
                                    ↓
                         { montoNominal, valorPresente, tasaInflacion, periodo }
```

### Flujo de datos (aprobado — Opción B, con degradación)

```
routes/simulador.tsx (modificada)
  ├─ fetchRendimientoSerie(...)           ← ya existe
  ├─ calcularRentabilidadPromedio(...)    ← ya existe
  ├─ proyeccionPension(...)               ← ya existe
  │
  └─ [NUEVO] useInflacion()              ← hook que retorna null si BCCR no disponible
       └─ Si null → mostrar solo monto nominal + mensaje
       └─ Si datos → calcular y mostrar ambas cifras
```

> Nota: el proxy BCCR (`§4`) no se implementa en esta fase. El hook
> `useInflacion()` se implementa hoy retornando `null` (o un fetch al proxy que
> al no existir retorna "no configurado"), de modo que conectar BCCR en el futuro
> no requiera tocar la lógica del reporte.

---

## 3. Modelo de datos y helpers nuevos

### Tipos nuevos (en `src/types/supen.ts`)

```ts
/** Datos IPC mensual obtenidos del BCCR. */
export interface RegistroIPC {
  fecha: string       // 'YYYY-MM-01' o formato del BCCR
  valor: number       // nivel del IPC (índice, no tasa)
}

/** Resultado del cálculo de inflación promedio. */
export interface InflacionPromedio {
  /** Tasa anual promedio en decimal (ej. 0.045 = 4.5%). */
  tasaAnual: number | null
  /** Cantidad de años de datos mensuales usados. */
  nAnios: number
  /** Primera fecha del histórico usado. */
  fechaInicio: string | null
  /** Última fecha del histórico usado. */
  fechaFin: string | null
  /** true si hubo datos pero insuficientes (< mínimo requerido). */
  insuficiente: boolean
}

/** Resultado completo de la proyección con poder adquisitivo. */
export interface ProyeccionConPoderAdquisitivo {
  montoFinal: number
  valorPresente: number | null    // null = sin datos de inflación
  tasaInflacion: number | null
  inflacionInfo: InflacionPromedio
  curva: PuntoProyeccion[]
}
```

### Helpers puros (en `src/utils/reportes.ts`)

```ts
/**
 * Calcula la tasa de inflación anual promedio a partir del IPC mensual histórico.
 * Usa promedio geométrico de las tasas de inflación anuales calculadas.
 * Devuelve null si hay menos de MIN_MESES_INFLACION registros.
 */
export function calcularTasaInflacionPromedio(
  ipcMensual: RegistroIPC[],
  minAnios?: number,  // default: 5
): InflacionPromedio

/**
 * Calcula el valor presente descontando inflación acumulada.
 * valor_presente = monto / (1 + tasa)^años
 * Devuelve null si tasaInflacion es null.
 */
export function valorPresente(
  montoNominal: number,
  añosHastaRetiro: number,
  tasaInflacionAnual: number | null,
): number | null
```

**Constantes nuevas:**
```ts
export const MIN_ANIOS_INFLACION = 5  // mínimo para considerar la tasa confiable
export const MIN_MESES_INFLACION = MIN_ANIOS_INFLACION * 12
export const ANIOS_INFLACION = 10     // ventana de promediación aprobada
```

---

## 4. Integración BCCR (serverless proxy) — fase futura

> **No se implementa en esta fase.** El proxy se documenta aquí a modo de
> referencia para la fase posterior en que se conecte BCCR. La lógica del
> Reporte 7 (helpers + UI) no dependerá de que exista o no.

### Vercel Function (`api/bccr-inflacion.ts`)

```
api/
  bccr-inflacion.ts    ← Vercel Function (serverless)
```

**Funcionalidad:**
- Recibe: `{ fechaInicio: string, fechaFinal: string }` via query params o POST.
- Lee env vars: `BCCR_EMAIL`, `BCCR_TOKEN` (secrets de Vercel).
- Llama al endpoint BCCR con indicador IPC (código a confirmar).
- Retorna: `{ registros: RegistroIPC[] }` o `{ error: string }`.
- **Cache:** edge cache agresivo (el IPC histórico es inmutable). Headers `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`.

### Hook cliente (`src/hooks/useInflacion.ts`)

```ts
/**
 * Hook que obtiene la inflación histórica del BCCR vía el proxy.
 * Retorna { data: InflacionPromedio, isLoading, error }.
 * Si BCCR no está configurado (404/501 del proxy), retorna data con
 * tasaAnual: null e insuficiente: false (degradación sin error visible).
 */
export function useInflacion(fechaInicio?: string, fechaFinal?: string)
```

**Query key:** `['inflacion-bccr', fechaInicio, fechaFinal]`
**Cache:** React Query staleTime 24h (el IPC histórico no cambia).

### Env vars necesarias (fase futura, si se integra BCCR)

| Variable | Descripción |
|----------|-------------|
| `BCCR_EMAIL` | Correo registrado en el servicio web del BCCR |
| `BCCR_TOKEN` | Token de autenticación del BCCR |

---

## 5. Método de promediación de inflación

### Propuesta: promedio geométrico de tasas anuales

1. A partir del IPC mensual, calcular la inflación de cada año:
   ```
   inflacion_anual[year] = (ipc_dic[year] / ipc_ene[year]) - 1
   ```
   (o usar el IPC promedio mensual del año contra el anterior)

2. Calcular el promedio geométrico de las tasas anuales de los últimos N años:
   ```
   tasa_promedio = (∏(1 + inflacion_anual[i]))^(1/N) - 1
   ```

3. **Ventajas del geométrico sobre el simple:**
   - Captura correctamente el efecto compuesto de la inflación.
   - Es el método estándar para promediar tasas de crecimiento.

4. **N (período):** ventana de **10 años** (aprobada). Mínimo 5 años
   (`MIN_ANIOS_INFLACION`) por debajo del cual se considera histórico insuficiente.
   Se muestra el periodo usado en la UI.

**Limitaciones a documentar en la UI:**
- Es una proyección basada en históricos, no una garantía.
- La inflación futura puede diferir significativamente del promedio pasado.
- El método asume que la inflación futura será similar a la reciente.

---

## 6. Componentes UI

### Modificación al simulador existente

El componente `Simulador.tsx` se modifica para agregar una sección debajo del
monto nominal proyectado:

```
┌─────────────────────────────────────────────┐
│  Resultado de la proyección                 │
│                                             │
│  Monto proyectado al pensionarse:           │
│  ₡ 12,456,789                               │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ Equivalente en colones de hoy:      │    │
│  │ ₡ 6,234,567                        │    │
│  │                                     │    │
│  │ Este monto representa cuánto valdría│    │
│  │ hoy lo que recibirías en el futuro, │    │
│  │ considerando que la inflación reduce│    │
│  │ el poder adquisitivo del dinero.    │    │
│  │                                     │    │
│  │ Basado en inflación promedio        │    │
│  │ 2016-2025: 4.52% anual             │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [Si no hay datos de inflación:]            │
│  ℹ️ El ajuste por inflación no está         │
│  disponible en este momento.                │
└─────────────────────────────────────────────┘
```

### Componentes afectados

| Componente | Cambio |
|-----------|--------|
| `Simulador.tsx` | Agregar sección de valor presente debajo del resultado nominal. Usar `useInflacion()` hook. Condicional: solo mostrar si hay datos. |
| `Simulador.tsx` (resultado) | Envolver resultado nominal + valor presente en un contenedor visual (card o sección diferenciada). |
| **Nuevo:** `src/components/ValorPresente.tsx` (opcional) | Componente extraído que muestra el valor presente con su explicación. Solo si el usuario aprueba extraerlo (sino, inline en Simulador). |

### Responsividad

- En desktop: ambas cifras lado a lado (nominal a la izquierda, valor presente a la derecha).
- En móvil: ambas cifras apiladas verticalmente.

### Accesibilidad

- El valor presente es información complementaria, no reemplaza al nominal.
- Ambos montos deben ser legibles por screen readers.
- La nota explicativa debe ser accesible (no solo color para distinguir).

---

## 7. Caché y rendimiento

| Capa | Estrategia |
|------|-----------|
| BCCR proxy (Vercel) | `Cache-Control: public, max-age=86400` (1 día). El IPC histórico es inmutable; el cache solo expira para datos recientes. |
| React Query (cliente) | Query key `['inflacion-bccr', inicio, fin]`, staleTime 24h, gcTime 7d. |
| Cálculo | Función pura `valorPresente()` — sin cache needed, se recalcula instantáneamente con los mismos inputs. |

---

## 8. Errores y datos faltantes

- **BCCR no configurado (proxy retorna 404/501):** hook retorna `data: { tasaAnual: null, insuficiente: false }`. UI muestra solo nominal + mensaje "Ajuste por inflación no disponible".
- **BCCR con error de red:** hook retorna `error`. UI muestra solo nominal + mensaje "No se pudo obtener datos de inflación".
- **Datos insuficientes (< 5 años):** hook retorna `data: { tasaAnual: null, insuficiente: true }`. UI muestra solo nominal + mensaje "Histórico de inflación insuficiente para proyectar".
- ** Datos completos:** UI muestra ambas cifras con la tasa y periodo usados.
- **Regla transversal:** `null` nunca se convierte en 0 ni se infiere. Ausencia = representación explícita.

---

## 9. Canastas básicas INEC (decisión: reporte aparte)

**Aprobado 2026-09-09: se deja para un reporte aparte.** El Reporte 7 no incorpora
la conversión a canastas básicas. Se documenta aquí solo la referencia para una
fase futura:

- Disponibilidad de datos del INEC: ¿hay API pública? ¿Datos descargables?
- Formato: ¿canasta básica total por año? ¿Desglosada por componente?
- Frecuencia: ¿anual? ¿mensual?

Recomendación vigente: mantener el Reporte 7 enfocado en poder adquisitivo sin
multiplicar dependencias externas; evaluar INEC en un reporte dedicado.

---

## 10. Plan de implementación (aprobado — Opción B)

En **rama** `feature/poder-adquisitivo-pension`, en este orden:

1. Helpers puros: `valorPresente()` y `calcularTasaInflacionPromedio()` + tests Vitest.
2. Hook `useInflacion()` que hoy retorna datos nulos (sin BCCR conectado) pero ya
   expone la firma/queries con las que consumirá el proxy BCCR futuro.
3. Modificar `Simulador.tsx`: agregar sección de valor presente con degradación graciosa.
4. Nota metodológica, `oxlint` + `tsc -b --noEmit` + `vitest run`.

### Fase futura (cuando se apruebe integrar BCCR)

1. Confirmar el código de indicador IPC del BCCR contra la lista oficial.
2. Implementar Vercel Function `api/bccr-inflacion.ts` + env vars `BCCR_EMAIL`/`BCCR_TOKEN`.
3. Conectar `useInflacion()` al proxy. Sin cambios en los helpers ni en `Simulador.tsx`.

### Verificación

```bash
npm run lint && npm run typecheck && npm test
```

---

## 11. Limitaciones a comunicar en la UI

Se incluirá una nota metodológica (componente `ChartNote` o texto fijo) con:

- "El valor presente es una estimación basada en la inflación histórica promedio."
- "La inflación futura puede ser diferente a la promedio de los últimos N años."
- "Este cálculo no considera cambios en el poder adquisitivo de bienes específicos."
- Periodo de datos y tasa promedio usados.
- Si se usó canastas básicas: fuente INEC y periodo.
