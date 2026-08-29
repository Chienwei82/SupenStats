interface Props {
  label: string
  value: string
  subtitle?: string
  /** Descripción accesible que complementa a `label` (ej. unidad: "personas"). */
  valueAriaLabel?: string
}

/**
 * Tarjeta de KPI usada en los dashboards (ej. balance de traslados).
 * Estilo consistente con el resto de la UI (palenight): tarjeta con borde,
 * label superior en mayúsculas tracking-wide, valor destacado y subtítulo
 * opcional. `valueAriaLabel` da contexto a screen readers (ej. unidades).
 */
export function KpiCard({ label, value, subtitle, valueAriaLabel }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-[#34324a] bg-gray-50 dark:bg-[#262a3a] p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-[#a6accd]">{label}</p>
      <p className="text-lg font-semibold text-gray-800 dark:text-[#eeffff] mt-1" aria-label={valueAriaLabel ?? `${label}: ${value}`}>
        {value}
      </p>
      {subtitle && <p className="text-[11px] text-gray-500 dark:text-[#a6accd] mt-0.5">{subtitle}</p>}
    </div>
  )
}
