import { useState, useEffect, useCallback } from 'react'
import {
  BADGES,
  type Badge,
  type UserActivityState,
  EMPTY_STATE,
  getUnlockedBadges,
  getNewBadges,
} from '../constants/badges'

const STORAGE_KEY = 'supen-badges'
const NOTIFIED_KEY = 'supen-badges-notified'

/**
 * Hook de sistema de insignias.
 * - Lee el estado de actividad y las insignias ya notificadas desde localStorage.
 * - Proporciona `recordActivity` para actualizar el estado (visitas, quiz, exports, etc.).
 * - Devuelve las insignias desbloqueadas y las "nuevas" (aún no mostradas al usuario).
 * - Toda la lógica de condiciones vive en `constants/badges.ts` (funciones puras, testeables).
 */
function loadState(): UserActivityState {
  if (typeof window === 'undefined') return EMPTY_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...EMPTY_STATE,
        visitedRoutes: new Set(parsed.visitedRoutes ?? []),
        glossaryVisits: typeof parsed.glossaryVisits === 'number' ? parsed.glossaryVisits : 0,
        quizCompletions: typeof parsed.quizCompletions === 'number' ? parsed.quizCompletions : 0,
        bestQuizScore: typeof parsed.bestQuizScore === 'number' ? parsed.bestQuizScore : 0,
        csvExports: typeof parsed.csvExports === 'number' ? parsed.csvExports : 0,
        darkModeUsed: typeof parsed.darkModeUsed === 'boolean' ? parsed.darkModeUsed : false,
        lastVisitDate: typeof parsed.lastVisitDate === 'string' ? parsed.lastVisitDate : null,
      }
    }
    // notifiedRaw se carga por separado en loadNotifiedIds
  } catch {
    // localStorage no disponible o corrupto: usar estado vacío.
  }
  return EMPTY_STATE
}

function loadNotifiedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch {
    // Ignorar.
  }
  return new Set()
}

export function useBadges() {
  const [state, setState] = useState<UserActivityState>(loadState)
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(loadNotifiedIds)

  // Persistir cambios de estado en localStorage.
  useEffect(() => {
    try {
      const toStore = {
        ...state,
        visitedRoutes: [...state.visitedRoutes],
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
    } catch {
      // Ignorar si localStorage no está disponible.
    }
  }, [state])

  // Persistir notificaciones.
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...notifiedIds]))
    } catch {
      // Ignorar.
    }
  }, [notifiedIds])

  const unlocked = getUnlockedBadges(state)
  const newBadges = getNewBadges(state, notifiedIds)

  const recordActivity = useCallback(
    (updater: (prev: UserActivityState) => UserActivityState) => {
      setState(prev => {
        const next = updater(prev)
        return next
      })
    },
    [],
  )

  /** Marca una ruta como visitada. */
  const visitRoute = useCallback((route: string) => {
    recordActivity(prev => ({
      ...prev,
      visitedRoutes: new Set(prev.visitedRoutes).add(route),
      lastVisitDate: new Date().toISOString().split('T')[0],
    }))
  }, [recordActivity])

  /** Registra una visita al glosario. */
  const visitGlossary = useCallback(() => {
    recordActivity(prev => ({
      ...prev,
      glossaryVisits: prev.glossaryVisits + 1,
    }))
  }, [recordActivity])

  /** Registra una completación del quiz con una puntuación. */
  const completeQuiz = useCallback((score: number) => {
    recordActivity(prev => ({
      ...prev,
      quizCompletions: prev.quizCompletions + 1,
      bestQuizScore: Math.max(prev.bestQuizScore, score),
    }))
  }, [recordActivity])

  /** Registra una exportación CSV. */
  const recordExport = useCallback(() => {
    recordActivity(prev => ({
      ...prev,
      csvExports: prev.csvExports + 1,
    }))
  }, [recordActivity])

  /** Marca que se ha usado el tema oscuro. */
  const recordDarkMode = useCallback(() => {
    recordActivity(prev => ({
      ...prev,
      darkModeUsed: true,
    }))
  }, [recordActivity])

  /** Marca una insignia como notificada (ya se mostró al usuario). */
  const markNotified = useCallback((badgeId: string) => {
    setNotifiedIds(prev => new Set(prev).add(badgeId))
  }, [])

  /** Marca todas las insignias nuevas como notificadas. */
  const markAllNotified = useCallback(() => {
    setNotifiedIds(prev => {
      const next = new Set(prev)
      for (const b of newBadges) next.add(b.id)
      return next
    })
  }, [newBadges])

  return {
    state,
    unlocked,
    newBadges,
    visitRoute,
    visitGlossary,
    completeQuiz,
    recordExport,
    recordDarkMode,
    markNotified,
    markAllNotified,
    hasNew: newBadges.length > 0,
  }
}

/** Lista de todas las insignias disponibles (para UI de galería). */
export function allBadges(): Badge[] {
  return BADGES
}