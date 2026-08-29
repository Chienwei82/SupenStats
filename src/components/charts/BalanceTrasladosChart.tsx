import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { calcularKpisBalance, construirBalanceTraslados } from '../../utils/traslados'
import { formatDateShort, formatNumber } from '../../utils/dataTransformers'
import { entityColor } from '../../constants/suppen'
import { ChartCard } from '../ui/ChartCard'
import { ChartNote } from '../ui/ChartNote'
import { KpiCard } from '../ui/KpiCard'
import type { RawLibreTransferencia } from '../../types/suppen'

interface Props {
  data: RawLibreTransferencia[]
}

/**
 * Vista B1: balance neto de traslados por OPC a lo largo del tiempo
 * (ingresos - salidas), derivado directamente de la matriz que publica
 * /lt. Si la API no trae la fila de una OPC en un mes, esa barra se omite
 * (no se rellena con 0).
 */
export function BalanceTrasladosChart({ data }: Props) {
  const balances = useMemo(() => construirBalanceTraslados(data), [data])

  const { puntos, entidades } = useMemo(() => {
    const ents = new Set<string>()
    for (const b of balances) ents.add(b.Entidad)
    const entsList = [...ents].sort()
    const fechas = [...new Set(balances.map(b => b.fecha))].sort()
    // Precomputar Map<fecha, Map<ent, balance>> en una sola pasada: el render
    // queda O(F·E) en vez de O(F·E·B) (antes hacía balances.find por celda).
    const porFechaEnt = new Map<string, Map<string, number>>()
    for (const b of balances) {
      let m = porFechaEnt.get(b.fecha)
      if (!m) { m = new Map(); porFechaEnt.set(b.fecha, m) }
      m.set(b.Entidad, b.Neto)
    }
    const pts = fechas.map(fecha => {
      const point: Record<string, string | number> = { fecha }
      const m = porFechaEnt.get(fecha)
      if (m) {
        for (const ent of entsList) {
          const v = m.get(ent)
          if (v !== undefined) point[ent] = v
        }
      }
      return point
    })
    return { puntos: pts, entidades: entsList }
  }, [balances])

  const kpis = useMemo(() => calcularKpisBalance(balances), [balances])

  // Subtítulos que aclaran el caso "no hay OPC ganadora" o "no hay perdedora".
  // Sin esto, un "—" en el KPI se lee como dato faltante.
  const topPosSubtitle = kpis.topPos
    ? 'Atrayente neta'
    : (balances.length > 0 ? 'Ninguna OPC con balance positivo' : undefined)
  const topNegSubtitle = kpis.topNeg
    ? 'Perdedora neta'
    : (balances.length > 0 ? 'Ninguna OPC con balance negativo' : undefined)

  return (
    <ChartCard
      title="Balance neto de traslados por OPC (vista B1)"
      description="Barras agrupadas por mes: ingresos menos salidas en cantidad de traslados, según /lt."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <KpiCard label="Traslados totales (ingresos)" value={formatNumber(kpis.totalIngresos)} />
        <KpiCard label="Mayor balance positivo" value={kpis.topPos ?? '—'} subtitle={topPosSubtitle} />
        <KpiCard label="Mayor balance negativo" value={kpis.topNeg ?? '—'} subtitle={topNegSubtitle} />
      </div>

      {puntos.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-[#a6accd] py-8 text-center">
          No hay datos de libre transferencia en el rango seleccionado.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={puntos} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.25)" />
            <XAxis dataKey="fecha" tick={{ fontSize: 11 }} tickFormatter={(v: string) => formatDateShort(v)} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatNumber(v)} />
            <Tooltip
              labelFormatter={(label) => `Fecha: ${label}`}
              formatter={(value, name) => [formatNumber(Number(value)), name as string]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {entidades.map(ent => (
              <Bar
                key={ent}
                dataKey={ent}
                name={ent}
                fill={entityColor(ent)}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}

      <ChartNote noteId="traslados-b1" />
    </ChartCard>
  )
}
