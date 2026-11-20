import { describe, it, expect } from 'vitest'
import { toCsv, safeFilename, type CsvColumn } from '../export'

interface Row {
  nombre: string
  valor: number | null
}

const columns: CsvColumn<Row>[] = [
  { key: 'nombre', header: 'Nombre' },
  { key: 'valor', header: 'Valor' },
]

describe('toCsv', () => {
  it('serializa cabecera y filas separadas por coma y salto de línea', () => {
    const csv = toCsv(
      [
        { nombre: 'Ana', valor: 10 },
        { nombre: 'Luis', valor: 20 },
      ],
      columns,
    )
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Nombre,Valor')
    expect(lines[1]).toBe('Ana,10')
    expect(lines[2]).toBe('Luis,20')
  })

  it('exporta valores null/undefined como celda vacía (no "null")', () => {
    const csv = toCsv([{ nombre: 'Ana', valor: null }], columns)
    expect(csv).toBe('Nombre,Valor\nAna,')
  })

  it('escapa comillas, comas y saltos de línea con RFC 4180', () => {
    const csv = toCsv([{ nombre: 'Perez, Juan', valor: 1 }], columns)
    expect(csv).toContain('"Perez, Juan",1')

    const csvQuote = toCsv([{ nombre: 'La "Mejor"', valor: 1 }], columns)
    expect(csvQuote).toContain('"La ""Mejor""",1')
  })

  it('aplica el formateador de columna si se provee', () => {
    const withFormat: CsvColumn<Row>[] = [
      { key: 'valor', header: 'Valor', format: v => `${v}%` },
    ]
    const csv = toCsv([{ nombre: 'x', valor: 5 }], withFormat)
    expect(csv).toBe('Valor\n5%')
  })

  it('usa la etiqueta de la columna como cabecera, no la clave', () => {
    const csv = toCsv([{ nombre: 'a', valor: 1 }], [
      { key: 'nombre', header: 'Nombre completo' },
      { key: 'valor', header: 'Monto' },
    ])
    expect(csv.split('\n')[0]).toBe('Nombre completo,Monto')
  })
})

describe('safeFilename', () => {
  it('normaliza a minúsculas, quita acentos y caracteres no válidos', () => {
    expect(safeFilename('Comparación RÖP 2024')).toBe('comparacion-rop-2024')
  })

  it('devuelve un fallback si el nombre queda vacío', () => {
    expect(safeFilename('***')).toBe('datos')
    expect(safeFilename('')).toBe('datos')
  })
})