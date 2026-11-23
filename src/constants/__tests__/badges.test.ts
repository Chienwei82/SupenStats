import { describe, it, expect } from 'vitest'
import { BADGES, getUnlockedBadges, getNewBadges, EMPTY_STATE, type UserActivityState } from '../badges'

describe('BADGES', () => {
  it('tiene al menos una insignia por categoría', () => {
    const categories = new Set(BADGES.map(b => b.category))
    expect(categories.size).toBe(4)
    expect(categories.has('exploracion')).toBe(true)
    expect(categories.has('aprendizaje')).toBe(true)
    expect(categories.has('interaccion')).toBe(true)
    expect(categories.has('personalizacion')).toBe(true)
  })

  it('cada insignia tiene id, nombre, descripción, emoji, categoría y condición', () => {
    for (const badge of BADGES) {
      expect(typeof badge.id).toBe('string')
      expect(badge.id.length).toBeGreaterThan(0)
      expect(typeof badge.name).toBe('string')
      expect(typeof badge.description).toBe('string')
      expect(typeof badge.emoji).toBe('string')
      expect(typeof badge.condition).toBe('function')
    }
  })

  it('los IDs de insignia son únicos', () => {
    const ids = BADGES.map(b => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getUnlockedBadges', () => {
  it('no desbloquea nada con estado vacío', () => {
    const unlocked = getUnlockedBadges(EMPTY_STATE)
    expect(unlocked).toHaveLength(0)
  })

  it('desbloquea "primer-reporte" al visitar una ruta', () => {
    const state: UserActivityState = {
      ...EMPTY_STATE,
      visitedRoutes: new Set(['/rendimiento']),
    }
    const unlocked = getUnlockedBadges(state)
    expect(unlocked.some(b => b.id === 'primer-reporte')).toBe(true)
  })

  it('desbloquea "explorador" al visitar 5 rutas', () => {
    const state: UserActivityState = {
      ...EMPTY_STATE,
      visitedRoutes: new Set(['/a', '/b', '/c', '/d', '/e']),
    }
    const unlocked = getUnlockedBadges(state)
    expect(unlocked.some(b => b.id === 'explorador')).toBe(true)
  })

  it('no desbloquea "explorador" con menos de 5 rutas', () => {
    const state: UserActivityState = {
      ...EMPTY_STATE,
      visitedRoutes: new Set(['/a', '/b', '/c', '/d']),
    }
    const unlocked = getUnlockedBadges(state)
    expect(unlocked.some(b => b.id === 'explorador')).toBe(false)
  })

  it('desbloquea "quiz-perfecto" con puntuación 100', () => {
    const state: UserActivityState = {
      ...EMPTY_STATE,
      bestQuizScore: 100,
    }
    const unlocked = getUnlockedBadges(state)
    expect(unlocked.some(b => b.id === 'quiz-perfecto')).toBe(true)
  })

  it('no desbloquea "quiz-perfecto" con puntuación 99', () => {
    const state: UserActivityState = {
      ...EMPTY_STATE,
      bestQuizScore: 99,
    }
    const unlocked = getUnlockedBadges(state)
    expect(unlocked.some(b => b.id === 'quiz-perfecto')).toBe(false)
  })

  it('desbloquea "nocturno" al usar tema oscuro', () => {
    const state: UserActivityState = {
      ...EMPTY_STATE,
      darkModeUsed: true,
    }
    const unlocked = getUnlockedBadges(state)
    expect(unlocked.some(b => b.id === 'nocturno')).toBe(true)
  })

  it('desbloquea "exportador" al hacer una exportación', () => {
    const state: UserActivityState = {
      ...EMPTY_STATE,
      csvExports: 1,
    }
    const unlocked = getUnlockedBadges(state)
    expect(unlocked.some(b => b.id === 'exportador')).toBe(true)
  })

  it('desbloquea "comparador" al visitar la ruta del comparador', () => {
    const state: UserActivityState = {
      ...EMPTY_STATE,
      visitedRoutes: new Set(['/comparador']),
    }
    const unlocked = getUnlockedBadges(state)
    expect(unlocked.some(b => b.id === 'comparador')).toBe(true)
  })

  it('desbloquea "aprendiz-constante" tras 3 completaciones del quiz', () => {
    const state: UserActivityState = {
      ...EMPTY_STATE,
      quizCompletions: 3,
    }
    const unlocked = getUnlockedBadges(state)
    expect(unlocked.some(b => b.id === 'aprendiz-constante')).toBe(true)
  })

  it('desbloquea "glosarío-iniciado" tras visitar el glosario', () => {
    const state: UserActivityState = {
      ...EMPTY_STATE,
      glossaryVisits: 1,
    }
    const unlocked = getUnlockedBadges(state)
    expect(unlocked.some(b => b.id === 'glosarío-iniciado')).toBe(true)
  })

  it('desbloquea "viajero-del-tiempo" al visitar el simulador', () => {
    const state: UserActivityState = {
      ...EMPTY_STATE,
      visitedRoutes: new Set(['/simulador']),
    }
    const unlocked = getUnlockedBadges(state)
    expect(unlocked.some(b => b.id === 'viajero-del-tiempo')).toBe(true)
  })

  it('desbloquea "coleccionista" al visitar 10 rutas', () => {
    const routes = Array.from({ length: 10 }, (_, i) => `/ruta-${i}`)
    const state: UserActivityState = {
      ...EMPTY_STATE,
      visitedRoutes: new Set(routes),
    }
    const unlocked = getUnlockedBadges(state)
    expect(unlocked.some(b => b.id === 'coleccionista')).toBe(true)
  })
})

describe('getNewBadges', () => {
  it('excluye insignias ya notificadas', () => {
    const state: UserActivityState = {
      ...EMPTY_STATE,
      visitedRoutes: new Set(['/rendimiento']),
    }
    const notified = new Set(['primer-reporte'])
    const newBadges = getNewBadges(state, notified)
    expect(newBadges.some(b => b.id === 'primer-reporte')).toBe(false)
  })

  it('devuelve todas las desbloqueadas si ninguna está notificada', () => {
    const state: UserActivityState = {
      ...EMPTY_STATE,
      visitedRoutes: new Set(['/rendimiento']),
    }
    const newBadges = getNewBadges(state, new Set())
    expect(newBadges.some(b => b.id === 'primer-reporte')).toBe(true)
  })
})