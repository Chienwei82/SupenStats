# Referencia de Custom Hooks

Documentación de los hooks personalizados en `src/hooks/`.

## useReportQuery

Hook principal para consultar datos de reportes de SUPEN con React Query.

```typescript
const { data, loading, error, refetch } = useReportQuery<Rendimiento>(
  ['rendimiento', fondo, fechaInicio, fechaFinal],
  signal => fetchRendimiento(fondo, undefined, dates, signal),
  { enabled: esPestañaActiva }
);
```

**Parámetros:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `queryKey` | `string[]` | Clave de caché de React Query |
| `fetchFn` | `(signal) => Promise<T[]>` | Función de fetch con AbortSignal |
| `options?` | `UseQueryOptions` | Opciones adicionales (enabled, staleTime, etc.) |

**Características:**
- Lazy loading: solo consulta cuando `enabled` es true
- Caché automática de React Query
- Manejo de loading, error y refetch
- Integración con `ReportView` para estados de UI

## useUrlParam

Lee y escribe un parámetro simple en la URL (search params).

```typescript
const [metrica, setMetrica] = useUrlParam<'nominal' | 'real'>(
  'metrica',
  (v): v is 'nominal' | 'real' => v === 'real' || v === 'nominal',
  'nominal'
);
```

**Casos de uso:** métrica nominal/real, periodicidad, corte, vista (gráfico/tabla).

## useUrlFilters

Patrón draft/applied sobre los search params de la URL.

```typescript
const { draft, setDraft, consult, reset } = useUrlFilters(defaults);
```

Permite editar filtros en un estado temporal (draft) y aplicarlos cuando el usuario lo desee.

## useBadges

Hook del sistema de insignias (gamificación). Almacena la actividad en `localStorage`.

```typescript
const { 
  visitRoute, 
  completeQuiz, 
  recordSliderUse, 
  studyFlashcard, 
  recordTrendGuess,
  getUnlockedBadges,
  getNewBadges
} = useBadges();
```

**Métodos disponibles:**

| Método | Descripción |
|--------|-------------|
| `visitRoute(path)` | Registra visita a un reporte |
| `completeQuiz(score)` | Registra finalización de quiz con puntuación |
| `recordSliderUse()` | Registra uso de slider en simulador |
| `studyFlashcard()` | Registra estudio de flashcard en glosario |
| `recordTrendGuess(correct)` | Registra predicción en "Adivina la tendencia" |
| `getUnlockedBadges(state)` | Devuelve insignias desbloqueadas |
| `getNewBadges(state, notifiedIds)` | Devuelve insignias nuevas no notificadas |

**Estado rastreado:**
- `visitedRoutes` — rutas de reportes visitadas
- `glossaryVisits` — visitas al glosario
- `quizCompletions` — veces completado el quiz
- `bestQuizScore` — mejor puntuación (0-100)
- `csvExports` — exportaciones CSV
- `darkModeUsed` — uso de tema oscuro
- `lastVisitDate` — última fecha de visita
- `sliderUsed` — uso de sliders
- `flashcardStudied` — tarjetas estudiadas
- `trendGuessesCorrect` — aciertos en mini-juego
- `comparadorMultiOpc` — uso de comparador 3+ OPCs

## useTheme

Gestión del tema claro/oscuro con persistencia.

```typescript
const { theme, toggleTheme } = useTheme();
```

## useInflacion

Obtiene datos de inflación del BCCR para ajustes de poder adquisitivo.

```typescript
const { inflacion, integracionActiva, error } = useInflacion();
```

## useSortableTable

Lógica de ordenamiento para tablas de datos.

