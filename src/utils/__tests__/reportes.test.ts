import { describe, it, expect } from 'vitest'
import {
  cortesDisponibles,
  compararRendimientos,
  joinComisionConRentabilidad,
  regresionLineal,
  calcularRentabilidadPromedio,
  proyeccionPension,
} from '../reportes'
import type { RendimientoComparado, Comision, RentabilidadSerie } from '../../types/suppen'

function rend(parcial: Partial<RendimientoComparado>): RendimientoComparado {
  return {
    Entidad: 'POPULAR PENSIONES',
    Fondo: 'ROP',
    FechaCorte: '2026-05-31',
    Periodicidad: 'ANUAL',
    Nominal: null,
    Real: null,
    ...parcial,
  }
}

describe('cortesDisponibles', () => {
  it('devuelve cortes únicos ordenados de la periodicidad pedida', () => {
    const rows = [
      rend({ FechaCorte: '2026-05-31' }),
      rend({ FechaCorte: '2026-04-30' }),
      rend({ FechaCorte: '2026-05-31', Periodicidad: '3 AÑOS' }),
    ]
    expect(cortesDisponibles(rows, 'ANUAL')).toEqual(['2026-04-30', '2026-05-31'])
    expect(cortesDisponibles(rows, '5 AÑOS')).toEqual([])
  })
})

describe('compararRendimientos', () => {
  it('pivotea NOMINAL y REAL a una fila por OPC en el corte dado', () => {
    const rows = [
      rend({ Entidad: 'A', Nominal: 10, Real: 8 }),
      rend({ Entidad: 'B', Nominal: 9 }),
      rend({ Entidad: 'B', Real: 7 }),
      rend({ Entidad: 'C', Nominal: 1, FechaCorte: '2026-01-31' }), // otro corte
      rend({ Entidad: 'D', Nominal: 1, Periodicidad: 'HISTÓRICA' }),
    ]
    const out = compararRendimientos(rows, 'ANUAL', '2026-05-31')
    expect(out).toHaveLength(2)
    const b = out.find(r => r.Entidad === 'B')
    expect(b?.Nominal).toBe(9)
    expect(b?.Real).toBe(7)
  })

  it('conserva null (no disponible) sin convertirlo a 0', () => {
    const rows = [rend({ Entidad: 'A', Nominal: 10 })] // sin REAL
    const out = compararRendimientos(rows, 'ANUAL', '2026-05-31')
    expect(out[0]?.Real).toBeNull()
  })
})

describe('joinComisionConRentabilidad', () => {
  const comision = (entidad: string, fecha: string, valor: number | null): Comision => ({
    Entidad: entidad,
    Fondo: 'ROP',
    FechaCorte: fecha,
    ComisionTotal: valor,
  })

  it('empareja en el corte común más reciente', () => {
    const comisiones = [comision('A', '2026-04-30', 0.35), comision('A', '2026-05-31', 0.4)]
    const rends = [
      rend({ Entidad: 'A', FechaCorte: '2026-05-31', Nominal: 10 }),
      rend({ Entidad: 'A', FechaCorte: '2026-04-30', Nominal: 11 }),
    ]
    const { corte, puntos } = joinComisionConRentabilidad(comisiones, rends, 'ANUAL')
    expect(corte).toBe('2026-05-31')
    expect(puntos).toEqual([{ Entidad: 'A', Comision: 0.4, Rentabilidad: 10 }])
  })

  it('lista aparte las OPC con par incompleto, con motivo', () => {
    const comisiones = [comision('A', '2026-05-31', 0.35)]
    const rends = [
      rend({ Entidad: 'B', Nominal: 10 }), // B tiene rentabilidad pero no comisión
    ]
    const { puntos, excluidos } = joinComisionConRentabilidad(comisiones, rends, 'ANUAL')
    // A no entra al scatter porque su rentabilidad es null
    expect(puntos).toEqual([])
    expect(excluidos).toContainEqual({ Entidad: 'A', Motivo: 'sin rentabilidad' })
    expect(excluidos).toContainEqual({ Entidad: 'B', Motivo: 'sin comisión' })
  })

  it('devuelve corte null si no hay cruce de fechas', () => {
    const out = joinComisionConRentabilidad(
      [comision('A', '2020-01-31', 1)],
      [rend({ FechaCorte: '2026-05-31', Nominal: 5 })],
      'ANUAL',
    )
    expect(out.corte).toBeNull()
    expect(out.puntos).toEqual([])
  })

  it('con métrica real excluye la OPC sin dato real y usa Real en el punto', () => {
    const comisiones = [comision('A', '2026-05-31', 0.35), comision('B', '2026-05-31', 0.35)]
    const rends = [
      rend({ Entidad: 'A', Nominal: 10 }), // sin REAL
      rend({ Entidad: 'B', Nominal: 9, Real: 6 }),
    ]
    const { puntos, excluidos } = joinComisionConRentabilidad(comisiones, rends, 'ANUAL', 'real')
    expect(puntos).toEqual([{ Entidad: 'B', Comision: 0.35, Rentabilidad: 6 }])
    expect(excluidos).toContainEqual({ Entidad: 'A', Motivo: 'sin rentabilidad real' })
  })

  it('no mezcla fondos distintos bajo la misma entidad', () => {
    const comisiones = [
      comision('A', '2026-05-31', 0.35),
      { ...comision('A', '2026-05-31', 0.2), Fondo: 'FCL' },
    ]
    const rends = [
      rend({ Entidad: 'A', Nominal: 10 }),
      rend({ Entidad: 'A', Nominal: 20, Fondo: 'FCL' }),
    ]
    const { puntos } = joinComisionConRentabilidad(comisiones, rends, 'ANUAL')
    expect(puntos).toHaveLength(2)
    // ROP con ROP y FCL con FCL: los pares no se cruzan entre fondos
    expect(puntos).toContainEqual({ Entidad: 'A', Comision: 0.35, Rentabilidad: 10 })
    expect(puntos).toContainEqual({ Entidad: 'A', Comision: 0.2, Rentabilidad: 20 })
  })

  it('excluye la OPC cuya comisión es null (no disponible)', () => {
    const comisiones = [comision('A', '2026-05-31', null)]
    const rends = [rend({ Entidad: 'A', Nominal: 10 })]
    const { puntos, excluidos } = joinComisionConRentabilidad(comisiones, rends, 'ANUAL')
    expect(puntos).toEqual([])
    expect(excluidos).toContainEqual({ Entidad: 'A', Motivo: 'sin comisión' })
  })
})

describe('regresionLineal', () => {
  it('calcula pendiente/intercepto/r exactos para una recta perfecta', () => {
    const out = regresionLineal([
      { Entidad: 'A', Comision: 0, Rentabilidad: 1 },
      { Entidad: 'B', Comision: 1, Rentabilidad: 3 },
      { Entidad: 'C', Comision: 2, Rentabilidad: 5 },
    ])
    expect(out?.pendiente).toBeCloseTo(2)
    expect(out?.intercepto).toBeCloseTo(1)
    expect(out?.r).toBeCloseTo(1)
  })

  it('devuelve null con menos de 2 puntos o varianza de X nula', () => {
    expect(regresionLineal([])).toBeNull()
    expect(regresionLineal([{ Entidad: 'A', Comision: 0.35, Rentabilidad: 5 }])).toBeNull()
    expect(regresionLineal([
      { Entidad: 'A', Comision: 0.35, Rentabilidad: 5 },
      { Entidad: 'B', Comision: 0.35, Rentabilidad: 8 },
    ])).toBeNull()
  })

  it('devuelve null cuando var(Y)=0 (r indefinido)', () => {
    expect(regresionLineal([
      { Entidad: 'A', Comision: 0, Rentabilidad: 7 },
      { Entidad: 'B', Comision: 1, Rentabilidad: 7 },
    ])).toBeNull()
  })

  it('pivotea por fondo+entidad: fondos distintos no se colapsan', () => {
    const rows = [
      rend({ Entidad: 'A', Nominal: 10 }),
      rend({ Entidad: 'A', Nominal: 20, Fondo: 'FCL' }),
    ]
    expect(compararRendimientos(rows, 'ANUAL', '2026-05-31')).toHaveLength(2)
  })
})

describe('calcularRentabilidadPromedio', () => {
  const serie = (opc: string, rent: number | null, fecha: string, tipo: 'NOMINAL' | 'REAL' = 'NOMINAL'): RentabilidadSerie => ({
    Entidad: opc, Fondo: 'ROP', FechaCorte: fecha, Tipo: tipo,
    Periodicidad: 'ANUAL', Rentabilidad: rent,
  })

  // 12 cortes ANUAL para superar MIN_CORTES_RENTABILIDAD.
  const docesCortes = (opc: string, vals: number[]): RentabilidadSerie[] =>
    vals.map((v, idx) => serie(opc, v, `2024-${String(idx + 1).padStart(2, '0')}-28`))

  it('promedia la serie ANUAL NOMINAL de la OPC', () => {
    const s = docesCortes('A', [8, 9, 10, 11, 12, 8, 9, 10, 11, 12, 8, 10])
    const out = calcularRentabilidadPromedio(s, 'A')
    expect(out.promedio).toBeCloseTo(118 / 12)
    expect(out.nCortes).toBe(12)
  })

  it('devuelve promedio null si hay menos de MIN_CORTES_RENTABILIDAD cortes', () => {
    const s = [serie('A', 8, '2024-01-31'), serie('A', 10, '2024-02-29')]
    const out = calcularRentabilidadPromedio(s, 'A')
    expect(out.promedio).toBeNull()
    expect(out.nCortes).toBe(2)
  })

  it('ignora periodicidades no ANUAL y tipos distintos', () => {
    const base = docesCortes('A', Array(12).fill(8))
    const s = [
      ...base,
      { ...serie('A', 99, '2024-12-31'), Periodicidad: 'HISTÓRICA' },
      { ...serie('A', 99, '2024-12-31'), Tipo: 'REAL' },
    ]
    expect(calcularRentabilidadPromedio(s, 'A').promedio).toBeCloseTo(8)
  })

  it('respeta el tipo REAL cuando se pide metrica real', () => {
    const vals = Array.from({ length: 12 }, (_, i) => (i % 2 === 0 ? 8 : 10))
    const s = docesCortes('A', vals).map(r => ({ ...r, Tipo: 'REAL' as const }))
    const out = calcularRentabilidadPromedio(s, 'A', 'real')
    expect(out.promedio).toBeCloseTo(9)
  })
})

describe('proyeccionPension', () => {
  it('capitaliza con aportes mensuales y tasa positiva', () => {
    const out = proyeccionPension({
      saldoInicial: 1_000_000, aporteMensual: 50_000, anios: 2, tasaAnual: 0.0, edadActual: 30,
    })
    // sin rentabilidad: 1M + 24 * 50k = 2.2M
    expect(out.montoFinal).toBeCloseTo(2_200_000)
    expect(out.curva).toHaveLength(2)
    expect(out.curva[0]).toMatchObject({ anio: 1, edad: 31 })
    expect(out.curva[1].edad).toBe(32)
  })

  it('crece más con tasa positiva que con tasa cero', () => {
    const cero = proyeccionPension({ saldoInicial: 1_000_000, aporteMensual: 0, anios: 10, tasaAnual: 0, edadActual: 40 })
    const conTasa = proyeccionPension({ saldoInicial: 1_000_000, aporteMensual: 0, anios: 10, tasaAnual: 0.07, edadActual: 40 })
    expect(conTasa.montoFinal).toBeGreaterThan(cero.montoFinal)
    expect(conTasa.montoFinal).toBeCloseTo(1_000_000 * Math.pow(1.07, 10), 0)
  })
})
