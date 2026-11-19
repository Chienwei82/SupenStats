# Contribuir a SUPEN Stats

Proyecto educativo y de código abierto. No es oficial de la Superintendencia de
Pensiones (SUPEN) ni está afiliado a entes gubernamentales.

## Requisitos

- Node.js 18+ y npm 9+.
- Navegador moderno para probar la app.

## Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:3000
```

## Verificación obligatoria

Antes de abrir un PR:

```bash
npm run verify   # lint + typecheck + tests
npm run build    # comprueba que el build de producción funciona
```

## Convenciones

### Ramas

Usa el helper incluido (sanitiza nombres a kebab-case y sincroniza la rama base):

```bash
python3 scripts/git_new_branch.py --type feat --name "mi-reporte"
```

Tipos válidos: `feat`, `fix`, `chore`, `refactor`, `hotfix`, `docs`.

### Commits

Estilo Conventional Commits en español o inglés, por ejemplo:

```
feat(simulador): agregar comparación entre dos OPC
fix(filtros): preservar "Todos los fondos"
docs(readme): corregir arquitectura y puerto de desarrollo
```

### Reportes nuevos

Cada reporte nuevo debe incluir, en `docs/reportes/<nombre>/`:

- `SPEC.md`: objetivo, cálculos, requerimientos funcionales y manejo de errores.
- `DESIGN.md`: arquitectura, tipos, transformadores, plan de implementación.

Ubicación del código:

1. `src/api/apiService.ts` — fetcher (usa `assertArray` y respeta el timeout).
2. `src/types/supen.ts` — tipos de dominio **y** `Raw*` verificados contra la API.
3. `src/utils/dataTransformers.ts` — transformación raw → dominio.
4. `src/routes/<nombre>.tsx` — `createReportRoute<T>` (o variante local si el
   reporte compone varias queries).
5. `src/components/charts/` — gráfico con `ChartCard` + `ChartNote`.
6. `src/components/layout/ReportTabs.tsx` — alta en el menú.

### Reglas de datos (transversales)

- **Nunca convertir `null` en `0`.** Un valor ausente es "no disponible" y debe
  sobrevivir hasta la UI.
- No interpolar ni inventar cifras. Si falta un dato, la UI lo comunica.
- Documentar la fuente y las limitaciones en la nota educativa del gráfico.
- Verificar el shape real de la API en `docs/docs/api-notes.md` antes de crear
  un transformador.

### UI

- Todos los gráficos usan `ChartCard` (título, descripción accesible y
  `role="group"`).
- Los selectores de vista viven en la URL (`useUrlParam`) para que la vista sea
  compartible y funcione con back/forward.
- Respetar accesibilidad: etiquetas asociadas, `aria-pressed`, foco visible y
  `prefers-reduced-motion`.

## Tests

- Tests unitarios con Vitest en `src/**/__tests__/`.
- Priorizar lógica pura (transformers, cálculos de reportes, filtros).
- Componentes críticos (FilterBar, ReportTabs, Simulador) deberían cubrirse con
  Testing Library cuando se amplíe la suite.