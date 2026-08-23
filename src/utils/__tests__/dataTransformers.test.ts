import { describe, it, expect } from 'vitest'
import {
  parseDate, sortByDateAsc, groupBy, getUniqueValues,
  calculateAverage, findMax, findMin,
} from '../dataTransformers'

describe('parseDate', () => {
  it('parsea ISO con tiempo', () => {
    expect(parseDate('2024-03-15T00:00:00').getFullYear()).toBe(2024)
    expect(parseDate('2024-03-15T00:00:00').getMonth()).toBe(2)
  })

  it('parsea YYYY-MM-DD', () => {
    const d = parseDate('2024-03-15')
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(2)
    expect(d.getDate()).toBe(15)
  })

  it('parsea DD/MM/YYYY (día > 12 desambigua)', () => {
    const d = parseDate('25/03/2024')
    expect(d.getDate()).toBe(25)
    expect(d.getMonth()).toBe(2)
  })

  it('devuelve fecha actual para string vacío', () => {
    const now = new Date()
    const d = parseDate('')
    expect(Math.abs(d.getTime() - now.getTime())).toBeLessThan(5000)
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
