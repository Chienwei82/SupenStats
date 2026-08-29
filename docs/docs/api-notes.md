# Notas de la API real de SUPEN — Shapes confirmados

Fecha de verificación: probados a través del proxy Vite (dev server puerto 3000).

> Advertencia: estos shapes **difieren de los documentados en SPEC.md**. Las
> interfaces `Beneficio`, `Cuenta` y `LibreTransferencia` de `types/supen.ts`
> NO coinciden con la respuesta cruda real. Los tipos Raw se definieron desde
> la respuesta real verificada abajo.

## `GET /api/beneficio?Fondo=ROP&Entidad=<OPC>`

Devuelve un registro por cada combinación (sexo, rango edad, tipo de beneficio, fecha).
No es un resumen por OPC — viene desglosado.

```json
{
  "entidad": "BACSJ PENSIONES",
  "codigosexo": "F",
  "sexo": "FEMENINO",
  "codigorangoedad": 3,
  "rangoedad": " 45 A < 59",
  "codigotipobeneficio": "9",
  "tipobeneficio": "RETIRO TOTAL",
  "beneficio": 2,
  "beneficiocolones": 504314.27,   // notar: "beneficiocolones" (sin más)
  "beneficiodolares": 908.67,
  "fecha": "2010-01-31T00:00:00",
  "codigoregimen": 2,
  "régimen": "RÉGIMEN OBLIGATORIO COMPLEMENTARIO",
  "codigofondo": "ROP",
  "fondo": "PENSIÓN OBLIGATORIA COMPLEMENTARIA"
}
```

Tipos de beneficio vistos: `RENTA PERMANENTE`, `RENTA TEMPORAL*`, `RETIRO PROGRAMADO`,
`RETIRO TOTAL`, `TREINTA PAGOS...`. Campo cantidad = `beneficio`.

## `GET /api/cuenta?Fondo=ROP&Entrada=POPULAR`

Devuelve un desglose por categoría de cuenta (NO es cuentas+saldo promedio como dice SPEC).

```json
{
  "entidad": "BN-VITAL",
  "codigocuenta": "0110000000000",
  "cuenta": "ACTIVO NETO DEL FONDO DE PENSIONES",  // o ACTIVO, GASTOS, INGRESOS, PASIVO, PATRIMONIO, VALOR DE LA CUOTA...
  "montocolones": 283997708542.07,
  "montodolares": 511707582.9586847,
  "fecha": "2010-01-31T00:00:00",
  "codigoregimen": 2,
  "régimen": "RÉGIMEN OBLIGATORIO COMPLEMENTARIO",
  "codigofondo": "ROP",
  "fondo": "PENSIÓN OBLIGATORIA COMPLEMENTARIA"
}
```

Categorías (campo `cuenta`): `ACTIVO`, `GASTOS`, `INGRESOS`, `INVERSIONES ...`,
`PASIVO`, `PATRIMONIO`, `VALOR DE LA CUOTA `, `ACTIVO NETO DEL FONDO...`.

## `GET /api/lt` (libre transferencia)

Devuelveunamatriz: fila por OPC **origen**, con columnas por OPC **destino** tanto en
cantidad (`_C`) como en monto (`_M`). Campo de origen = `entidadorigen`.

```json
{
  "entidadorigen": "BCR-PENSION",
  "codigomoneda": 1,
  "moneda": "COLONES",
  "BN_VITAL_C": 0, "BN_VITAL_M": 0,
  "INS_PENSIONES_C": 0, "INS_PENSIONES_M": 0,
  "POPULAR_C": 149, "POPULAR_M": 127611552.07,
  "VIDA_PLENA_C": 77, "VIDA_PLENA_M": 97625159.48,
  "BACSJ_PENSIONES_C": 46, "BACSJ_PENSIONES_M": 32917338.24,
  "BCR_PENSION_C": 0, "BCR_PENSION_M": 0,
  "CCSS_OPC_C": 3, "CCSS_OPC_M": 6503565.18,
  "fecha": "2010-07-31T00:00:00",
  "codigoregimen": 2,
  "régimen": "RÉGIMEN OBLIGATORIO COMPLEMENTARIO",
  "codigofondo": "ROP",
  "fondo": "PENSIÓN OBLIGATORIA COMPLEMENTARIA"
}
```

Claves OPC destino: `BN_VITAL`, `INS_PENSIONES`, `POPULAR`, `VIDA_PLENA`,
`IBP_PENSIONES`, `BACSJ_PENSIONES`, `BCR_PENSION`, `CCSS_OPC`.

## `GET /api/portafolioisin`

- Devuelve el detalle por ISIN.
- **Tiempo de espera**: igual que `portafolio`, devuelve data desde 2010 y es muy pesado
  (sin filtro de fechas son ~200k registros / 144MB). Requiere la misma restricción de
  rango que `portafolio` (`PORTFOLIO_RANGE`).
- **Shape real confirmado** (verificado contra la API): análogo a `portafolio` pero con
  campos `isin` (código del título) y `emisor_gestor` (emisor legible). NO existen los
  campos `codigoisin`/`descripcion`/`monto`/`porcentaje`.
- **Doble conteo**: cada posición aparece dos veces con `tipo` = `EMISOR` y `GESTOR`
  (mismo monto repetido). El transformador conserva solo `EMISOR`.
- `Entidad` NO filtra (igual que en el resto de endpoints).

```json
{
  "entidad": "BN-VITAL",
  "isin": "CRBCCR0C3628",
  "tipo": "EMISOR",
  "emisor_gestor": "BANCO POPULAR DESARROLLO COMUNAL",
  "montocolones": 40536816905,
  "fecha": "2026-01-31T00:00:00",
  "codigofondo": "ROP",
  "fondo": "PENSIÓN OBLIGATORIA COMPLEMENTARIA"
}
```

## `GET /api/afiliado` — preservación existente

```json
{
  "entidad": "BACSJ PENSIONES",
  "codigosexo": "F", "sexo": "FEMININ",
  "codigorangoedad": 4, "rangoedad": "59 A < 100",
  "afiliados": null,        // NULL en registros antiguos, poblado en recientes
  "aportantes": null,
  "salario_o_aporte_colones": 2234004,
  "salario_o_aporte_dolares": 4415.9,
  "fecha": "2010-04-30T00:00:00", ...
}
```

- `afiliados` y `aportantes` son `null` en registros históricos (2010-2014 aprox) y
  poblados en los recientes. El transformador existente usa `?? 0` — sumará 0 en los
  históricos, lo que explica por qué el total dio números raros.
- Campos disponibles: `sexo`, `rangoedad`, `afiliados`, `aportantes`, `salario_o_aporte_*`.