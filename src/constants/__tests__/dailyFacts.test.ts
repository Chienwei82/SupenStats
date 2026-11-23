import { describe, it, expect } from 'vitest'
import { getDailyFact, DAILY_FACTS } from '../dailyFacts'

describe('getDailyFact', () => {
  it('devuelve un dato válido del array', () => {
    const fact = getDailyFact()
    expect(DAILY_FACTS.some(f => f.id === fact.id)).toBe(true)
  })

  it('devuelve el mismo dato en llamadas repetidas (mismo día)', () => {
    const fact1 = getDailyFact()
    const fact2 = getDailyFact()
    expect(fact1.id).toBe(fact2.id)
  })

  it('cada dato tiene id, título, contenido, emoji', () => {
    for (const fact of DAILY_FACTS) {
      expect(typeof fact.id).toBe('string')
      expect(fact.id.length).toBeGreaterThan(0)
      expect(typeof fact.title).toBe('string')
      expect(fact.title.length).toBeGreaterThan(0)
      expect(typeof fact.content).toBe('string')
      expect(fact.content.length).toBeGreaterThan(0)
      expect(typeof fact.emoji).toBe('string')
    }
  })

  it('los IDs de datos son únicos', () => {
    const ids = DAILY_FACTS.map(f => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})