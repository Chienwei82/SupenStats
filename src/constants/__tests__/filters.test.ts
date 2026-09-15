import { describe, it, expect } from 'vitest'
import { resolveFilters, sanitizeDate } from '../filters'
import { validateReportSearch } from '../../routes/-shared/reportRoute'
import { filtersToSearch } from '../../hooks/useReportQuery'

describe('filtersToSearch + resolveFilters (round-trip de "Todos los fondos")', () => {
  it('preserva fondo "" (Todos los fondos) en la URL y al resolver', () => {
    const applied = { fondo: '' as const, dates: { FechaInicio: '2024-01-01', FechaFinal: '2024-12-31' } }
    const search = filtersToSearch(applied)
    expect(search.fondo).toBe('')
    const resolved = resolveFilters(search, { fondo: 'ROP' as const, dates: { FechaInicio: '2020-01-01', FechaFinal: '2024-12-31' } })
    expect(resolved.fondo).toBe('')
  })

  it('no reemplaza un fondo explícito', () => {
    const search = filtersToSearch({ fondo: 'FCL', dates: { FechaInicio: '2024-01-01', FechaFinal: '2024-12-31' } })
    expect(search.fondo).toBe('FCL')
  })
})

describe('sanitizeDate / resolveFilters (rangos)', () => {
  const defaults = { fondo: 'ROP' as const, dates: { FechaInicio: '2024-01-01', FechaFinal: '2024-12-31' } }

  it('descarta fecha vacía hacia el default', () => {
    expect(sanitizeDate('')).toBeUndefined()
    expect(sanitizeDate(undefined as unknown as string)).toBeUndefined()
    const out = resolveFilters({ fechaInicio: '', fechaFinal: '' }, defaults)
    expect(out.dates).toEqual({ FechaInicio: '2024-01-01', FechaFinal: '2024-12-31' })
  })

  it('clampa fechas anteriores a 2010-01-01 (la API no tiene datos antes)', () => {
    expect(sanitizeDate('2005-06-30')).toBe('2010-01-01')
    const out = resolveFilters({ fechaInicio: '2005-06-30', fechaFinal: '2024-06-30' }, defaults)
    expect(out.dates?.FechaInicio).toBe('2010-01-01')
  })

  it('si Inicio > Final, cae a los defaults del reporte (evita payloads gigantes)', () => {
    const out = resolveFilters({ fechaInicio: '2024-12-31', fechaFinal: '2024-01-01' }, defaults)
    expect(out.dates).toEqual({ FechaInicio: '2024-01-01', FechaFinal: '2024-12-31' })
  })

  it('rechaza formatos no ISO y conserva rangos válidos', () => {
    expect(sanitizeDate('31/12/2024')).toBeUndefined()
    const out = resolveFilters({ fechaInicio: '2024-03-01', fechaFinal: '2024-06-30' }, defaults)
    expect(out.dates).toEqual({ FechaInicio: '2024-03-01', FechaFinal: '2024-06-30' })
  })

  it('rechaza valores no string (arrays de query param)', () => {
    expect(resolveFilters({ fondo: 'ROP' } as never, defaults).fondo).toBe('ROP')
  })
})

describe('validateReportSearch (zod como única fuente)', () => {
  it('convierte valores inválidos en undefined en vez de fallar o dejar basura', () => {
    expect(validateReportSearch({ fondo: ['ROP'] })).toEqual({})
    expect(validateReportSearch({ metrica: 'bogus' }).metrica).toBeUndefined()
    expect(validateReportSearch({ metrica: 'real' }).metrica).toBe('real')
  })

  it('descarta claves no del schema (vista/variacion no deben colarse)', () => {
    const out = validateReportSearch({ fondo: 'ROP', vista: 'neto' })
    expect(out).not.toHaveProperty('vista')
  })

  it('pasa strings válidos tal cual', () => {
    const out = validateReportSearch({ fondo: 'FCL', fechaInicio: '2024-01-01', entidad: 'BN-VITAL' })
    expect(out).toMatchObject({ fondo: 'FCL', fechaInicio: '2024-01-01', entidad: 'BN-VITAL' })
  })
})