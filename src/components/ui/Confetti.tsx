import { useEffect } from 'react'

/**
 * Confetti — Animación de confeti puramente CSS (sin dependencias extra).
 *
 * Se activa cuando `trigger` es true. Lanza partículas de colores desde el
 * centro del contenedor hacia arriba con rotación y desvanecimiento.
 * Respeta `prefers-reduced-motion` (no anima si el usuario lo ha desactivado).
 *
 * Uso:
 *   <Confetti trigger={showConfetti} />
 *   // Cambia `trigger` de false→true para lanzar, luego vuelve a false.
 */
export function Confetti({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (!trigger) return

    const colors = ['#7c4dff', '#82aaff', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']
    const particleCount = 60
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '0'
    container.style.left = '0'
    container.style.width = '100vw'
    container.style.height = '100vh'
    container.style.pointerEvents = 'none'
    container.style.zIndex = '9999'
    container.style.overflow = 'hidden'
    document.body.appendChild(container)

    const particles: HTMLElement[] = []

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div')
      const color = colors[i % colors.length]
      const size = Math.random() * 8 + 4
      const startX = Math.random() * 100
      const startY = Math.random() * 100
      const endX = startX + (Math.random() - 0.5) * 200
      const endY = startY - (Math.random() * 100 + 100)
      const rotate = Math.random() * 360
      const duration = Math.random() * 1 + 0.5

      p.style.position = 'absolute'
      p.style.left = `${startX}vw`
      p.style.top = `${startY}vh`
      p.style.width = `${size}px`
      p.style.height = `${size}px`
      p.style.backgroundColor = color
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '0'
      p.style.opacity = '0.9'
      p.style.transform = `rotate(${rotate}deg)`
      p.style.animation = `confetti-fall-${i} ${duration}s ease-out forwards`

      container.appendChild(p)
      particles.push(p)

      // Insertar keyframe dinámico para esta partícula.
      const keyframes = `
        @keyframes confetti-fall-${i} {
          0% { transform: translate(0, 0) rotate(${rotate}deg); opacity: 0.9; }
          100% { transform: translate(${endX - startX}vw, ${endY - startY}vh) rotate(${rotate + 360}deg); opacity: 0; }
        }
      `
      const style = document.createElement('style')
      style.textContent = keyframes
      document.head.appendChild(style)
      p.dataset.styleId = style.dataset.id = `confetti-${i}`
    }

    // Limpiar después de la animación más larga.
    const timer = setTimeout(() => {
      container.remove()
      for (const p of particles) {
        const styleId = p.dataset.styleId
        if (styleId) {
          const el = document.querySelector(`style[data-id="${styleId}"]`)
          el?.remove()
        }
      }
    }, 1500)

    return () => {
      clearTimeout(timer)
      container.remove()
      for (const p of particles) {
        const styleId = p.dataset.styleId
        if (styleId) {
          const el = document.querySelector(`style[data-id="${styleId}"]`)
          el?.remove()
        }
      }
    }
  }, [trigger])

  return null
}