import { useState } from 'react'
import { useBadges } from '../../hooks/useBadges'

/**
 * BadgeToast — Notificación flotante que se muestra cuando se desbloquea
 * una nueva insignia. Aparece en la esquina inferior derecha y se cierra
 * al hacer clic.
 *
 * Accesibilidad: anuncia la insignia con `aria-live="polite"` y puede
 * cerrarse con la tecla Escape.
 */
export function BadgeToast() {
  const { newBadges, markNotified, hasNew } = useBadges()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const badge = newBadges.find(b => !dismissed.has(b.id))

  const close = () => {
    if (!badge) return
    setDismissed(prev => new Set(prev).add(badge.id))
    markNotified(badge.id)
  }

  if (!hasNew || !badge) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Insignia desbloqueada: ${badge.name}`}
      className="fixed bottom-4 right-4 z-50"
      onKeyDown={e => {
        if (e.key === 'Escape') close()
      }}
    >
      <div
        className="
          flex items-center gap-3
          rounded-xl border border-green-200 dark:border-[#34324a]
          bg-green-50 dark:bg-[#252a3a] p-4 shadow-lg
          animate-in fade-in slide-in-from-right-2 duration-300
        "
      >
        <span className="text-3xl">{badge.emoji}</span>
        <div>
          <h3 className="font-semibold text-green-900 dark:text-[#89ddff]">
            ¡Insignia desbloqueada!
          </h3>
          <p className="text-sm text-green-800 dark:text-[#a6accd]">
            {badge.name} — {badge.description}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          className="ml-auto p-1 text-green-600 dark:text-[#82aaff] hover:bg-green-100 dark:hover:bg-[#34324a] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Cerrar notificación de insignia"
        >
          ✕
        </button>
      </div>
    </div>
  )
}