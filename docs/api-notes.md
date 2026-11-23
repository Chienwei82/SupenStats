# Notas de la API de SUPEN

Documentación sobre los endpoints de la API pública de SUPEN consumidos por este proyecto.

## Endpoint base

Producción: `https://webapps.supen.fi.cr/Estadisticas/ui`

En desarrollo se usa proxy de Vite configurado en `vite.config.ts` bajo el path `/estadisticas`.

## Endpoints consumidos

| Endpoint | Descripción | Campos clave |
|----------|-------------|--------------|
| `/rendimiento` | Rentabilidad de fondos por operadora | Entidad, FechaCorte, RendimientoNominal, RendimientoReal |
| `/comisiones` | Comisiones cobradas | Entidad, FechaCorte, Comisión |
| `/activos` | Activos netos por fondo | Entidad, FechaCorte, ActivosNetos |
| `/cuentas` | Desglose contable | Entidad, FechaCorte, Cuentas |
| `/afiliados` | Afiliados por operadora | Entidad, FechaCorte, Afiliados |
| `/aportantes` | Aportantes activos | Entidad, FechaCorte, Aportantes |
| `/beneficios` | Pensionados y beneficios | Entidad, FechaCorte, Beneficios |
| `/demografia` | Distribución por sexo y edad | Entidad, FechaCorte, Sexo, Edad, Cantidad |
| `/piramide` | Pirámide poblacional | Entidad, FechaCorte, Edad, Sexo, Población |
| `/transferencias` | Transferencias entre fondos | Entidad, FechaCorte, Monto, Personas |
| `/traslados` | Flujos entre operadoras | EntidadOrigen, EntidadDestino, FechaCorte, Monto |
| `/isin` | Instrumentos ISIN | CódigoISIN, Entidad, FechaCorte, Valor |
| `/portafolio` | Distribución de inversiones | Entidad, FechaCorte, Instrumento, Porcentaje |

## Reglas de transformación

1. **Campos crudos** vienen en minúscula con acentos (ej. `beneficiocolones`, `fechaCorte`)
2. **Tipos de dominio** usan PascalCase (ej. `BeneficioColones`, `FechaCorte`)
3. **Null se preserva**: un valor ausente es "no disponible", nunca se convierte en `0`
4. **Fechas**: se parsean con `parseDate` y se formatean con `formatDate` / `formatDateShort`

## Validación de respuestas

Todas las respuestas se validan con `assertArray` para asegurar que sean arreglos antes de procesar. Si la API devuelve un objeto vacío o null, se maneja como error.

## Timeout

El fetcher tiene un timeout de 90 segundos para evitar peticiones colgadas.

## Limitaciones conocidas

- La API puede tener límites de rate limiting
- Algunos endpoints pueden no tener datos para todas las fechas
- Los valores nulos indican falta de dato, no cero
- No hay autenticación requerida (datos públicos)

## Referencia

Para el detalle completo de endpoints y formas de respuesta, consultar la documentación oficial de SUPEN o inspeccionar las respuestas reales en las herramientas de desarrollador del navegador.

