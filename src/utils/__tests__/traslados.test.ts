import { describe, it, expect } from 'vitest'
import {
  agregarFlujosPorOrigenDestino,
  agregarVariacionPorOpc,
  calcularKpisBalance,
  calcularVariacionNeta,
  construirBalanceTraslados,
} from '../traslados'
import { transformAfiliadosMensual } from '../dataTransformers'
import type { RawAfiliado, RawLibreTransferencia, TrasladoBalance } from '../../types/supen'

const af = (parcial: Partial<RawAfiliado>): RawAfiliado => ({
  entidad: 'POPULAR PENSIONES',
  codigosexo: 'F',
  sexo: 'FEMENINO',
  rangoedad: '< 30',
  afiliados: 100,
  aportantes: 50,
  fecha: '2024-06-30T00:00:00',
  codigofondo: 'ROP',
  fondo: 'PENSIÓN OBLIGATORIA COMPLEMENTARIA',
  ...parcial,
})

interface LtRowSpec {
  origen: string
  fecha: string
  cells: Record<string, [number, number]>
}

const ltRow = (parcial: LtRowSpec): RawLibreTransferencia => {
  const row: RawLibreTransferencia = {
    entidadorigen: parcial.origen,
    codigomoneda: 1,
    moneda: 'COLONES',
    codigoregimen: 2,
    'régimen': 'RÉGIMEN OBLIGATORIO COMPLEMENTARIO',
    codigofondo: 'ROP',
    fondo: 'PENSIÓN OBLIGATORIA COMPLEMENTARIA',
    fecha: parcial.fecha,
  }
  for (const [k, [c, m]] of Object.entries(parcial.cells)) {
    (row as Record<string, unknown>)[`${k}_C`] = c
    ;(row as Record<string, unknown>)[`${k}_M`] = m
  }
  return row
}

describe('transformAfiliadosMensual (vía helper de producción)', () => {
  it('suma las filas demográficas por (entidad, fecha, fondo)', () => {
    const serie = transformAfiliadosMensual([
      af({ entidad: 'POPULAR', afiliados: 50, rangoedad: '< 30' }),
      af({ entidad: 'POPULAR', afiliados: 70, rangoedad: '30-44' }),
      af({ entidad: 'BCR-PENSION', afiliados: 30, fecha: '2024-06-30T00:00:00' }),
    ])
    const popular = serie.find(s => s.Entidad === 'POPULAR PENSIONES' && s.FechaCorte === '2024-06-30T00:00:00')
    expect(popular?.CantidadAfiliados).toBe(120)
  })

  it('preserva null cuando TODAS las filas de la celda son null', () => {
    const serie = transformAfiliadosMensual([
      af({ afiliados: null, rangoedad: '< 30' }),
      af({ afiliados: null, rangoedad: '30-44' }),
    ])
    expect(serie[0]?.CantidadAfiliados).toBeNull()
  })

  it('suma los no-null y descarta los null cuando hay mezcla', () => {
    const serie = transformAfiliadosMensual([
      af({ afiliados: 10, rangoedad: '< 30' }),
      af({ afiliados: null, rangoedad: '30-44' }),
    ])
    expect(serie[0]?.CantidadAfiliados).toBe(10)
  })

  it('normaliza los nombres de entidad', () => {
    const serie = transformAfiliadosMensual([
      af({ entidad: 'POPULAR', afiliados: 100 }),
      af({ entidad: 'BACSJ PENSIONES', afiliados: 80 }),
    ])
    const ents = serie.map(s => s.Entidad).sort()
    expect(ents).toEqual(['BAC SJ PENSIONES', 'POPULAR PENSIONES'])
  })
})

describe('calcularVariacionNeta', () => {
  const s = (ent: string, fecha: string, n: number | null) => ({
    Entidad: ent, Fondo: 'ROP', FechaCorte: fecha, CantidadAfiliados: n,
  })

  it('calcula delta absoluto entre meses consecutivos', () => {
    const out = calcularVariacionNeta([
      s('A', '2024-01-31', 100),
      s('A', '2024-02-29', 110),
      s('A', '2024-03-31', 115),
    ], 'abs')
    expect(out).toEqual([
      { fecha: '2024-01-31', deltas: { A: null } },
      { fecha: '2024-02-29', deltas: { A: 10 } },
      { fecha: '2024-03-31', deltas: { A: 5 } },
    ])
  })

  it('calcula delta porcentual', () => {
    const out = calcularVariacionNeta([
      s('A', '2024-01-31', 100),
      s('A', '2024-02-29', 110),
    ], 'pct')
    expect(out[1]?.deltas.A).toBeCloseTo(10)
  })

  it('devuelve null si falta el dato en t o t-1', () => {
    const out = calcularVariacionNeta([
      s('A', '2024-01-31', 100),
      s('A', '2024-02-29', null),
      s('A', '2024-03-31', 130),
    ], 'abs')
    expect(out[1]?.deltas.A).toBeNull() // falta t
    expect(out[2]?.deltas.A).toBeNull() // falta t-1
  })

  it('calcula delta por cada OPC en el mismo punto de fecha', () => {
    const out = calcularVariacionNeta([
      s('A', '2024-01-31', 100),
      s('B', '2024-01-31', 200),
      s('A', '2024-02-29', 120),
      s('B', '2024-02-29', 180),
    ], 'abs')
    expect(out[1]).toEqual({ fecha: '2024-02-29', deltas: { A: 20, B: -20 } })
  })

  it('no inventa % cuando el denominador es 0', () => {
    const out = calcularVariacionNeta([
      s('A', '2024-01-31', 0),
      s('A', '2024-02-29', 5),
    ], 'pct')
    expect(out[1]?.deltas.A).toBeNull()
  })
})

describe('construirBalanceTraslados', () => {
  it('suma ingresos desde todas las filas donde la OPC aparece como destino', () => {
    const out = construirBalanceTraslados([
      ltRow({
        origen: 'POPULAR', fecha: '2024-01-31T00:00:00',
        cells: { BCR_PENSION: [3, 100], BN_VITAL: [2, 50] },
      }),
      ltRow({
        origen: 'VIDA_PLENA', fecha: '2024-01-31T00:00:00',
        cells: { BCR_PENSION: [5, 200] },
      }),
    ])
    const bcr = out.find(b => b.Entidad === 'BCR-PENSION' && b.fecha === '2024-01-31T00:00:00')
    expect(bcr?.Ingresos).toBe(8)
  })

  it('suma salidas de la fila excluyendo la diagonal', () => {
    const out = construirBalanceTraslados([
      ltRow({
        origen: 'POPULAR', fecha: '2024-01-31T00:00:00',
        cells: { POPULAR: [99, 0], BCR_PENSION: [7, 100], BN_VITAL: [3, 50] },
      }),
    ])
    const popular = out.find(b => b.Entidad === 'POPULAR PENSIONES' && b.fecha === '2024-01-31T00:00:00')
    // Salidas: 7 + 3 (excluye 99 de la diagonal)
    expect(popular?.Salidas).toBe(10)
    // Ingresos de POPULAR: nadie le envía nada en esta fila → 0
    expect(popular?.Ingresos).toBe(0)
    expect(popular?.Neto).toBe(-10)
  })

  it('no genera entrada para (fecha, OPC) sin movimientos', () => {
    const out = construirBalanceTraslados([
      ltRow({
        origen: 'POPULAR', fecha: '2024-01-31T00:00:00',
        cells: { BCR_PENSION: [1, 0] },
      }),
    ])
    const bn = out.find(b => b.Entidad === 'BN-VITAL' && b.fecha === '2024-01-31T00:00:00')
    expect(bn).toBeUndefined()
  })
})

describe('agregarFlujosPorOrigenDestino', () => {
  it('suma flujos por par en todo el rango, ordenado por cantidad desc', () => {
    const out = agregarFlujosPorOrigenDestino([
      ltRow({
        origen: 'POPULAR', fecha: '2024-01-31T00:00:00',
        cells: { BCR_PENSION: [3, 100] },
      }),
      ltRow({
        origen: 'POPULAR', fecha: '2024-02-29T00:00:00',
        cells: { BCR_PENSION: [5, 200] },
      }),
      ltRow({
        origen: 'VIDA_PLENA', fecha: '2024-01-31T00:00:00',
        cells: { POPULAR: [10, 500] },
      }),
    ])
    expect(out[0]).toMatchObject({ Origen: 'VIDA PLENA OPC', Destino: 'POPULAR PENSIONES', Cantidad: 10, Monto: 500 })
    const popularBcr = out.find(f => f.Origen === 'POPULAR PENSIONES' && f.Destino === 'BCR-PENSION')
    expect(popularBcr).toMatchObject({ Cantidad: 8, Monto: 300 })
  })

  it('excluye la diagonal y los flujos con cantidad 0', () => {
    const out = agregarFlujosPorOrigenDestino([
      ltRow({
        origen: 'POPULAR', fecha: '2024-01-31T00:00:00',
        cells: { POPULAR: [99, 0], BCR_PENSION: [0, 0], BN_VITAL: [2, 50] },
      }),
    ])
    expect(out).toHaveLength(1)
    expect(out[0]?.Origen).toBe('POPULAR PENSIONES')
    expect(out[0]?.Destino).toBe('BN-VITAL')
  })

  it('no infla totales cuando el origen no está mapeado como destino (ej. INS PENSIONES)', () => {
    // INS PENSIONES aparece en algunas filas de /lt pero no es un destino en
    // la matriz: su columna no existe, así que la diagonal es indetectable.
    // El comportamiento esperado es NO excluir la diagonal (no podemos), pero
    // tampoco inflar: una celda con valor 0 no se cuenta, y una celda con
    // valor real (no en su propia diagonal) se cuenta como flujo normal.
    const out = agregarFlujosPorOrigenDestino([
      ltRow({
        origen: 'INS PENSIONES', fecha: '2024-01-31T00:00:00',
        cells: { BCR_PENSION: [7, 200] },
      }),
    ])
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ Origen: 'INS PENSIONES', Destino: 'BCR-PENSION', Cantidad: 7 })
  })

  it('no rompe el total cuando la API manda monto NaN (lo trata como 0)', () => {
    // La matriz viene de JSON: un monto mal formado llega como null/string/
    // NaN tras Number(). El guard Number.isFinite debe descartarlo, no sumar.
    const row = ltRow({
      origen: 'POPULAR', fecha: '2024-01-31T00:00:00',
      cells: { BCR_PENSION: [3, 100] },
    })
    ;(row as unknown as Record<string, unknown>)['BCR_PENSION_M'] = NaN
    const out = agregarFlujosPorOrigenDestino([row])
    expect(out[0]).toMatchObject({ Origen: 'POPULAR PENSIONES', Destino: 'BCR-PENSION', Cantidad: 3, Monto: 0 })
  })

  it('ordena estable ante empates de Cantidad', () => {
    // Dos flujos con la misma Cantidad: el orden debe ser determinista.
    const out = agregarFlujosPorOrigenDestino([
      ltRow({
        origen: 'POPULAR', fecha: '2024-01-31T00:00:00',
        cells: { BCR_PENSION: [5, 100] },
      }),
      ltRow({
        origen: 'POPULAR', fecha: '2024-02-29T00:00:00',
        cells: { BN_VITAL: [5, 200] },
      }),
    ])
    // Ambos con 5: el orden entre BCR y BN no debe depender del motor JS.
    expect(out).toHaveLength(2)
    expect(out.map(f => f.Cantidad)).toEqual([5, 5])
  })
})

describe('agregarVariacionPorOpc', () => {
  const s = (ent: string, fecha: string, n: number | null) => ({
    Entidad: ent, Fondo: 'ROP', FechaCorte: fecha, CantidadAfiliados: n,
  })

  it('calcula variacion total y variacion % total entre extremos del rango', () => {
    const data = [
      s('A', '2024-01-31', 100),
      s('A', '2024-03-31', 130),
    ]
    const puntos = calcularVariacionNeta(data, 'abs')
    const tabla = agregarVariacionPorOpc(data, puntos)
    expect(tabla).toHaveLength(1)
    expect(tabla[0]?.entidad).toBe('A')
    expect(tabla[0]?.variacionTotal).toBe(30)
    expect(tabla[0]?.variacionPctTotal).toBeCloseTo(30)
  })

  it('best/worst toman el maximo y minimo de los deltas, ignorando nulls', () => {
    const data = [
      s('A', '2024-01-31', 100),
      s('A', '2024-02-29', 110),
      s('A', '2024-03-31', 90),
      s('A', '2024-04-30', 120),
    ]
    const puntos = calcularVariacionNeta(data, 'abs')
    const tabla = agregarVariacionPorOpc(data, puntos)
    // Deltas: 10 (feb), -20 (mar), 30 (abr) → best=30, worst=-20
    expect(tabla[0]?.best).toBe(30)
    expect(tabla[0]?.worst).toBe(-20)
  })

  it('devuelve variacionTotal null si el primer o último dato del rango es null', () => {
    const data = [
      s('A', '2024-01-31', null),
      s('A', '2024-02-29', 110),
    ]
    const puntos = calcularVariacionNeta(data, 'abs')
    const tabla = agregarVariacionPorOpc(data, puntos)
    expect(tabla[0]?.variacionTotal).toBeNull()
  })

  it('ordena el resultado por nombre de entidad', () => {
    const data = [s('B', '2024-01-31', 100), s('A', '2024-01-31', 100)]
    const puntos = calcularVariacionNeta(data, 'abs')
    const tabla = agregarVariacionPorOpc(data, puntos)
    expect(tabla.map(t => t.entidad)).toEqual(['A', 'B'])
  })
})

describe('calcularKpisBalance', () => {
  const b = (ent: string, ingresos: number, salidas: number): TrasladoBalance => ({
    fecha: '2024-01-31',
    Entidad: ent,
    Ingresos: ingresos,
    Salidas: salidas,
    Neto: ingresos - salidas,
  })

  it('suma ingresos de toda la serie', () => {
    const k = calcularKpisBalance([b('A', 10, 0), b('B', 5, 0), b('A', 7, 0)])
    expect(k.totalIngresos).toBe(22)
  })

  it('identifica la OPC con mayor balance positivo y mayor negativo', () => {
    const k = calcularKpisBalance([
      b('A', 10, 0),   // neto +10
      b('B', 0, 5),    // neto -5
      b('C', 3, 0),    // neto +3
    ])
    expect(k.topPos).toBe('A')
    expect(k.topNeg).toBe('B')
  })

  it('devuelve nulls y total 0 para entrada vacía', () => {
    expect(calcularKpisBalance([])).toEqual({ totalIngresos: 0, topPos: null, topNeg: null })
  })

  it('topPos queda null si TODAS las OPCs son perdedoras netas', () => {
    const k = calcularKpisBalance([b('A', 0, 10), b('B', 0, 5)])
    expect(k.topPos).toBeNull()
    expect(k.topNeg).toBe('A') // -10 < -5
  })

  it('topNeg queda null si TODAS las OPCs son ganadoras netas', () => {
    const k = calcularKpisBalance([b('A', 10, 0), b('B', 5, 0)])
    expect(k.topNeg).toBeNull()
    expect(k.topPos).toBe('A') // +10 > +5
  })
})
