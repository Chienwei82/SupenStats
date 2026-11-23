# Sistema de insignias (gamificación)

Documentación del sistema de badges en `src/constants/badges.ts` y `src/hooks/useBadges.ts`.

## Visión general

SUPEN Stats incluye un sistema de 14 insignias desbloqueables que gamifican el aprendizaje financiero y la exploración de datos. Las insignias se almacenan en `localStorage` del navegador (sin backend) y nunca alteran los datos de SUPEN.

## Insignias disponibles

| ID | Nombre | Emoji | Categoría | Condición |
|----|--------|-------|-----------|-----------|
| `primer-reporte` | Primer reporte | 📊 | Exploración | Visitar ≥1 reporte |
| `explorador` | Explorador | 🧭 | Exploración | Visitar ≥5 reportes |
| `coleccionista` | Coleccionista | 🗂️ | Exploración | Visitar ≥10 reportes |
| `viajero-del-tiempo` | Viajero del tiempo | ⏳ | Exploración | Visitar `/simulador` |
| `glosario-iniciado` | Glosario iniciado | 📖 | Aprendizaje | Abrir glosario ≥1 vez |
| `quiz-perfecto` | Quiz perfecto | 💯 | Aprendizaje | Obtener 100% en quiz |
| `aprendiz-constante` | Aprendiz constante | 🎓 | Aprendizaje | Completar quiz ≥3 veces |
| `exportador` | Exportador | 📥 | Interacción | Descargar ≥1 CSV |
| `comparador` | Comparador | ⚖️ | Interacción | Usar comparador |
| `lider-de-slider` | Líder de slider | 🎚️ | Interacción | Usar slider en simulador |
| `estudiando-flashcards` | Estudiando con flashcards | 🃏 | Aprendizaje | Estudiar ≥1 flashcard |
| `adivinador` | Adivinador | 🔮 | Aprendizaje | Acertar ≥1 predicción |
| `triple-comparador` | Triple comparador | ⚖️ | Interacción | Usar comparador 3+ OPCs |
| `nocturno` | Nocturno | 🌙 | Personalización | Activar tema oscuro |

## Implementación técnica

### Estado de actividad (`UserActivityState`)

Almacenado en `localStorage` bajo la clave `supenstats_activity`. Todos los campos son opcionales con valores por defecto.

```typescript
interface UserActivityState {
  visitedRoutes: Set<string>
  glossaryVisits: number
  quizCompletions: number
  bestQuizScore: number
  csvExports: number
  darkModeUsed: boolean
  lastVisitDate: string | null
  sliderUsed: boolean
  flashcardStudied: number
  trendGuessesCorrect: number
  comparadorMultiOpc: boolean
}
```

### Condiciones puras

Cada insignia tiene una condición pura (función sin efectos secundarios) que se evalúa contra el estado actual:

```typescript
condition: (state: UserActivityState) => boolean
```

### Hook `useBadges`

Proporciona métodos para registrar actividad y consultar insignias:

| Método | Descripción |
|--------|-------------|
| `visitRoute(path)` | Registra visita a un reporte |
| `completeQuiz(score)` | Registra finalización de quiz |
| `recordSliderUse()` | Registra uso de slider |
| `studyFlashcard()` | Registra estudio de flashcard |
| `recordTrendGuess(correct)` | Registra predicción del mini-juego |
| `getUnlockedBadges(state)` | Devuelve insignias desbloqueadas |
| `getNewBadges(state, notifiedIds)` | Devuelve insignias nuevas no notificadas |

### Notificación (`BadgeToast`)

Cuando se desbloquea una insignia nueva, aparece una notificación flotante accesible con:
- `aria-live="polite"` para lectores de pantalla
- Cierre con tecla Escape
- Animación de entrada suave

## Ejemplo de uso

```typescript
const { visitRoute, completeQuiz, getNewBadges } = useBadges();

// Al visitar un reporte
visitRoute('/rendimiento');

// Al completar el quiz
completeQuiz(85);

// Obtener insignias nuevas para mostrar notificación
const state = cargarEstadoDesdeLocalStorage();
const nuevos = getNewBadges(state, notificadosIds);
```

## Extender el sistema

Para agregar una nueva insignia:

1. Agregar la entrada en `BADGES` array en `src/constants/badges.ts`
2. Definir su condición pura en el campo `condition`
3. Si necesita rastrear nuevo estado, agregar campo a `UserActivityState`
4. Agregar tests en `src/constants/__tests__/badges.test.ts`
5. Documentar en esta página

