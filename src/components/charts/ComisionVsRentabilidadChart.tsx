import { useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, ZAxis,
} from 'recharts'
import type { ComisionRentabilidadDataset } from '../../types/supen'
import { PERIODICIDADES, joinComisionConRentabilidad, regresionLineal } from '../../utils/reportes'
import { useUrlParam } from '../../hooks/useReportQuery'
import { ChartCard } from '../ui/ChartCard'

interface Props {
  data: ComisionRentabilidadDataset[]
}

const chipClass = (activa: boolean) => `
  px-3 py-1 text-xs font-medium rounded-full border transition-colors
  ${activa
    ? 'bg-[#7c4dff] text-white border-[#7c4dff]'
    : 'bg-transparent text-gray-600 dark:text-[#a6accd] border-gray-300 dark:border-[#414868] hover:bg-gray-100 dark:hover:bg-[#303348]'
  }
`

interface TooltipEntry {
  payload?: { Entidad?: string; Comision?: number; Rentabilidad?: number }
}

function ScatterTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  const p = payload?.[0]?.payload
  if (!active || !p) return null
  return (
    <div className="rounded-lg bg-white dark:bg-[#292d3e] border border-gray-200 dark:border-[#414868] px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-gray-800 dark:text-[#eeffff]">{p.Entidad}</p>
      <p className="text-gray-600 dark:text-[#a6accd]">Comisión: {p.Comision?.toFixed(2)}%</p>
      <p className="text-gray-600 dark:text-[#a6accd]">Rentabilidad: {p.Rentabilidad?.toFixed(2)}%</p>
    </div>
  )
}

/**
 * Scatter comisión sobre saldo (X) vs rentabilidad (Y), un punto por OPC en el
 * corte más reciente común a ambas fuentes. Incluye línea de tendencia por
 * mínimos cuadrados y coeficiente r cuando es calculable.
 */
export function ComisionVsRentabilidadChart({ data }: Props) {
  const dataset = data[0]
  // Selección en URL (compartible/back-navegable).
  const [periodicidad, setPeriodicidad] = useUrlParam(
    'periodicidad',
    v => v !== undefined && (PERIODICIDADES as readonly string[]).includes(v),
    'ANUAL',
  )
  const [metrica, setMetrica] = useUrlParam<'nominal' | 'real'>(
    'metrica',
    (v): v is 'nominal' | 'real' => v === 'nominal' || v === 'real',
    'nominal',
  )

  const join = useMemo(
    () => dataset
      ? joinComisionConRentabilidad(dataset.comisiones, dataset.rendimientos, periodicidad, metrica)
      : { corte: null, puntos: [], excluidos: [] },
    [dataset, periodicidad, metrica],
  )

  const trend = useMemo(() => regresionLineal(join.puntos), [join.puntos])
  // Extremos de la línea de tendencia sobre el rango X observado.
  const trendSegment = useMemo(() => {
    if (!trend || join.puntos.length === 0) return null
    const xs = join.puntos.map(p => p.Comision)
    const x1 = Math.min(...xs)
    const x2 = Math.max(...xs)
    return [
      { x: x1, y: trend.intercepto + trend.pendiente * x1 },
      { x: x2, y: trend.intercepto + trend.pendiente * x2 },
    ] as const
  }, [trend, join.puntos])

  return (
    <ChartCard
      title="Comisiones vs Rentabilidad por OPC"
      description={`Gráfico de dispersión: comisión sobre saldo (eje X) contra rentabilidad ${metrica} (eje Y), un punto por operadora.`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {PERIODICIDADES.map(p => (
          <button
            key={p}
            type="button"
            className={chipClass(periodicidad === p)}
            aria-pressed={periodicidad === p}
            onClick={() => setPeriodicidad(p)}
          >
            {p === 'HISTÓRICA' ? 'Histórica' : p === 'ANUAL' ? 'Anual' : p.replace(' AÑOS', ' años')}
          </button>
        ))}
        <span className="mx-2 h-4 w-px bg-gray-300 dark:bg-[#414868]" aria-hidden />
        {(['nominal', 'real'] as const).map(m => (
          <button
            key={m}
            type="button"
            className={chipClass(metrica === m)}
            aria-pressed={metrica === m}
            onClick={() => setMetrica(m)}
          >
            Rentabilidad {m === 'nominal' ? 'nominal' : 'real'}
          </button>
        ))}
      </div>

      {join.corte == null || join.puntos.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-[#a6accd] py-8 text-center">
          No hay pares comisión/rentabilidad comparables para esta selección.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 15, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.25)" />
              <XAxis
                type="number"
                dataKey="Comision"
                name="Comisión"
                domain={['auto', 'auto']}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `${v}%`}
                label={{ value: 'Comisión sobre saldo (%)', position: 'insideBottom', offset: -8, fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="Rentabilidad"
                name="Rentabilidad"
                domain={['auto', 'auto']}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <ZAxis range={[90, 90]} />
              <Tooltip content={<ScatterTooltip />} />
              {trendSegment && (
                <ReferenceLine
                  segment={trendSegment}
                  stroke="#7c4dff"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                />
              )}
              <Scatter data={join.puntos} fill="#82aaff" name="OPC" />
            </ScatterChart>
          </ResponsiveContainer>

          <div className="mt-3 space-y-1">
            {trend && (
              <p className="text-xs text-gray-500 dark:text-[#a6accd]">
                Línea de tendencia (mínimos cuadrados): r ={' '}
                <span className="font-medium">{trend.r.toFixed(2)}</span>. Correlación no implica causalidad.
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-[#a6accd]">
              Corte analizado: {join.corte}. n = {join.puntos.length} OPC con par completo.
            </p>
            {join.excluidos.length > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Excluidas del gráfico por datos incompletos:{' '}
                {join.excluidos.map(e => `${e.Entidad} (${e.Motivo})`).join('; ')}.
              </p>
            )}
          </div>
        </>
      )}
    </ChartCard>
  )
}
