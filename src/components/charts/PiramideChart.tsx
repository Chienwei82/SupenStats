import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatNumber, sortByDateAsc } from '../../utils/dataTransformers'
import { useUrlParam } from '../../hooks/useReportQuery'
import { ChartCard } from '../ui/ChartCard'
import { ChartNote } from '../ui/ChartNote'
import type { AfiliadoDemografico, BeneficioDemografico } from '../../types/suppen'

interface Props {
  afiliados: AfiliadoDemografico[]
  beneficios: BeneficioDemografico[]
}

// Orden de los rangos de edad tal como los devuelve SUPEN (mismo que
// DemografiaChart), para que el eje Y quede de joven a mayor.
const RANGE_ORDER = ['< 31', '31 A < 45', '45 A < 59', '59 A < 100', '>= 100']

function sortRangos(rangos: string[]): string[] {
  return [...rangos].sort((a, b) => {
    const ia = RANGE_ORDER.findIndex(r => a.includes(r))
    const ib = RANGE_ORDER.findIndex(r => b.includes(r))
    // Rangos no reconocidos al final, conservando el orden de aparición.
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })
}

export function PiramideChart({ afiliados, beneficios }: Props) {
  const [dataset, setDataset] = useUrlParam(
    'dataset',
    v => v === 'afiliados' || v === 'pensionados',
    'afiliados',
  )
  const [opc, setOpc] = useUrlParam(
    'opc',
    () => true,
    'TODAS',
  )

  const source: (AfiliadoDemografico | BeneficioDemografico)[] =
    dataset === 'afiliados' ? afiliados : beneficios

  // Cortes disponibles para el dataset activo.
  const cortes = useMemo(
    () => [...new Set(sortByDateAsc(source, 'FechaCorte').map(d => d.FechaCorte))],
    [source],
  )
  const [corte, setCorte] = useUrlParam(
    'corte',
    v => v !== undefined && (cortes.length === 0 || cortes.includes(v)),
    cortes.at(-1) ?? '',
  )
  const corteElegido = corte || cortes.at(-1) || null

  const opcDisponibles = useMemo(
    () => (source.length > 0 ? [...new Set(source.map(d => d.Entidad))].sort() : []),
    [source],
  )
  const opcEfectiva = opcDisponibles.includes(opc) ? opc : 'TODAS'

  const { chartData, sinDatos } = useMemo(() => {
    const filas = source
      .filter(d => d.FechaCorte === corteElegido && (opcEfectiva === 'TODAS' || d.Entidad === opcEfectiva))
      .map(d => ({
        rango: (d.RangoEdad ?? '').trim(),
        sexo: d.Sexo,
        valor: dataset === 'afiliados'
          ? (d as AfiliadoDemografico).CantidadAfiliados
          : (d as BeneficioDemografico).CantidadPensionados,
      }))

    const porRango = new Map<string, { M: number | null; F: number | null }>()
    const sinDato: string[] = []
    for (const f of filas) {
      if (!porRango.has(f.rango)) porRango.set(f.rango, { M: null, F: null })
      const cell = porRango.get(f.rango)!
      if (f.sexo === 'Masculino') cell.M = f.valor
      else cell.F = f.valor
    }

    const rangos = sortRangos([...porRango.keys()])
    const data = rangos.map(r => {
      const cell = porRango.get(r)!
      if (cell.M === null || cell.F === null) sinDato.push(r)
      return {
        rango: r,
        // Back-to-back: masculino a la izquierda (negativo), femenino a la derecha.
        Masculino: cell.M == null ? null : -cell.M,
        Femenino: cell.F == null ? null : cell.F,
      }
    })
    return { chartData: data, sinDatos: sinDato }
  }, [source, corteElegido, opcEfectiva, dataset])

  const tooltipFormatter = (value: number | null, name: string) => {
    if (value == null) return ['no disponible', name]
    return [formatNumber(Math.abs(value)), name]
  }

  return (
    <ChartCard
      title={`Pirámide poblacional — ${dataset === 'afiliados' ? 'Afiliados' : 'Pensionados'}${corteElegido ? ` (${corteElegido})` : ''}`}
      description="Distribución por rango de edad y sexo. Barras opuestas: masculino a la izquierda, femenino a la derecha."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          {([
            { v: 'afiliados', l: 'Afiliados' },
            { v: 'pensionados', l: 'Pensionados' },
          ] as const).map(o => (
            <button
              key={o.v}
              type="button"
              className={cx(dataset === o.v)}
              aria-pressed={dataset === o.v}
              onClick={() => setDataset(o.v)}
            >
              {o.l}
            </button>
          ))}
        </div>

        <label className="text-xs font-medium text-gray-600 dark:text-[#a6accd]">
          OPC
          <select
            value={opcEfectiva}
            onChange={e => setOpc(e.target.value)}
            className="ml-2 px-3 py-1.5 text-sm bg-white dark:bg-[#25293c] dark:text-[#eeffff] border border-gray-300 dark:border-[#34324a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82aaff]"
          >
            <option value="TODAS">Todas las OPC</option>
            {opcDisponibles.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>

        {cortes.length > 1 && (
          <label className="ml-auto text-xs text-gray-500 dark:text-[#a6accd]">
            Corte:{' '}
            <select
              value={corteElegido ?? ''}
              onChange={e => setCorte(e.target.value)}
              className="ml-1 rounded-md border border-gray-300 dark:border-[#414868] bg-white dark:bg-[#292d3e] px-2 py-1 text-gray-700 dark:text-[#eeffff]"
            >
              {[...cortes].reverse().map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {chartData.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-[#a6accd] py-8 text-center">
          No hay datos para el corte y filtros seleccionados.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.25)" />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => formatNumber(Math.abs(v))}
            />
            <YAxis type="category" dataKey="rango" tick={{ fontSize: 11 }} width={70} />
            <Tooltip formatter={tooltipFormatter as never} labelFormatter={(label) => `Rango: ${label}`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Masculino" name="Masculino" fill="#82aaff" radius={[0, 2, 2, 0]} />
            <Bar dataKey="Femenino" name="Femenino" fill="#ec4899" radius={[2, 0, 0, 2]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {sinDatos.length > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
          Rangos sin dato para algún sexo (mostrados como “no disponible”, no como 0):{' '}
          <span className="font-medium">{sinDatos.join(', ')}</span>.
        </p>
      )}

      <ChartNote noteId="piramide" />
    </ChartCard>
  )
}

const cx = (activa: boolean) => `
  px-3 py-1 text-xs font-medium rounded-full border transition-colors
  ${activa
    ? 'bg-[#7c4dff] text-white border-[#7c4dff]'
    : 'bg-transparent text-gray-600 dark:text-[#a6accd] border-gray-300 dark:border-[#414868] hover:bg-gray-100 dark:hover:bg-[#303348]'
  }
`
