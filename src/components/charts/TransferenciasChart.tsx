import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts'
import { formatNumber } from '../../utils/dataTransformers'
import { CHART_COLORS } from '../../constants/supen'
import { ChartNote } from '../ui/ChartNote'
import type { LibreTransferencia } from '../../types/supen'

interface Props {
  data: LibreTransferencia[]
}

export function TransferenciasChart({ data }: Props) {
  // data tiene pares "origen -> destino". Agrupamos por OPC origen (antes de "->")
  // para ver total de transferencias salientes por OPC.
  const byOrigin = data.reduce<Record<string, { count: number; monto: number }>>((acc, item) => {
    const origin = item.Entidad.split('->')[0].trim()
    if (!acc[origin]) acc[origin] = { count: 0, monto: 0 }
    acc[origin].count += item.CantidadTransferencias ?? 0
    acc[origin].monto += item.MontoTransferido ?? 0
    return acc
  }, {})

  const chartData = Object.entries(byOrigin)
    .map(([name, { count }]) => ({ name, transferencias: count }))
    .sort((a, b) => b.transferencias - a.transferencias)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => [formatNumber(Number(value)), name]

  return (
    <div className="bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-6 shadow-md dark:shadow-xl dark:shadow-black/30">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-[#eeffff] mb-4">Libre Transferencia: transferencias salientes por OPC</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 110 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatNumber(v)} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={tooltipFormatter as any}
            labelFormatter={(label) => String(label)}
          />
          <Legend />
          <Bar dataKey="transferencias" name="Transferencias" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ChartNote noteId="transferencias" />
    </div>
  )
}