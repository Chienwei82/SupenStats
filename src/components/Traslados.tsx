import { VariacionNetaChart } from './charts/VariacionNetaChart'
import { BalanceTrasladosChart } from './charts/BalanceTrasladosChart'
import { TopFlujosTable } from './charts/TopFlujosTable'
import { useUrlParam } from '../hooks/useReportQuery'
import type { AfiliadoMensual, RawLibreTransferencia } from '../types/supen'

interface Props {
  afiliados: AfiliadoMensual[]
  trasladosMatriz: RawLibreTransferencia[]
}

const chipClass = (activa: boolean) => `
  px-3 py-1 text-xs font-medium rounded-full border transition-colors
  ${activa
    ? 'bg-[#7c4dff] text-white border-[#7c4dff]'
    : 'bg-transparent text-gray-600 dark:text-[#a6accd] border-gray-300 dark:border-[#414868] hover:bg-gray-100 dark:hover:bg-[#303348]'
  }
`

/**
 * Reporte "Traslados entre operadoras". Dos vistas conmutables sobre el
 * mismo dominio (fondo + rango de fechas):
 * - `neto`: variación neta de afiliados (estimado derivado de /afiliado).
 * - `traslados`: balance neto por OPC y top de flujos (datos directos de
 *   /lt, sin transformaciones que inventen valores).
 *
 * El selector de vista vive en la URL (`vista=neto|traslados`), igual que
 * en los demás selectores de la app.
 */
export function Traslados({ afiliados, trasladosMatriz }: Props) {
  const [vista, setVista] = useUrlParam(
    'vista',
    v => v === 'neto' || v === 'traslados',
    'neto',
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['neto', 'traslados'] as const).map(v => (
          <button
            key={v}
            type="button"
            aria-pressed={vista === v}
            aria-label={v === 'neto' ? 'Variación neta de afiliados' : 'Traslados reales (libre transferencia)'}
            onClick={() => setVista(v)}
            className={chipClass(vista === v)}
          >
            {v === 'neto' ? 'Variación neta' : 'Traslados'}
          </button>
        ))}
      </div>

      {vista === 'neto' ? (
        <VariacionNetaChart data={afiliados} />
      ) : (
        <>
          <BalanceTrasladosChart data={trasladosMatriz} />
          <TopFlujosTable data={trasladosMatriz} />
        </>
      )}
    </div>
  )
}
