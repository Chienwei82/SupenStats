/**
 * Utilidades de búsqueda de texto sin distinción de acentos ni mayúsculas.
 * Normaliza a NFD y elimina diacríticos para que "comision" encuentre "Comisión".
 */

/** Normaliza texto para comparación: minúsculas y sin diacríticos. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * true si `query` (normalizada) está contenida en `haystack` (normalizado).
 * Una consulta vacía coincide con todo.
 */
export function matchesQuery(haystack: string, query: string): boolean {
  const q = normalizeText(query)
  if (q === '') return true
  return normalizeText(haystack).includes(q)
}