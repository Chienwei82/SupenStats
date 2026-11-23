/**
 * Sistema de insignias (badges) — Fase 4A: gamificación ligera.
 *
 * Cada insignia tiene una condición pura (sin efectos secundarios) que se
 * evalúa contra el estado de actividad del usuario almacenado en localStorage.
 * Las condiciones nunca alteran los datos de SUPEN; solo miden la interacción
 * con la UI para desbloquear logros educativos.
 */

export type BadgeId = string

export interface Badge {
  /** Identificador único (clave en localStorage). */
  id: BadgeId
  /** Nombre mostrado al usuario. */
  name: string
  /** Descripción corta de cómo se desbloquea. */
  description: string
  /** Emoji usado como icono en la UI. */
  emoji: string
  /** Categoría para agrupar insignias relacionadas. */
  category: 'exploracion' | 'aprendizaje' | 'interaccion' | 'personalizacion'
  /** Condición pura: devuelve true si el estado actual desbloquea la insignia. */
  condition: (state: UserActivityState) => boolean
}

/** Estado de actividad del usuario (todo opcional, defaults a cero/vacío). */
export interface UserActivityState {
  /** Set de rutas de reportes visitadas. */
  visitedRoutes: Set<string>
  /** Número de veces que se ha abierto el glosario. */
  glossaryVisits: number
  /** Número de veces que se ha completado el quiz. */
  quizCompletions: number
  /** Mejor puntuación del quiz (0-100). */
  bestQuizScore: number
  /** Número de exportaciones CSV realizadas. */
  csvExports: number
  /** ¿Ha activado el tema oscuro al menos una vez? */
  darkModeUsed: boolean
  /** Última fecha de visita (ISO string) para calcular racha. */
  lastVisitDate: string | null
  /** ¿Ha usado al menos un slider del simulador? */
  sliderUsed: boolean
  /** Número de tarjetas de flashcards estudiadas. */
  flashcardStudied: number
  /** Número de aciertos en el mini-juego "Adivina la tendencia". */
  trendGuessesCorrect: number
  /** ¿Ha usado el comparador con 3+ operadoras? */
  comparadorMultiOpc: boolean
}

/** Estado vacío por defecto. */
export const EMPTY_STATE: UserActivityState = {
  visitedRoutes: new Set(),
  glossaryVisits: 0,
  quizCompletions: 0,
  bestQuizScore: 0,
  csvExports: 0,
  darkModeUsed: false,
  lastVisitDate: null,
  sliderUsed: false,
  flashcardStudied: 0,
  trendGuessesCorrect: 0,
  comparadorMultiOpc: false,
}

/** Lista de insignias disponibles. Las condiciones son funciones puras. */
export const BADGES: Badge[] = [
  // --- Exploración ---
  {
    id: 'primer-reporte',
    name: 'Primer reporte',
    description: 'Visita tu primer reporte estadístico.',
    emoji: '📊',
    category: 'exploracion',
    condition: s => s.visitedRoutes.size >= 1,
  },
  {
    id: 'explorador',
    name: 'Explorador',
    description: 'Visita 5 reportes diferentes.',
    emoji: '🧭',
    category: 'exploracion',
    condition: s => s.visitedRoutes.size >= 5,
  },
  {
    id: 'coleccionista',
    name: 'Coleccionista',
    description: 'Visita todos los reportes de una categoría temática.',
    emoji: '🗂️',
    category: 'exploracion',
    condition: s => s.visitedRoutes.size >= 10,
  },
  {
    id: 'viajero-del-tiempo',
    name: 'Viajero del tiempo',
    description: 'Visita el simulador de pensión y ajusta los parámetros.',
    emoji: '⏳',
    category: 'exploracion',
    condition: s => s.visitedRoutes.has('/simulador'),
  },
  // --- Aprendizaje ---
  {
    id: 'glosarío-iniciado',
    name: 'Glosario iniciado',
    description: 'Consulta el glosario de términos.',
    emoji: '📖',
    category: 'aprendizaje',
    condition: s => s.glossaryVisits >= 1,
  },
  {
    id: 'quiz-perfecto',
    name: 'Quiz perfecto',
    description: 'Obtén 100% de aciertos en el quiz educativo.',
    emoji: '💯',
    category: 'aprendizaje',
    condition: s => s.bestQuizScore >= 100,
  },
  {
    id: 'aprendiz-constante',
    name: 'Aprendiz constante',
    description: 'Completa el quiz 3 veces.',
    emoji: '🎓',
    category: 'aprendizaje',
    condition: s => s.quizCompletions >= 3,
  },
  // --- Interacción ---
  {
    id: 'exportador',
    name: 'Exportador',
    description: 'Descarga al menos un archivo CSV de datos.',
    emoji: '📥',
    category: 'interaccion',
    condition: s => s.csvExports >= 1,
  },
  {
    id: 'comparador',
    name: 'Comparador',
    description: 'Usa el comparador de dos operadoras.',
    emoji: '⚖️',
    category: 'interaccion',
    condition: s => s.visitedRoutes.has('/comparador'),
  },
  // --- Personalización ---
  {
    id: 'nocturno',
    name: 'Nocturno',
    description: 'Activa el tema oscuro.',
    emoji: '🌙',
    category: 'personalizacion',
    condition: s => s.darkModeUsed,
  },
  // --- Interacción ampliada (Fase 4B/4C) ---
  {
    id: 'lider-de-slider',
    name: 'Líder de slider',
    description: 'Ajusta cualquier parámetro con los sliders del simulador.',
    emoji: '🎚️',
    category: 'interaccion',
    condition: s => s.sliderUsed,
  },
  {
    id: 'estudiando-flashcards',
    name: 'Estudiando con flashcards',
    description: 'Estudia al menos una tarjeta del glosario en modo estudio.',
    emoji: '🃏',
    category: 'aprendizaje',
    condition: s => s.flashcardStudied >= 1,
  },
  {
    id: 'adivinador',
    name: 'Adivinador',
    description: 'Acerta al menos una predicción en "Adivina la tendencia".',
    emoji: '🔮',
    category: 'aprendizaje',
    condition: s => s.trendGuessesCorrect >= 1,
  },
  {
    id: 'triple-comparador',
    name: 'Triple comparador',
    description: 'Compara tres o más operadoras al mismo tiempo.',
    emoji: '⚖️',
    category: 'interaccion',
    condition: s => s.comparadorMultiOpc,
  },
]

/**
 * Evalúa qué insignias están desbloqueadas dado el estado actual.
 * Devuelve solo las insignias cuya condición se cumple.
 */
export function getUnlockedBadges(state: UserActivityState): Badge[] {
  return BADGES.filter(b => b.condition(state))
}

/**
 * Devuelve las insignias desbloqueadas que aún no han sido notificadas
 * (es decir, no están en `notifiedIds`).
 */
export function getNewBadges(
  state: UserActivityState,
  notifiedIds: Set<string>,
): Badge[] {
  return getUnlockedBadges(state).filter(b => !notifiedIds.has(b.id))
}