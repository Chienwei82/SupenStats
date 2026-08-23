import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  /** Contenido opcional bajo el título (subtítulos, notas condicionales). */
  subtitle?: ReactNode
  children: ReactNode
}

/** Contenedor visual estándar para todos los gráficos de reportes. */
export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-6 shadow-md dark:shadow-xl dark:shadow-black/30">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-[#eeffff] mb-4">{title}</h3>
      {subtitle}
      {children}
    </div>
  )
}

/** Trunca nombres largos de entidad para la leyenda del gráfico. */
export function truncateLegend(value: unknown): string {
  const s = String(value)
  return s.length > 20 ? `${s.substring(0, 18)}...` : s
}
