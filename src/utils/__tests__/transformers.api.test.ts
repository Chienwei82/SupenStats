import { describe, it, expect } from 'vitest'
import {
  transformComisiones, transformRendimientos, transformPortafolio,
  transformAfiliados, transformAfiliadosAportantes,
  transformAfiliadosDemograficos, transformBeneficios,
  transformCuentas, transformLibreTransferencia, transformPortafolioISIN,
} from '../dataTransformers'
import type {
  RawComision, RawRendimiento, RawPortafolio, RawAfiliado,
  RawBeneficio, RawCuenta, RawLibreTransferencia, RawPortafolioISIN,
} from '../../types/suppen'

describe('transformComisiones', () => {
  it('filtra solo tipo SALDO y agrega por entidad+fecha', () => {
    const raw: RawComision[] = [
      { entidad: 'POPULAR', tipo: 'SALDO', 'comisión': 0.35, fecha: '2024-01-01', codigoregimen: 1, 'régimen': 'ROP', codigofondo: 'ROP', fondo: 'ROP' },
      { entidad: 'POPULAR', tipo: 'APORTE', 'comisión': 1.5, fecha: '2024-01-01', codigoregimen: 1, 'régimen': 'ROP', codigofondo: 'ROP', fondo: 'ROP' },
      { entidad: 'BCR-PENSION', tipo: 'SALDO', 'comisión': 0.35, fecha: '2024-01-01', codigoregimen: 1, 'régimen': 'ROP', codigofondo: 'ROP', fondo: 'ROP' },
    ]
    const result = transformComisiones(raw)
    expect(result).toHaveLength(2)
    const popular = result.find(r => r.Entidad === 'POPULAR PENSIONES')
    expect(popular?.ComisionTotal).toBe(0.35)
  })

  it('trata comisión null como 0', () => {
    const raw: RawComision[] = [
      { entidad: 'BN-VITAL', tipo: 'SALDO', 'comisión': null, fecha: '2024-01-01', codigoregimen: 1, 'régimen': 'ROP', codigofondo: 'ROP', fondo: 'ROP' },
    ]
    expect(transformComisiones(raw)[0]?.ComisionTotal).toBe(0)
  })
})

describe('transformRendimientos', () => {
  it('combina NOMINAL y REAL por entidad+fecha con periodicidad ANUAL', () => {
    const base = { periodicidad: 'ANUAL', codigofondo: 'ROP' }
    const raw = [
      { ...base, entidad: 'POPULAR', tipo: 'NOMINAL', rentabilidad: 8.5, fecha: '2023-12-31' },
      { ...base, entidad: 'POPULAR', tipo: 'REAL', rentabilidad: 3.2, fecha: '2023-12-31' },
      { ...base, entidad: 'POPULAR', tipo: 'NOMINAL', rentabilidad: 99, fecha: '2023-12-31', periodicidad: '5 AÑOS' },
    ] as unknown as RawRendimiento[]
    const result = transformRendimientos(raw)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      Entidad: 'POPULAR PENSIONES',
      RendimientoNominal: 8.5,
      RendimientoReal: 3.2,
    })
  })
})

describe('transformPortafolio', () => {
  it('mapea campos y trata monto null como 0', () => {
    const raw = { entidad: 'CCSS-OPC', instrumento: 'BONOS', montocolones: null, fecha: '2024-05-01', codigofondo: 'ROP' } as unknown as RawPortafolio
    const r = transformPortafolio(raw)
    expect(r).toMatchObject({ Entidad: 'CCSS-OPC', TipoInstrumento: 'BONOS', Monto: 0 })
  })
})

describe('transformAfiliados', () => {
  it('suma afiliados desglosados por sexo/edad a total por entidad+fecha', () => {
    const item = (afiliados: number): RawAfiliado => ({
      entidad: 'POPULAR', codigofondo: 'ROP', fecha: '2024-03-01', fondo: 'ROP',
      afiliados, sexo: 'MASCULINO', codigosexo: 'M', rangoedad: '25-30', aportantes: 0,
    })
    const result = transformAfiliados([item(100), item(50), { ...item(10), entidad: 'BCR-PENSION' }])
    expect(result).toHaveLength(2)
    expect(result.find(r => r.Entidad === 'POPULAR PENSIONES')?.CantidadAfiliados).toBe(150)
  })
})

describe('transformAfiliadosAportantes', () => {
  it('preserva afiliados y aportantes por entidad+fecha+fondo', () => {
    const item = (a: number, ap: number): RawAfiliado => ({
      entidad: 'VIDA PLENA', codigofondo: 'VOL', fecha: '2024-03-01', fondo: 'VOL',
      afiliados: a, aportantes: ap, sexo: '', codigosexo: '', rangoedad: '',
    })
    const result = transformAfiliadosAportantes([item(200, 120), item(100, 80)])
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ CantidadAfiliados: 300, CantidadAportantes: 200 })
  })
})

describe('transformAfiliadosDemograficos', () => {
  it('normaliza sexo desde código', () => {
    const item = (codigosexo: string): RawAfiliado => ({
      entidad: 'POPULAR', codigofondo: 'ROP', fecha: '2024-03-01', fondo: 'ROP',
      afiliados: 7, sexo: 'X', codigosexo, rangoedad: '31-35', aportantes: 0,
    })
    const result = transformAfiliadosDemograficos([item('F'), item('M')])
    expect(result.map(r => r.Sexo).sort()).toEqual(['Femenino', 'Masculino'])
  })
})

describe('transformBeneficios', () => {
  it('suma pensionados y montos por entidad+fecha+tipo', () => {
    const item = (b: number, m: number): RawBeneficio => ({
      entidad: 'CCSS-OPC', codigofondo: 'ROP', fecha: '2024-06-01', fondo: 'ROP',
      tipobeneficio: 'VEJEZ', beneficio: b, beneficiocolones: m,
      sexo: '', rangoedad: '',
    })
    const result = transformBeneficios([item(10, 500_000), item(5, 250_000)])
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ CantidadPensionados: 15, MontoBeneficios: 750_000 })
  })
})

describe('transformCuentas', () => {
  it('agrega montos por categoría contable', () => {
    const item = (m: number): RawCuenta => ({
      entidad: 'BAC SJ PENSIONES', codigofondo: 'ROP', fecha: '2024-06-01', fondo: 'ROP',
      cuenta: 'ACTIVO', montocolones: m,
    })
    const result = transformCuentas([item(1_000), item(2_000)])
    expect(result).toHaveLength(1)
    expect(result[0]?.MontoColones).toBe(3_000)
  })
})

describe('transformLibreTransferencia', () => {
  it('expande matriz origen→destino en registros planos', () => {
    const raw: RawLibreTransferencia[] = [{
      fecha: '2024-06-01',
      entidadorigen: 'POPULAR',
      POPULAR_C: 0, POPULAR_M: 0,
      VIDA_PLENA_C: 12, VIDA_PLENA_M: 450_000_000,
      BACSJ_PENSIONES_C: 3, BACSJ_PENSIONES_M: 90_000_000,
    } as unknown as RawLibreTransferencia]
    const result = transformLibreTransferencia(raw)
    // 8 destinos posibles por registro
    expect(result).toHaveLength(8)
    const vidaPlena = result.find(r => r.Entidad.includes('VIDA PLENA'))
    expect(vidaPlena).toMatchObject({ CantidadTransferencias: 12, MontoTransferido: 450_000_000 })
  })
})

describe('transformPortafolioISIN', () => {
  it('mapea campos crudos a dominio', () => {
    const raw = {
      entidad: 'POPULAR', codigofondo: 'ROP', fecha: '2024-06-01',
      codigoisin: 'CRP00001011', descripcion: 'Bono Gobierno', monto: 1000, porcentaje: null,
    } as unknown as RawPortafolioISIN
    const [r] = transformPortafolioISIN([raw])
    expect(r).toMatchObject({
      Entidad: 'POPULAR PENSIONES', CodigoISIN: 'CRP00001011', Porcentaje: 0,
    })
  })
})
