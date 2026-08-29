import { useMemo } from 'react'
import { TimeSeriesChart } from './TimeSeriesChart'
import type { Comision } from '../../types/supen'

interface Props {
  data: Comision[]
}

export function ComisionesChart({ data }: Props) {
  // Nota condicional: si todas las operadoras cobran lo mismo en el último
  // corte, se explica que la comision está unificada por regulación.
  const subtitle = useMemo(() => {
    const valid = data.filter(c => c.ComisionTotal != null)
    if (valid.length === 0) return null
    const latestDate = valid.reduce((max, c) => (c.FechaCorte > max ? c.FechaCorte : max), valid[0].FechaCorte)
    const latest = [...new Set(valid.filter(c => c.FechaCorte === latestDate).map(c => c.ComisionTotal))]
    if (latest.length === 1) {
      return (
        <p className="text-sm text-gray-500 dark:text-[#a6accd] mb-4">
          Todas las operadoras cobran la misma comision de{' '}
          <span className="font-medium text-gray-700 dark:text-[#eeffff]">{latest[0]?.toFixed(2)}%</span>{' '}
          en el periodo seleccionado. La comision quedo unificada tras la regulacion vigente desde 2020.
        </p>
      )
    }
    return (
      <p className="text-sm text-gray-500 dark:text-[#a6accd] mb-4">
        Evolucion de la comision de administracion (SALDO) por operadora.
      </p>
    )
  }, [data])

  return (
    <TimeSeriesChart
      data={data}
      dateField="FechaCorte"
      valueField="ComisionTotal"
      seriesField="Entidad"
      title="Evolucion de Comisiones de Administracion por OPC"
      description="Gráfico de líneas: comisión de administración sobre saldo cobrada por cada operadora en el tiempo."
      subtitle={subtitle ?? undefined}
      noteId="comisiones"
    />
  )
}