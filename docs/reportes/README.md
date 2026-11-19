# Reportes

Cada reporte nuevo se documenta en su propia carpeta con dos archivos:

- `SPEC.md` — qué resuelve, cálculos, requerimientos y manejo de errores.
- `DESIGN.md` — cómo se implementa (rutas, tipos, transformers, plan).

## Índice

| Ubicación | Reporte | Estado |
|-----------|---------|--------|
| Raíz: `SPEC.md` / `DESIGN.md` | Rentabilidad real y Comisión vs. Rentabilidad | Implementado |
| `poder-adquisitivo/` | Poder adquisitivo de la pensión proyectada | Implementado (degrada sin BCCR) |
| `simulador-piramide/` | Simulador y pirámide poblacional | Implementado |
| `traslados/` | Traslados y variación neta de afiliados | Implementado |

## Convención

1. Crear `docs/reportes/<nombre>/SPEC.md` y `DESIGN.md` **antes** de implementar.
2. Verificar el shape real del endpoint en `docs/docs/api-notes.md`.
3. Implementar con `createReportRoute<T>` cuando sea posible.
4. Añadir el reporte a `ReportTabs` y documentar sus filtros.
5. Cerrar con `npm run verify` y `npm run build`.