import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { RendimientoComparado } from '../../types/supen'
import { PERIODICIDADES, cortesDisponibles, compararRendimientos } from '../../utils/reportes'
import { useUrlParam } from '../../hooks/useReportQuery'
import { ChartCard } from '../ui/ChartCard'

interface Props {
  data: RendimientoComparado[]
}

const chipClass = (activa: boolean) => `
  px-3 py-1 text-xs font-medium rounded-full border transition-colors
  ${activa
    ? 'bg-[#7c4dff] text-white border-[#7c4dff]'
    : 'bg-transparent text-gray-600 dark:text-[#a6accd] border-gray-300 dark:border-[#414868] hover:bg-gray-100 dark:hover:bg-[#303348]'
  }
`

/**
 * Barras agrupadas nominal vs real por OPC para el corte más reciente del
 * periodo consultado. La serie "real" es la que calcula y publica SUPEN.
 * Un valor null (no disponible) se comunica explícitamente bajo el gráfico;
 * nunca se representa como 0.
 */
export function RentabilidadRealChart({ data }: Props) {
  // Selección en URL (compartible/back-navegable); defaults: ANUAL y último corte.
  const [periodicidad, setPeriodicidad] = useUrlParam(
    'periodicidad',
    v => v !== undefined && (PERIODICIDADES as readonly string[]).includes(v),
    'ANUAL',
  )
  const cortes = useMemo(() => cortesDisponibles(data, periodicidad), [data, periodicidad])
  const [corteElegido, setCorteElegido] = useUrlParam('corte', v => v !== undefined && cortes.includes(v), cortes.at(-1) ?? '')
  const corte = corteElegido || null

  const filas = useMemo(
    () => (corte ? compararRendimientos(data, periodicidad, corte) : []),
    [data, periodicidad, corte],
  )

  // OPCs sin dato real en este corte/periodicidad: se listan explícitamente.
  const sinReal = filas.filter(f => f.Real == null).map(f => f.Entidad)

  return (
    <ChartCard
      title="Rentabilidad Nominal vs Real por OPC"
      description={`Gráfico de barras: rentabilidad nominal y real de cada operadora de pensiones, periodicidad ${periodicidad.toLowerCase()}, corte ${corte ?? 'sin datos'}.`}
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
        {cortes.length > 1 && (
          <label className="ml-auto text-xs text-gray-500 dark:text-[#a6accd]">
            Corte:{' '}
            <select
              value={corte ?? ''}
              onChange={e => setCorteElegido(e.target.value)}
              className="ml-1 rounded-md border border-gray-300 dark:border-[#414868] bg-white dark:bg-[#292d3e] px-2 py-1 text-gray-700 dark:text-[#eeffff]"
            >
              {[...cortes].reverse().map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {filas.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-[#a6accd] py-8 text-center">
          No hay datos para la periodicidad y corte seleccionados.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={filas} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              {/* Gris semitransparente: visible en claro y oscuro (a diferencia de #f0f0f0). */}
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.25)" />
              <XAxis dataKey="Entidad" tick={{ fontSize: 10 }} interval={0} angle={-15} height={50} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Nominal" name="Nominal" fill="#82aaff" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Real" name="Real" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {sinReal.length > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
              Sin dato de rentabilidad real disponible para:{' '}
              <span className="font-medium">{sinReal.join(', ')}</span>.
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-[#565f89] mt-2">
            La rentabilidad real es la publicada por SUPEN (nominal ajustada por inflación).
            Los valores ausentes se muestran como &quot;no disponible&quot;, no como cero.
          </p>
        </>
      )}
    </ChartCard>
  )
}
