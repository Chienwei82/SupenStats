import { formatPercent, formatNumber } from '../../utils/dataTransformers'
import type { Rendimiento, Comision, Afiliado } from '../../types/suppen'

interface KpiCardsProps {
  rendimientos: Rendimiento[]
  comisiones: Comision[]
  afiliados: Afiliado[]
}

interface KpiCardProps {
  title: string
  value: string
  subtitle: string
  color: string
}

function KpiCard({ title, value, subtitle, color }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  )
}

export function KpiCards({ rendimientos, comisiones, afiliados }: KpiCardsProps) {
  // Solo consideramos rendimientos con valor nominal distinto de 0 (los que
  // corresponden a la periodicidad ANUAL tras la transformación).
  const rendimientosValidos = rendimientos.filter(r => r.RendimientoNominal != null && r.RendimientoNominal !== 0)

  const avgRendimiento = rendimientosValidos.length > 0
    ? rendimientosValidos.reduce((sum, r) => sum + (r.RendimientoNominal ?? 0), 0) / rendimientosValidos.length
    : 0

  const bestOpc = rendimientosValidos.length > 0
    ? [...rendimientosValidos].sort((a, b) => (b.RendimientoNominal ?? 0) - (a.RendimientoNominal ?? 0))[0]
    : null

  const latestDate = afiliados.length > 0
    ? afiliados.reduce((latest, a) => a.FechaCorte > latest ? a.FechaCorte : latest, afiliados[0].FechaCorte)
    : null
  const totalAfiliados = afiliados
    .filter(a => latestDate && a.FechaCorte === latestDate)
    .reduce((sum, a) => sum + (a.CantidadAfiliados ?? 0), 0)

  const comisionesValidas = comisiones.filter(c => c.ComisionTotal != null && c.ComisionTotal !== 0)

  const avgComision = comisionesValidas.length > 0
    ? comisionesValidas.reduce((sum, c) => sum + (c.ComisionTotal ?? 0), 0) / comisionesValidas.length
    : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Rendimiento Promedio"
        value={formatPercent(avgRendimiento)}
        subtitle="Nominal del sistema ROP"
        color="text-blue-600"
      />
      <KpiCard
        title="OPC mas Rentable"
        value={bestOpc?.Entidad?.split(' ').slice(0, 2).join(' ') ?? '—'}
        subtitle={bestOpc ? formatPercent(bestOpc.RendimientoNominal) : 'Sin datos'}
        color="text-emerald-600"
      />
      <KpiCard
        title="Total Afiliados"
        value={formatNumber(totalAfiliados)}
        subtitle={latestDate ? `A fecha: ${latestDate}` : 'Sin datos'}
        color="text-amber-600"
      />
      <KpiCard
        title="Comision Promedio"
        value={formatPercent(avgComision)}
        subtitle="Administracion del sistema"
        color="text-purple-600"
      />
    </div>
  )
}
