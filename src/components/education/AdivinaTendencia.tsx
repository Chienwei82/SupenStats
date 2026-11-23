import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchRendimiento } from '../../api/apiService'
import { useReportQuery } from '../../hooks/useReportQuery'
import { FILTER_DEFAULTS } from '../../constants/filters'
import { OPC_LIST } from '../../constants/supen'
import { getUniqueValues, sortByDateAsc, formatPercent, formatDateShort } from '../../utils/dataTransformers'
import { useBadges } from '../../hooks/useBadges'
import type { Rendimiento, FondoTipo, DateRange } from '../../types/supen'

/**
 * Mini-juego "Adivina la tendencia".
 *
 * Muestra dos cortes de la serie de rentabilidad de una OPC y pregunta al
 * usuario si el valor subió o bajó entre ambos. Da feedback inmediato y
 * registra los aciertos para el sistema de insignias.
 */
export function AdivinaTendencia() {
  const fondo: FondoTipo = 'ROP'
  const dates = FILTER_DEFAULTS.standard.dates as DateRange
  const { recordTrendGuess } = useBadges()

  const { data, loading, error } = useReportQuery<Rendimiento>(
    ['adivina-tendencia', fondo, dates.FechaInicio, dates.FechaFinal],
    signal => fetchRendimiento(fondo, undefined, dates, signal),
  )

  const entidades = useMemo(
    () => (data.length > 0 ? getUniqueValues(data, 'Entidad') : OPC_LIST),
    [data],
  )

  const [opc, setOpc] = useState<string>(entidades[0] ?? OPC_LIST[0]!)
  const [intento, setIntento] = useState<'subio' | 'bajo' | null>(null)
  const [resultado, setResultado] = useState<'correcto' | 'incorrecto' | null>(null)
  const [puntoA, setPuntoA] = useState<{ fecha: string; valor: number } | null>(null)
  const [puntoB, setPuntoB] = useState<{ fecha: string; valor: number } | null>(null)

  useEffect(() => {
    const serie = sortByDateAsc(
      data.filter(r => r.Entidad === opc && r.RendimientoNominal != null),
      'FechaCorte',
    )
    if (serie.length < 2) return
    const iA = Math.floor(Math.random() * (serie.length - 1))
    const iB = iA + 1
    setPuntoA({ fecha: formatDateShort(serie[iA]!.FechaCorte), valor: serie[iA]!.RendimientoNominal as number })
    setPuntoB({ fecha: formatDateShort(serie[iB]!.FechaCorte), valor: serie[iB]!.RendimientoNominal as number })
    setIntento(null)
    setResultado(null)
  }, [data, opc])

  const serieActual = useMemo(() => {
    if (!puntoA || !puntoB) return null
    return puntoB.valor > puntoA.valor ? 'subio' : 'bajo'
  }, [puntoA, puntoB])

  const manejarIntento = useCallback((prediccion: 'subio' | 'bajo') => {
    if (!serieActual) return
    setIntento(prediccion)
    const correcto = prediccion === serieActual
    setResultado(correcto ? 'correcto' : 'incorrecto')
    recordTrendGuess(correcto)
  }, [serieActual, recordTrendGuess])

  const siguienteRonda = useCallback(() => {
    setIntento(null)
    setResultado(null)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500 dark:text-[#a6accd]">Cargando datos…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-amber-800 dark:text-amber-200 text-sm">
        Error al cargar los datos: {error}
      </div>
    )
  }

  if (!puntoA || !puntoB || !serieActual) {
    return (
      <div className="bg-gray-100 dark:bg-[#303348] rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500 dark:text-[#a6accd]">
          No hay suficientes datos de rentabilidad para {opc}.
        </p>
      </div>
    )
  }

  return (
    <section className="bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-6 shadow-sm space-y-5">
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-[#eeffff]">🔮 Adivina la tendencia</h3>
        <p className="text-sm text-gray-600 dark:text-[#a6accd] mt-1">
          Selecciona una operadora y predice si su rentabilidad nominal subió o bajó entre dos cortes consecutivos.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-medium text-gray-600 dark:text-[#a6accd]">
          Operadora
          <select
            value={opc}
            onChange={e => setOpc(e.target.value)}
            className="ml-2 px-3 py-1.5 text-sm bg-white dark:bg-[#25293c] dark:text-[#eeffff] border border-gray-300 dark:border-[#34324a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82aaff]"
          >
            {entidades.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={siguienteRonda}
          disabled={resultado === null}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-[#34324a] bg-white dark:bg-[#25293c] text-gray-700 dark:text-[#eeffff] hover:bg-gray-50 dark:hover:bg-[#303348] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Nueva ronda
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-[#414868] bg-gray-50 dark:bg-[#303348] text-center">
          <p className="text-xs text-gray-500 dark:text-[#676e95]">Corte A</p>
          <p className="text-sm font-mono text-gray-800 dark:text-[#eeffff]">{puntoA.fecha}</p>
          <p className="text-xl font-bold text-gray-800 dark:text-[#eeffff] mt-1">{formatPercent(puntoA.valor)}</p>
        </div>
        <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-[#414868] bg-gray-50 dark:bg-[#303348] text-center">
          <p className="text-xs text-gray-500 dark:text-[#676e95]">Corte B</p>
          <p className="text-sm font-mono text-gray-800 dark:text-[#eeffff]">{puntoB.fecha}</p>
          <p className="text-xl font-bold text-gray-800 dark:text-[#eeffff] mt-1">{formatPercent(puntoB.valor)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={() => manejarIntento('subio')}
          disabled={intento !== null}
          className={intento === 'subio'
            ? (resultado === 'correcto'
              ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-500 text-green-800 dark:text-green-300'
              : resultado === 'incorrecto'
                ? 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-500 text-red-800 dark:text-red-300'
                : 'bg-blue-50 dark:bg-[#2b2a3e] border-blue-300 dark:border-[#414868] text-blue-700 dark:text-[#82aaff] hover:bg-blue-100 dark:hover:bg-[#303348]')
            : 'bg-white dark:bg-[#25293c] border-gray-300 dark:border-[#34324a] text-gray-700 dark:text-[#eeffff] hover:bg-gray-50 dark:hover:bg-[#303348]'}
        >
          Subió ↗
        </button>
        <button
          type="button"
          onClick={() => manejarIntento('bajo')}
          disabled={intento !== null}
          className={intento === 'bajo'
            ? (resultado === 'correcto'
              ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-500 text-green-800 dark:text-green-300'
              : resultado === 'incorrecto'
                ? 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-500 text-red-800 dark:text-red-300'
                : 'bg-blue-50 dark:bg-[#2b2a3e] border-blue-300 dark:border-[#414868] text-blue-700 dark:text-[#82aaff] hover:bg-blue-100 dark:hover:bg-[#303348]')
            : 'bg-white dark:bg-[#25293c] border-gray-300 dark:border-[#34324a] text-gray-700 dark:text-[#eeffff] hover:bg-gray-50 dark:hover:bg-[#303348]'}
        >
          Bajó ↘
        </button>
      </div>

      {resultado === 'correcto' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-500 text-green-800 dark:text-green-300 text-sm font-medium">
          ✅ ¡Correcto! La rentabilidad {serieActual}.
        </div>
      )}
      {resultado === 'incorrecto' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-500 text-red-800 dark:text-red-300 text-sm font-medium">
          ❌ No fue. La rentabilidad {serieActual} entre esos cortes.
        </div>
      )}
    </section>
  )
}