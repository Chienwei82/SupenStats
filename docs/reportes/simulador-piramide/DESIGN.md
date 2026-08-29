# DESIGN — Simulador de pensión y Pirámide poblacional

Estado: **borrador para aprobación**. Acompaña a `SPEC.md` en esta misma carpeta. Cero
implementación hasta que se apruebe. Rama: `feature/simulador-y-piramide-poblacional`.

---

## 1. Arquitectura general (reutilización del patrón existente)

SPA Vite + React 19 + TanStack Router (file-based) + TanStack Query + Recharts +
Tailwind 4 + zod. Sin dependencias nuevas. `API_BASE = '/estadisticas/api'` ya resuelve
vía proxy/Vercel rewrite.

```
routes/simulador.tsx          # createFileRoute + componente custom (ver §3)
  └─ useReportQuery(['rendimiento', fondo, entidad, desde, hasta])
       └─ apiService.fetchRendimiento(...)  (ya existe)
            └─ helper calcularRentabilidadPromedio()  (nuevo, puro + test)
       └─ formulario local (inputs del usuario) + proyeccionPension() (nuevo, puro + test)
            └─ SimuladorChart (LineChart Recharts)

routes/piramide.tsx           # createReportRoute o custom
  └─ useReportQuery(['afiliados-demograficos', fondo, desde, hasta])  → fetchAfiliadosDemograficos (existe)
  └─ useReportQuery(['beneficios-demograficos', fondo, desde, hasta]) → fetchBeneficiosDemograficos (NUEVO)
       └─ PiramideChart (BarChart back-to-back Recharts)
```

### Rutas nuevas
- `/simulador` — Reporte 4.
- `/piramide` — Reporte 5.
- Añadir ambas a `ReportTabs.tsx` (lista `TABS`) y a la pantalla de inicio, igual que las
  existentes.

---

## 2. Modelo de datos y fetching

### 2.1 Simulador (rentabilidad de referencia)
- Reutilizar `fetchRendimiento(fondo?, entidad?, range?, signal?)` ya existente
  (`apiService.ts:94`). Devuelve `Rendimiento[]` (fija `ANUAL`, combina NOMINAL/REAL,
  usa `0` para ausencias). **Problema:** ese 0 inventa datos.
- **Decisión:** añadir `fetchRendimientoHistorico(fondo?, entidad?, range?, signal?)`
  (nuevo, pequeño) que devuelva la serie cruda de `ANUAL` conservando `null`, o bien
  reusar `fetchRendimientosComparados` y filtrar en el helper. Se prefiere un helper
  puro sobre los datos ya transformados para no duplicar fetchers; se decide en
  implementación según lo que quede más simple.
- Helper puro `calcularRentabilidadPromedio(rendimientos, opc, metrica):
  { promedio: number | null; nCortes: number; primerCorte: string; ultimoCorte: string }`
  - Filtra `periodicidad === 'ANUAL'`, `entidad === opc`, `tipo === (metrica)`.
  - Promedia `rentabilidad` ignorando `null`.
  - Si `nCortes < MIN_CORTES_RENTABILIDAD` (propuesto 12) → `promedio = null` (la UI
    muestra el aviso de histórico insuficiente, R4.5). Nunca sustituye por otro valor.

### 2.2 Pirámide — Afiliados (ya cubierto)
- `fetchAfiliadosDemograficos(fondo?, range?, signal?)` existe y preserva
  `Sexo` (`'Femenino'|'Masculino'`) y `RangoEdad`. ✅

### 2.3 Pirámide — Pensionados (requiere nuevo transformador)
- `transformBeneficios` actual **descarta** `sexo`/`rangoedad` (suma por
  `entidad|fecha|tipobeneficio`). Para la pirámide por sexo/edad se añade:
  - `fetchBeneficiosDemograficos(entidad?, fondo?, range?, signal?)` en `apiService.ts`
    (espejo de `fetchAfiliadosDemograficos`).
  - `transformBeneficiosDemograficos(raw): BeneficioDemografico[]` en `dataTransformers.ts`,
    agrupando por `entidad|sexo|rangoedad|tipobeneficio|fecha|fondo` y conservando
    `CantidadPensionados = beneficio ?? null` (NO acumular a 0).
  - Nuevo tipo `BeneficioDemografico { Entidad, Fondo, FechaCorte, Sexo, RangoEdad,
    TipoBeneficio, CantidadPensionados: number | null }` en `types/suppen.ts`.
- **Pendiente verificar contra API real:** los valores concretos de `tipobeneficio`
  (p. ej. si existe uno que signifique "pensionado total" o si hay que sumar varios como
  "JUBILACION", "INVALIDEZ", etc.). No se asume de memoria; se confirma antes de
  implementar (ver SPEC §Decisiones 3).

### 2.4 Caching
React Query con defaults globales (`staleTime` 10 min, `gcTime` 30 min,
`placeholderData: prev => prev` en `main.tsx`). Query keys:
- `['rendimiento', fondo, entidad, desde, hasta]`
- `['afiliados-demograficos', fondo, desde, hasta]`
- `['beneficios-demograficos', fondo, desde, hasta]`
Se reutilizan los helpers `useReportQuery` y `useUrlParam` (ya existen).

---

## 3. Componentes UI

### Reporte 4 — `SimuladorChart` + formulario (ruta custom, no `createReportRoute`)
El simulador no encaja en `createReportRoute` porque sus "filtros" son números del
usuario, no el `FilterBar` estándar. Se propone ruta `createFileRoute('/simulador')`
con:
- `FilterBar` para `Fondo` + rango de fechas (acota el histórico de rentabilidad).
- Selector de `Entidad` (OPC) y chips `metrica` nominal/real vía `useUrlParam`
  (patrón idéntico a `RentabilidadRealChart.tsx:31`).
- Formulario local (inputs: saldo, aporte mensual, edad actual, edad retiro) con
  validación R4.6.
- `useReportQuery` para la rentabilidad de referencia; al resolver, se llama
  `calcularRentabilidadPromedio`.
- Render: monto proyectado (`formatCurrency`), `LineChart` año a año, y el aviso fijo
  R4.3. Si `promedio === null` → aviso R4.5, sin proyección.
- `ChartCard` para envolver; `ChartNote` para el aviso metodológico.

### Reporte 5 — `PiramideChart`
- `useReportQuery` para afiliados-demograficos y beneficios-demograficos (dos queries;
  el join/selección se hace en memoria, igual que en el reporte comisión-rentabilidad).
- Toggle afiliados/pensionados (R5.2); filtro OPC (R5.3); selector de corte (R5.4) vía
  `useUrlParam`.
- Recharts `<BarChart layout="vertical">` con `YAxis dataKey="RangoEdad" type="category"`
  (orden conservado del API), dos `<Bar>`:
  - `Masculino`: valor `−Cantidad` con `<YAxis tickFormatter={v => Math.abs(v)}>` y
    `Tooltip` que muestra el absoluto.
  - `Femenino`: valor `Cantidad` positivo.
- `CartesianGrid`, `Tooltip`, `Legend` con estilo dark/light existente.
- Filas con `null` (o ausentes) → barra vacía + etiqueta "no disponible" (R5.5). El eje
  conserva todos los `RangoEdad` devueltos; no se rellena 0.

---

## 4. Errores y datos faltantes
- Red/API: `ReportView` (skeleton, overlay refetch, `ErrorMessage` con retry). Sin
  cambios.
- Faltantes: regla transversal — `null` nunca se convierte en 0 ni se interpola.
  - Simulador: histórico insuficiente → aviso explícito (R4.5), sin proyección.
  - Pirámide: categoría/sexo/rango sin dato → "no disponible" visible (R5.5).
- Validación de inputs del simulador (R4.6) antes de proyectar.

---

## 5. Plan de implementación (tras aprobación, en esta rama)
1. Tipos + transformadores + helpers puros con tests Vitest:
   - `BeneficioDemografico` + `transformBeneficiosDemograficos`.
   - `calcularRentabilidadPromedio`, `proyeccionPension` (curva año a año).
2. `apiService.fetchBeneficiosDemograficos` (y `fetchRendimientoHistorico` según §2.1).
3. Ruta `/simulador` + `SimuladorChart` + formulario.
4. Ruta `/piramide` + `PiramideChart` + toggles/filtros.
5. Tabs/navegación, avisos metodológicos (`ChartNote`), luego
   `npm run lint && npm run typecheck && npm test`.

Verificación: `oxlint` + `tsc -b --noEmit` + `vitest run`. Confirmar contra la API real
los valores de `tipobeneficio` (pensionados) y que el rango de fechas por defecto trae
suficiente historia para el simulador.

---

## 6. Diferencias respecto al patrón estándar (conscientes)
- **`createReportRoute` no aplica al simulador**: sus controles son un formulario de
  números del usuario + selector de OPC, no el FilterBar puro. Se usa `useReportQuery`
  directo dentro de `createFileRoute`, reutilizando `FilterBar` solo para fondo/fechas.
- **Nuevo transformador para beneficios**: el existente pierde la dimensión
  sexo/edad que la pirámide requiere; se añade `transformBeneficiosDemograficos` en
  paralelo (no se muta el existente para no romper el reporte de Beneficios).
- **Cache fragmentada**: claves `['afiliados-demograficos']` / `['beneficios-demograficos']`
  distintas de `['afiliados']` / `['beneficios']` para no corromper cachés (los shapes
  difieren). Se acepta el refetch al alternar reportes.
