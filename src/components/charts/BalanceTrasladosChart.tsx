import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { construirBalanceTraslados } from '../../utils/traslados'
import { formatDateShort, formatNumber } from '../../utils/dataTransformers'
import { entityColor } from '../../constants/suppen'
import { ChartCard } from '../ui/ChartCard'
import { ChartNote } from '../ui/ChartNote'
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
    const pts = fechas.map(fecha => {
      const point: Record<string, string | number> = { fecha }
      for (const ent of entsList) {
        const b = balances.find(x => x.fecha === fecha && x.Entidad === ent)
        if (b) point[ent] = b.Neto
      }
      return point
    })
    return { puntos: pts, entidades: entsList }
  }, [balances])

  const kpis = useMemo(() => {
    if (balances.length === 0) return { total: 0, topPos: null as string | null, topNeg: null as string | null }
    const total = balances.reduce((s, b) => s + b.Ingresos, 0)
    const porOpc = new Map<string, number>()
    for (const b of balances) {
      porOpc.set(b.Entidad, (porOpc.get(b.Entidad) ?? 0) + b.Neto)
    }
    let topPos: string | null = null, topNeg: string | null = null
    let maxN = -Infinity, minN = Infinity
    for (const [opc, n] of porOpc) {
      if (n > maxN) { maxN = n; topPos = opc }
      if (n < minN) { minN = n; topNeg = opc }
    }
    return { total, topPos, topNeg }
  }, [balances])

  return (
    <ChartCard
      title="Balance neto de traslados por OPC (vista B1)"
      description="Barras agrupadas por mes: ingresos menos salidas en cantidad de traslados, según /lt."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <KpiCard label="Traslados totales (ingresos)" value={formatNumber(kpis.total)} />
        <KpiCard label="Mayor balance positivo" value={kpis.topPos ?? '—'} subtitle={kpis.topPos ? 'Atrayente neta' : undefined} />
        <KpiCard label="Mayor balance negativo" value={kpis.topNeg ?? '—'} subtitle={kpis.topNeg ? 'Perdedora neta' : undefined} />
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

function KpiCard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-[#34324a] bg-gray-50 dark:bg-[#262a3a] p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-[#a6accd]">{label}</p>
      <p className="text-lg font-semibold text-gray-800 dark:text-[#eeffff] mt-1">{value}</p>
      {subtitle && <p className="text-[11px] text-gray-500 dark:text-[#a6accd] mt-0.5">{subtitle}</p>}
    </div>
  )
}
