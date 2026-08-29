import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatNumber, sortByDateAsc } from '../../utils/dataTransformers'
import { CHART_COLORS } from '../../constants/supen'
import { ChartNote } from '../ui/ChartNote'
import type { AfiliadoDemografico } from '../../types/supen'

interface Props {
  data: AfiliadoDemografico[]
}

const RANGE_ORDER = ['< 31', '31 A < 45', '45 A < 59', '59 A < 100', '>= 100']

export function DemografiaChart({ data }: Props) {
  const sorted = sortByDateAsc(data, 'FechaCorte')
  const latestDate = sorted.length > 0 ? sorted[sorted.length - 1].FechaCorte : null
  const latest = latestDate ? data.filter(d => d.FechaCorte === latestDate) : data

  // Distribución por rango de edad, segmentada por sexo
  const byRange = latest.reduce<Record<string, { F: number; M: number }>>((acc, d) => {
    const key = d.RangoEdad.trim()
    if (!acc[key]) acc[key] = { F: 0, M: 0 }
    if (d.Sexo === 'Femenino') acc[key].F += d.CantidadAfiliados ?? 0
    else acc[key].M += d.CantidadAfiliados ?? 0
    return acc
  }, {})

  const chartData = Object.entries(byRange)
    .map(([rango, v]) => ({ rango, Femenino: v.F, Masculino: v.M }))
    .sort((a, b) => {
      const ia = RANGE_ORDER.findIndex(r => a.rango.includes(r) || a.rango.includes(r.trim()))
      const ib = RANGE_ORDER.findIndex(r => b.rango.includes(r) || b.rango.includes(r.trim()))
      return ia - ib
    })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => [formatNumber(Number(value)), name]

  return (
    <div className="bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-6 shadow-md dark:shadow-xl dark:shadow-black/30">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-[#eeffff] mb-4">
        Demografia de Afiliados por Rango de Edad {latestDate ? `(${latestDate})` : ''}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="rango" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatNumber(v)} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={tooltipFormatter as any}
            labelFormatter={(label) => `Rango: ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Femenino" fill={CHART_COLORS[4]} radius={[2, 2, 0, 0]} />
          <Bar dataKey="Masculino" fill={CHART_COLORS[1]} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <ChartNote noteId="demografia" />
    </div>
  )
}