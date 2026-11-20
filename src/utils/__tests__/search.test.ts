import { describe, it, expect } from 'vitest'
import { normalizeText, matchesQuery } from '../search'

describe('normalizeText', () => {
  it('quita diacríticos y pasa a minúsculas', () => {
    expect(normalizeText('Comisión')).toBe('comision')
    expect(normalizeText('  RÖP  ')).toBe('rop')
    expect(normalizeText('Pirámide')).toBe('piramide')
  })
})

describe('matchesQuery', () => {
  it('una consulta vacía coincide con todo', () => {
    expect(matchesQuery('Cualquier cosa', '')).toBe(true)
  })

  it('encuentra sin distinguir acentos ni mayúsculas', () => {
    expect(matchesQuery('Comisiones de administración', 'comision')).toBe(true)
    expect(matchesQuery('Rentabilidad real', 'REAL')).toBe(true)
    expect(matchesQuery('Pirámide poblacional', 'piramide')).toBe(true)
  })

  it('rechaza cuando no hay coincidencia', () => {
    expect(matchesQuery('Portafolio', 'comision')).toBe(false)
  })
})