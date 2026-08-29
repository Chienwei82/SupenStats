import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  fetchAfiliadosRaw,
  fetchLibreTransferenciaMatriz,
  fetchRendimientosComparados,
  TimeoutError,
} from '../apiService'
import type { RawAfiliado, RawLibreTransferencia } from '../../types/supen'

const okJson = (body: unknown) =>
  ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => body,
  }) as Response

const setupFetch = (body: unknown) => {
  const fn = vi.fn(async () => okJson(body))
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchAfiliadosRaw', () => {
  it('pide /afiliado crudo sin forzar transformación ni convertir null en 0', async () => {
    const body = [
      { entidad: 'POPULAR PENSIONES', afiliados: null, fecha: '2024-06-30T00:00:00' },
    ] as unknown as RawAfiliado[]
    const fetchMock = setupFetch(body)
    const result = await fetchAfiliadosRaw('ROP', { FechaInicio: '2024-01-01', FechaFinal: '2024-12-31' })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/afiliado'),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    expect(result[0]?.afiliados).toBeNull()
  })

  it('aborta con error cuando la API no devuelve un array (shape cambió)', async () => {
    setupFetch({ data: [] })
    await expect(fetchAfiliadosRaw('ROP')).rejects.toThrow(/se esperaba una lista de datos/i)
  })
})

describe('fetchLibreTransferenciaMatriz', () => {
  it('devuelve la matriz cruda de /lt preservando la diagonal', async () => {
    const body = [
      { entidadorigen: 'POPULAR', fecha: '2024-06-30T00:00:00', POPULAR_C: 99, POPULAR_M: 0 },
    ] as unknown as RawLibreTransferencia[]
    const fetchMock = setupFetch(body)
    const result = await fetchLibreTransferenciaMatriz('ROP', undefined)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/lt'), expect.anything())
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ POPULAR_C: 99 })
  })
})

describe('fetchRendimientosComparados', () => {
  it('aplica transformRendimientosComparados conservando periodicidad y nulls', async () => {
    const body = [
      {
        entidad: 'POPULAR PENSIONES',
        periodicidad: 'ANUAL',
        tipo: 'REAL',
        rentabilidad: null,
        fecha: '2024-01-31',
        codigofondo: 'ROP',
      },
    ]
    setupFetch(body)
    const result = await fetchRendimientosComparados('ROP')
    expect(result[0]).toMatchObject({ Periodicidad: 'ANUAL', Real: null })
  })
})

describe('timeout', () => {
  it('lanza TimeoutError cuando el fetch aborta por exceder el límite', async () => {
    vi.useFakeTimers()
    try {
      const fn = vi.fn(async (_url: string, init?: RequestInit) => {
        return await new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const err = new Error('The operation was aborted')
            err.name = 'AbortError'
            reject(err)
          })
        })
      })
      vi.stubGlobal('fetch', fn)
      const promise = fetchAfiliadosRaw('ROP')
      // Adjuntar el handler ANTES de avanzar el reloj: si el timer dispara la
      // promesa durante advanceTimersByTimeAsync y no hay handler todavía, la
      // rejection queda como unhandled.
      const assertion = expect(promise).rejects.toBeInstanceOf(TimeoutError)
      // Avanzar el reloj más allá del timeout real de fetchJson (90s):
      // dispara el setTimeout que aborta el controller y marca timedOut.
      await vi.advanceTimersByTimeAsync(90_001)
      await assertion
    } finally {
      vi.useRealTimers()
    }
  })
})