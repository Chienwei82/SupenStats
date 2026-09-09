import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { calcularRentabilidadPromedio, proyeccionPension, valorPresente, MIN_CORTES_RENTABILIDAD } from '../utils/reportes'
import { formatCurrency, formatCurrencyMillions, getUniqueValues } from '../utils/dataTransformers'
import { useUrlParam } from '../hooks/useReportQuery'
import { useInflacion } from '../hooks/useInflacion'
import { ChartCard } from './ui/ChartCard'
import { ChartNote } from './ui/ChartNote'
import { OPC_LIST } from '../constants/supen'
import type { RentabilidadSerie } from '../types/supen'

interface Props {
  data: RentabilidadSerie[]
}

const chipClass = (activa: boolean) => `
  px-3 py-1 text-xs font-medium rounded-full border transition-colors
  ${activa
    ? 'bg-[#7c4dff] text-white border-[#7c4dff]'
    : 'bg-transparent text-gray-600 dark:text-[#a6accd] border-gray-300 dark:border-[#414868] hover:bg-gray-100 dark:hover:bg-[#303348]'
  }
`

export function Simulador({ data }: Props) {
  // OPC de referencia: se deriva de las entidades presentes en la serie (la
  // lista fija OPC_LIST es solo respaldo si aún no hay datos).
  const opcDisponibles = useMemo(
    () => (data.length > 0 ? getUniqueValues(data, 'Entidad') : OPC_LIST),
    [data],
  )
  const [opc, setOpc] = useState<string>(OPC_LIST[0])
  const opcEfectiva = opcDisponibles.includes(opc) ? opc : opcDisponibles[0]

  // Métrica de rentabilidad en URL (compartible/back-navegable).
  const [metrica, setMetrica] = useUrlParam<'nominal' | 'real'>(
    'metrica',
    (v): v is 'nominal' | 'real' => v === 'real' || v === 'nominal',
    'nominal',
  )

  // Inputs del usuario (formulario local, no son filtros de API).
  const [saldo, setSaldo] = useState('5 000 000')
  const [aporte, setAporte] = useState('50 000')
  const [edadActual, setEdadActual] = useState('30')
  const [edadRetiro, setEdadRetiro] = useState('65')

  const saldoN = Number(saldo.replace(/\s/g, ''))
  const aporteN = Number(aporte.replace(/\s/g, ''))
  const edadActualN = Number(edadActual)
  const edadRetiroN = Number(edadRetiro)

  const inputsValidos =
    Number.isFinite(saldoN) && saldoN >= 0 &&
    Number.isFinite(aporteN) && aporteN >= 0 &&
    Number.isFinite(edadActualN) && edadActualN >= 18 && edadActualN <= 99 &&
    Number.isFinite(edadRetiroN) && edadRetiroN > edadActualN && edadRetiroN <= 99

  const rentabilidad = useMemo(
    () => calcularRentabilidadPromedio(data, opcEfectiva, metrica),
    [data, opcEfectiva, metrica],
  )

  const proyeccion = useMemo(() => {
    if (!inputsValidos || rentabilidad.promedio == null) return null
    return proyeccionPension({
      saldoInicial: saldoN,
      aporteMensual: aporteN,
      anios: edadRetiroN - edadActualN,
      tasaAnual: (rentabilidad.promedio as number) / 100,
      edadActual: edadActualN,
    })
  }, [inputsValidos, rentabilidad.promedio, saldoN, aporteN, edadRetiroN, edadActualN])

  // Poder adquisitivo (Reporte 7): descuenta el monto nominal proyectado por
  // la inflación promedio. Si no hay tasa de inflación (BCCR no conectado o
  // histórico insuficiente), valorPresente devuelve null y solo se muestra el
  // monto nominal. Nunca se inventa una cifra equivalente.
  const { inflacion, integracionActiva, error: errorInflacion } = useInflacion()

  const añosProyeccion = edadRetiroN - edadActualN

  const montoValorPresente = useMemo(() => {
    if (!proyeccion) return null
    return valorPresente(proyeccion.montoFinal, añosProyeccion, inflacion.tasaAnual)
  }, [proyeccion, añosProyeccion, inflacion.tasaAnual])

  const ajusteInflacionMensaje =
    errorInflacion != null
      ? 'No se pudo obtener datos de inflación.'
      : !integracionActiva
        ? 'El ajuste por inflación no está disponible en este momento.'
        : (inflacion.insuficiente && inflacion.tasaAnual == null)
          ? 'Histórico de inflación insuficiente para proyectar el ajuste.'
          : null

  return (
    <ChartCard
      title="Simulador: ¿cuánto tendré al pensionarme?"
      description="Proyección del saldo acumulado al retiro usando la rentabilidad histórica promedio de la OPC seleccionada."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Campo label="Saldo actual del ROP (₡)" value={saldo} onChange={setSaldo} />
        <Campo label="Aporte mensual (₡)" value={aporte} onChange={setAporte} />
        <Campo label="Edad actual" value={edadActual} onChange={setEdadActual} />
        <Campo label="Edad de retiro" value={edadRetiro} onChange={setEdadRetiro} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-xs font-medium text-gray-600 dark:text-[#a6accd]">
          OPC de referencia
          <select
            value={opcEfectiva}
            onChange={e => setOpc(e.target.value)}
            className="ml-2 px-3 py-1.5 text-sm bg-white dark:bg-[#25293c] dark:text-[#eeffff] border border-gray-300 dark:border-[#34324a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82aaff]"
          >
            {opcDisponibles.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          {(['nominal', 'real'] as const).map(m => (
            <button
              key={m}
              type="button"
              className={chipClass(metrica === m)}
              aria-pressed={metrica === m}
              onClick={() => setMetrica(m)}
            >
              {m === 'nominal' ? 'Nominal' : 'Real'}
            </button>
          ))}
        </div>
      </div>

      {rentabilidad.promedio == null ? (
        <p className="text-sm text-amber-600 dark:text-amber-400 py-4">
          Histórico insuficiente para <span className="font-medium">{opcEfectiva}</span> con la
          métrica {metrica} (se encontraron {rentabilidad.nCortes} cortes con dato; se requieren
          al menos {MIN_CORTES_RENTABILIDAD}). No se calcula una proyección con un valor supuesto.
        </p>
      ) : !inputsValidos ? (
        <p className="text-sm text-amber-600 dark:text-amber-400 py-4">
          Revisa los valores: edad de retiro debe ser mayor a la actual (18–99), y los montos no
          negativos.
        </p>
      ) : proyeccion ? (
        <>
          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-[#a6accd]">Monto proyectado al retiro</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-[#eeffff]">
              {formatCurrency(proyeccion.montoFinal)}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#a6accd] mt-1">
              Tasa usada: {rentabilidad.promedio.toFixed(2)}% anual ({metrica}) promediada sobre{' '}
              {rentabilidad.nCortes} cortes
              {rentabilidad.primerCorte && rentabilidad.ultimoCorte
                ? ` (${rentabilidad.primerCorte} → ${rentabilidad.ultimoCorte})`
                : ''}.
            </p>
          </div>

          {metrica === 'real' ? (
            // La serie REAL de SUPEN ya está ajustada por inflación: este monto
            // ya está en poder adquisitivo de hoy, no se descuenta otra vez.
            <p className="mb-3 text-xs text-gray-500 dark:text-[#a6accd]">
              Esta proyección usa la rentabilidad real (ya ajustada por inflación), por lo que el
              monto está expresado en poder adquisitivo de hoy y no requiere descuento adicional.
            </p>
          ) : montoValorPresente != null && inflacion.tasaAnual != null ? (
            <div className="mb-3 rounded-lg border border-blue-200 dark:border-[#2b2a3e] bg-blue-50 dark:bg-[#252a3a] px-4 py-3">
              <p className="text-xs font-medium text-blue-900 dark:text-[#89ddff]">
                Equivalente en colones de hoy
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-[#89ddff]">
                {formatCurrency(montoValorPresente)}
              </p>
              <p className="text-xs text-blue-900/80 dark:text-[#89ddff]/80 mt-1">
                Este monto representa cuánto valdría hoy lo que recibirías al retirarte: la
                inflación acumulada reduce el poder adquisitivo del dinero nominal futuro.
              </p>
              <p className="text-xs text-blue-900/80 dark:text-[#89ddff]/80 mt-1">
                Basado en inflación promedio {inflacion.fechaInicio?.slice(0, 4)}–
                {inflacion.fechaFin?.slice(0, 4)} de {(inflacion.tasaAnual * 100).toFixed(2)}% anual
                ({inflacion.nAnios} años).
              </p>
            </div>
          ) : ajusteInflacionMensaje ? (
            <p className="mb-3 text-sm text-amber-600 dark:text-amber-400">
              {ajusteInflacionMensaje} Se muestra solo el monto nominal; no se presenta una cifra
              equivalente inventada.
            </p>
          ) : null}

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={proyeccion.curva} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.25)" />
              <XAxis dataKey="edad" tick={{ fontSize: 11 }} name="Edad" />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => formatCurrencyMillions(v)}
                width={70}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((value: number) => [formatCurrency(value), 'Saldo proyectado']) as any}
                labelFormatter={(label) => `Edad: ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="saldo"
                name="Saldo proyectado"
                stroke="#7c4dff"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : null}

      <ChartNote noteId="simulador" />
    </ChartCard>
  )
}

interface CampoProps {
  label: string
  value: string
  onChange: (v: string) => void
}

function Campo({ label, value, onChange }: CampoProps) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-[#a6accd]">
      {label}
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-3 py-1.5 text-sm bg-white dark:bg-[#25293c] dark:text-[#eeffff] border border-gray-300 dark:border-[#34324a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82aaff]"
      />
    </label>
  )
}
