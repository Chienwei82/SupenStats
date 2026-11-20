import { useEffect } from 'react'

/**
 * Metadatos de una página para SEO dinámico (SPA).
 * TanStack Router no renderiza <head> por ruta, así que actualizamos el
 * documento en un efecto: título, descripción, canónica y datos estructurados
 * JSON-LD (schema.org). Al desmontar se restaura el título base para no dejar
 * el título de una subpágina al volver al inicio.
 */
export interface PageMeta {
  /** Título completo de la pestaña (ej. "Glosario · SUPEN Stats"). */
  title: string
  /** Descripción para <meta name="description"> y Open Graph. */
  description?: string
  /** Ruta canónica relativa (ej. "/glosario"); se antepone el origen. */
  path?: string
  /** Objeto (o lista) de datos estructurados schema.org inyectado como JSON-LD. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

function setMetaByName(name: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setMetaByProperty(property: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Asegura (o crea) un único <script type="application/ld+json" data-supen>. */
function setJsonLd(json: string): void {
  let el = document.head.querySelector<HTMLScriptElement>('script[data-supen="jsonld"]')
  if (!el) {
    el = document.createElement('script')
    el.setAttribute('type', 'application/ld+json')
    el.setAttribute('data-supen', 'jsonld')
    document.head.appendChild(el)
  }
  el.textContent = json
}

/**
 * Hook de SEO por ruta. Establece `document.title`, la meta description, la
 * etiqueta canónica y, opcionalmente, JSON-LD. Pensado para llamarse una vez
 * en el componente de cada página.
 */
export function usePageMeta({ title, description, path, jsonLd }: PageMeta): void {
  // Serializamos el JSON-LD para usarlo como dependencia estable (un objeto
  // inline se recrearía en cada render y relanzaría el efecto).
  const jsonLdStr = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    if (description) {
      setMetaByName('description', description)
      setMetaByProperty('og:description', description)
    }
    if (path) {
      const canonical = `${window.location.origin}${path}`
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', canonical)
      setMetaByProperty('og:url', canonical)
    }
    if (jsonLdStr) setJsonLd(jsonLdStr)

    return () => {
      // Restauramos el título base al salir de la página.
      document.title = prevTitle
    }
  }, [title, description, path, jsonLdStr])
}