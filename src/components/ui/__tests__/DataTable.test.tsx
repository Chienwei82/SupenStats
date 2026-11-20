import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { DataTable, type DataColumn } from '../DataTable'
import { GlossaryView } from '../../education/GlossaryView'

// Fase 3: tests de componentes sin DOM real. Usamos renderToStaticMarkup de
// react-dom/server (sin jsdom ni dependencias nuevas) para validar que los
// componentes renderizan marcado esperado y degradan bien con nulos.

interface Row {
  operadora: string
  afiliados: number | null
}

const columns: DataColumn<Row>[] = [
  { key: 'operadora', header: 'Operadora', text: true },
  { key: 'afiliados', header: 'Afiliados', align: 'right' },
]

const rows: Row[] = [
  { operadora: 'POPULAR', afiliados: 1000 },
  { operadora: 'BCR', afiliados: null },
]

describe('DataTable', () => {
  it('renderiza cabeceras y filas', () => {
    const html = renderToStaticMarkup(
      <DataTable rows={rows} columns={columns} caption="Prueba" />,
    )
    expect(html).toContain('Operadora')
    expect(html).toContain('Afiliados')
    expect(html).toContain('POPULAR')
    expect(html).toContain('BCR')
  })

  it('muestra N/D para valores ausentes en vez de 0', () => {
    const html = renderToStaticMarkup(
      <DataTable rows={rows} columns={columns} />,
    )
    expect(html).toContain('N/D')
  })

  it('usa aria-sort en los encabezados ordenables', () => {
    const html = renderToStaticMarkup(<DataTable rows={rows} columns={columns} />)
    expect(html).toContain('aria-sort')
  })

  it('muestra mensaje de vacío cuando no hay filas', () => {
    const html = renderToStaticMarkup(
      <DataTable rows={[]} columns={columns} emptyMessage="Nada por aquí" />,
    )
    expect(html).toContain('Nada por aquí')
  })
})

describe('GlossaryView', () => {
  it('renderiza el glosario con al menos un término conocido', () => {
    const html = renderToStaticMarkup(<GlossaryView />)
    expect(html).toContain('Glosario')
    expect(html).toContain('Comisión')
  })
})