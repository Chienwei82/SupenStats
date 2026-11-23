# Referencia de componentes UI

Esta documentación describe los componentes base reutilizables en `src/components/ui/`.

## ChartCard

Contenedor visual estándar para todos los gráficos de reportes.

```tsx
<ChartCard
  title="Título del gráfico"
  subtitle={<span>Subtítulo opcional</span>}
  description="Descripción accesible para lectores de pantalla"
>
  {/* Contenido del gráfico (Recharts, tabla, etc.) */}
</ChartCard>
```

**Props:**
| Prop | Tipo | Descripción |
|------|------|-------------|
| `title` | `string` | Título del gráfico |
| `subtitle?` | `ReactNode` | Contenido opcional bajo el título |
| `description?` | `string` | Descripción accesible (aria-label) |
| `children` | `ReactNode` | Contenido del gráfico |

**Accesibilidad:** Usa `role="group"` y `aria-label` con el título y descripción.

## ReportView

Contenedor estándar que gestiona los tres estados de carga: primera carga, refetch con datos previos, y error.

```tsx
<ReportView
  loading={loading}
  error={error}
  dataCount={data.length}
  onRetry={refetch}
>
  <ChartCard title="Mi reporte">...</ChartCard>
</ReportView>
```

**Comportamiento:**
| loading | error | dataCount | Estado mostrado |
|---------|-------|-----------|-----------------|
| true | any | 0 | Esqueleto de carga |
| false | null | > 0 | Contenido normal |
| false | mensaje | 0 | Error + botón de reintento |
| false | mensaje | > 0 | Contenido + error encima |

## KpiCard

Tarjeta para mostrar un indicador clave de rendimiento (KPI).

```tsx
<KpiCard label="Rentabilidad nominal" value="7.25%" />
```

## ChartNote

Componente que muestra una nota educativa asociada a un gráfico, con metodología y limitaciones.

```tsx
<ChartNote noteId="rendimiento" />
```

## DataTable

Tabla de datos con ordenamiento, paginación y exportación.

```tsx
<DataTable
  rows={data}
  columns={columns}
  defaultSortKey="fecha"
  caption="Título de la tabla"
/>
```

## ExportButton

Botón para exportar datos a CSV.

```tsx
<ExportButton
  rows={data}
  columns={csvColumns}
  filename="reporte-datos"
/>
```

## FilterBar

Barra de filtros compartida entre reportes con selectores de fondo, fechas y métrica.

```tsx
<FilterBar
  fondos={fondos}
  onFondoChange={setFondo}
  fechas={dates}
  onFechasChange={setDates}
/>
```

## LoadingSkeleton / LoadingOverlay

- `ChartSkeleton`: esqueleto visual para la carga inicial de un gráfico.
- `LoadingOverlay`: overlay semitransparente mostrado durante refetch con datos previos.

## ErrorBoundary / ErrorMessage

- `ErrorBoundary`: captura errores de React en el árbol de componentes.
- `ErrorMessage`: muestra mensaje de error con botón de reintento.

## ThemeToggle

Toggle para alternar entre tema claro y oscuro con persistencia en localStorage.

## BadgeToast

Notificación flotante accesible que se muestra cuando se desbloquea una insignia.

```tsx
<BadgeToast badge={nuevoBadge} onClose={() => {}} />
```

## Confetti

Animación de confeti CSS-only (sin dependencias externas). Respeta `prefers-reduced-motion`.

```tsx
<Confetti trigger={mostrarConfetti} />
```

