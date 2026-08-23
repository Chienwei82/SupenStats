import { TimeSeriesChart } from './TimeSeriesChart'
import type { Rendimiento } from '../../types/suppen'

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
      noteId="rendimiento"
    />
  )
}
