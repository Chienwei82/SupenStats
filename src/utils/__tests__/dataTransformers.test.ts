import { describe, it, expect } from 'vitest'
import {
  parseDate, parseDateMs, sortByDateAsc, groupBy, getUniqueValues,
  calculateAverage, findMax, findMin, formatNumber, formatPercent,
} from '../dataTransformers'

describe('parseDate', () => {
  it('parsea ISO con tiempo', () => {
    expect(parseDate('2024-03-15T00:00:00').getFullYear()).toBe(2024)
    expect(parseDate('2024-03-15T00:00:00').getMonth()).toBe(2)
  })

  it('parsea YYYY-MM-DD en hora LOCAL (no UTC, evita el día-1 en CR)', () => {
    const d = parseDate('2024-03-15')
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(2)
    expect(d.getDate()).toBe(15)
    expect(d.getTime()).toBe(new Date(2024, 2, 15).getTime())
  })

  it('parsea DD/MM/YYYY (día > 12 desambigua) en hora local', () => {
    const d = parseDate('25/03/2024')
    expect(d.getDate()).toBe(25)
    expect(d.getMonth()).toBe(2)
  })

  it('string vacío → fecha lejana (ordena al final de la serie, no "hoy")', () => {
    const d = parseDate('')
    expect(Number.isNaN(d.getTime())).toBe(false)
    expect(d.getTime()).toBeGreaterThan(parseDate('2750-01-01').getTime())
  })

  it('nunca devuelve Invalid Date (garbage → fecha lejana)', () => {
    expect(Number.isNaN(parseDate('no es fecha').getTime())).toBe(false)
  })
})

describe('parseDateMs', () => {
  it('fechas vacías/garbage van al final del orden', () => {
    expect(parseDateMs('')).toBeGreaterThan(parseDateMs('2750-01-01'))
    expect(parseDateMs('basura')).toBeGreaterThan(parseDateMs('2750-01-01'))
    expect(parseDateMs('2024-01-15')).toBeLessThan(parseDateMs('2024-06-01'))
  })
})

describe('sortByDateAsc', () => {
  it('ordena ascendente sin mutar el original', () => {
    const data = [
      { f: '2024-06-01', v: 2 },
      { f: '2024-01-01', v: 1 },
      { f: '2024-12-01', v: 3 },
    ]
    const sorted = sortByDateAsc(data, 'f')
    expect(sorted.map(d => d.v)).toEqual([1, 2, 3])
    expect(data.map(d => d.v)).toEqual([2, 1, 3])
  })

  it('las fechas vacías van al final, no al inicio', () => {
    const sorted = sortByDateAsc(
      [{ f: '', v: 1 }, { f: '2024-01-01', v: 2 }, { f: '2020-06-01', v: 3 }],
      'f',
    )
    expect(sorted.map(d => d.v)).toEqual([3, 2, 1])
  })
})

describe('formatPercent / formatNumber', () => {
  it('no muestra 0 cuando el valor es null (no disponible)', () => {
    expect(formatPercent(null)).toBe('N/D')
    expect(formatNumber(null)).toBe('N/D')
  })

  it('formatea valores válidos como antes', () => {
    expect(formatPercent(8.5)).toBe('8.50%')
    expect(formatNumber(1250)).toBe(new Intl.NumberFormat('es-CR').format(1250))
  })
})

describe('groupBy', () => {
  it('agrupa por clave', () => {
    const data = [
      { e: 'A', v: 1 }, { e: 'B', v: 2 }, { e: 'A', v: 3 },
    ]
    const g = groupBy(data, 'e')
    expect(g['A']).toHaveLength(2)
    expect(g['B']).toHaveLength(1)
  })

  it('devuelve objeto vacío para entrada vacía', () => {
    expect(groupBy([], 'e')).toEqual({})
  })
})

describe('getUniqueValues', () => {
  it('deduplica preservando orden', () => {
    expect(getUniqueValues([{ k: 'b' }, { k: 'a' }, { k: 'b' }], 'k')).toEqual(['b', 'a'])
  })
})

describe('calculateAverage', () => {
  it('calcula promedio y maneja vacío', () => {
    expect(calculateAverage([2, 4, 6])).toBe(4)
    expect(calculateAverage([])).toBe(0)
  })
})

describe('findMax / findMin', () => {
  const data = [{ v: 5 }, { v: 9 }, { v: 1 }]
  it('encuentra máximo', () => {
    expect(findMax(data, 'v')?.v).toBe(9)
  })
  it('encuentra mínimo', () => {
    expect(findMin(data, 'v')?.v).toBe(1)
  })
  it('devuelve undefined para vacío', () => {
    expect(findMax([], 'v')).toBeUndefined()
    expect(findMin([], 'v')).toBeUndefined()
  })
})
