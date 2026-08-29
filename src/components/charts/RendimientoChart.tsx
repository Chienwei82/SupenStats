import { TimeSeriesChart } from './TimeSeriesChart'
import type { Rendimiento } from '../../types/supen'

interface Props {
  data: Rendimiento[]
}

export function RendimientoChart({ data }: Props) {
  return (
    <TimeSeriesChart
      data={data}
      dateField="FechaCorte"
      valueField="RendimientoNominal"
      seriesField="Entidad"
      title="Rendimiento Historico por OPC"
      description="Gráfico de líneas: rentabilidad anual de cada operadora de pensiones a lo largo del tiempo."
      noteId="rendimiento"
    />
  )
}
