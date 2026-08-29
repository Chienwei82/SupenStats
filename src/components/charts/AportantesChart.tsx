import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatNumber, sortByDateAsc } from '../../utils/dataTransformers'
import { OPC_COLORS } from '../../constants/supen'
import { ChartNote } from '../ui/ChartNote'
import type { AfiliadoAportante } from '../../types/supen'

interface Props {
  data: AfiliadoAportante[]
}

export function AportantesChart({ data }: Props) {
  const sorted = sortByDateAsc(data, 'FechaCorte')
  const latestDate = sorted.length > 0 ? sorted[sorted.length - 1].FechaCorte : null
  const latest = latestDate ? data.filter(d => d.FechaCorte === latestDate) : data

  const byEntity = latest.reduce<Record<string, { afiliados: number; aportantes: number }>>((acc, a) => {
    if (!acc[a.Entidad]) acc[a.Entidad] = { afiliados: 0, aportantes: 0 }
    acc[a.Entidad].afiliados += a.CantidadAfiliados ?? 0
    acc[a.Entidad].aportantes += a.CantidadAportantes ?? 0
    return acc
  }, {})

  const chartData = Object.entries(byEntity).map(([name, v]) => ({
    name: name.length > 18 ? `${name.substring(0, 16)}...` : name,
    fullName: name,
    Afiliados: v.afiliados,
    Aportantes: v.aportantes,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => [formatNumber(Number(value)), name]

  return (
    <div className="bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-6 shadow-md dark:shadow-xl dark:shadow-black/30">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-[#eeffff] mb-4">
        Afiliados vs Aportantes por OPC {latestDate ? `(${latestDate})` : ''}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatNumber(v)} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={tooltipFormatter as any}
            labelFormatter={(label) => {
              const item = chartData.find(d => d.name === String(label))
              return item?.fullName || String(label)
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Afiliados" fill={OPC_COLORS['POPULAR PENSIONES'] || '#3b82f6'} radius={[2, 2, 0, 0]} />
          <Bar dataKey="Aportantes" fill={OPC_COLORS['BCR-PENSION'] || '#10b981'} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <ChartNote noteId="aportantes" />
    </div>
  )
}