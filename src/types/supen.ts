export interface Comision {
  Entidad: string
  Fondo: string
  FechaCorte: string
  /** null = la API no reporta comisión para este registro; nunca representar como 0. */
  ComisionTotal: number | null
}

export interface Rendimiento {
  Entidad: string
  Fondo: string
  FechaCorte: string
  RendimientoNominal: number
  RendimientoReal: number
  ValorCuota: number
}

export interface Portafolio {
  Entidad: string
  Fondo: string
  FechaCorte: string
  TipoInstrumento: string
  Monto: number
}

export interface PortafolioISIN {
  Entidad: string
  Fondo: string
  FechaCorte: string
  CodigoISIN: string
  Descripcion: string
  Monto: number
  Porcentaje: number
}

export interface Afiliado {
  Entidad: string
  Fondo: string
  FechaCorte: string
  CantidadAfiliados: number
  MontoAportes: number
}

export interface Beneficio {
  Entidad: string
  Fondo: string
  FechaCorte: string
  CantidadPensionados: number
  MontoBeneficios: number
}

export interface Cuenta {
  Entidad: string
  Fondo: string
  FechaCorte: string
  CuentaTipo: string
  MontoColones: number
}

export interface LibreTransferencia {
  Entidad: string
  Fondo: string
  FechaCorte: string
  CantidadTransferencias: number
  MontoTransferido: number
}

// Afiliados con aportantes (usado en el reporte 'Aportantes vs Afiliados')
export interface AfiliadoAportante {
  Entidad: string
  Fondo: string
  FechaCorte: string
  CantidadAfiliados: number
  CantidadAportantes: number
}

// Afiliados con desglose demograficos (sexo y rango de edad)
export interface AfiliadoDemografico {
  Entidad: string
  Fondo: string
  FechaCorte: string
  Sexo: string
  RangoEdad: string
  CantidadAfiliados: number
}

// Rendimiento por periodicidad para el reporte 'Rentabilidad nominal vs real'.
// A diferencia de `Rendimiento` (que fija ANUAL y usa 0), aquí se conserva la
// periodicidad y los valores ausentes como null: null significa "no disponible"
// y nunca debe representarse como 0 en la UI.
export interface RendimientoComparado {
  Entidad: string
  Fondo: string
  FechaCorte: string
  Periodicidad: string
  Nominal: number | null
  Real: number | null
}

// Serie cruda de rentabilidad conservando periodicidad, tipo y valores null.
// Usada por el simulador para calcular la rentabilidad histórica promedio por
// OPC (sin sustituir ausencias por 0).
export interface RentabilidadSerie {
  Entidad: string
  Fondo: string
  FechaCorte: string
  Tipo: 'NOMINAL' | 'REAL'
  Periodicidad: string
  Rentabilidad: number | null
}

// Beneficios (pensionados) preservando la dimensión demográfica sexo/rango de
// edad, que transformBeneficios descarta. Usada por la pirámide poblacional.
export interface BeneficioDemografico {
  Entidad: string
  Fondo: string
  FechaCorte: string
  Sexo: string
  RangoEdad: string
  TipoBeneficio: string
  /** null = la API no reporta pensionados para esa celda; no representar como 0. */
  CantidadPensionados: number | null
}

// Dataset combinado para el reporte 'Comisiones vs rentabilidad'. La ruta
// compone dos endpoints en una sola query y devuelve un único registro con
// ambas series crudas ya transformadas.
export interface ComisionRentabilidadDataset {
  comisiones: Comision[]
  rendimientos: RendimientoComparado[]
}

// Un punto del scatter de comisiones vs rentabilidad (solo pares completos).
export interface PuntoComisionRentabilidad {
  Entidad: string
  Comision: number
  Rentabilidad: number
}

// OPC que no pudo emparejarse (falta comisión o rentabilidad en el corte común).
export interface ExcluidoComisionRentabilidad {
  Entidad: string
  Motivo: 'sin comisión' | 'sin rentabilidad' | 'sin rentabilidad real'
}

// Fila del reporte 'Rentabilidad nominal vs real': una por OPC en un
// (periodicidad, corte). null = no disponible (mostrar explícitamente).
export interface RentabilidadComparada {
  Entidad: string
  Fondo: string
  FechaCorte: string
  Periodicidad: string
  Nominal: number | null
  Real: number | null
}

// ---------------------------------------------------------------------------
// Reporte 'Traslados entre operadoras'
// ---------------------------------------------------------------------------

/** Una observación mensual del total de afiliados de una OPC. */
export interface AfiliadoMensual {
  Entidad: string
  Fondo: string
  FechaCorte: string
  /** null = la API no reportó el conteo para esa celda (ej. periodos
   *  históricos donde `afiliados` viene null). Nunca se representa como 0. */
  CantidadAfiliados: number | null
}

/** Punto de la serie de variación neta: { fecha, [opc]: delta | null }. */
export interface VariacionPunto {
  fecha: string
  [entidad: string]: string | number | null
}

/** Balance mensual de traslados por OPC (vista B1). */
export interface TrasladoBalance {
  fecha: string
  Entidad: string
  Ingresos: number
  Salidas: number
  Neto: number
}

/** Flujo agregado origen→destino en el rango (vista B2). */
export interface TrasladoFlujo {
  Origen: string
  Destino: string
  Cantidad: number
  Monto: number
}

export type FondoTipo = 'ROP' | 'FCL' | 'VOL' | 'BASI' | 'OCUP' | 'VOLCA' | 'VOLCB' | 'VOLDA' | 'VOLDB'

export interface DateRange {
  FechaInicio: string
  FechaFinal: string
}

// ---------------------------------------------------------------------------
// Tipos crudos de la API real de SUPEN
// La API devuelve los campos en minúscula y con tildes, con una estructura
// distinta a la de los tipos de dominio (PascalCase). Estos tipos reflejan la
// respuesta real para poder transformarla correctamente.
// ---------------------------------------------------------------------------

export interface RawComision {
  entidad: string
  tipo: string // 'APORTE' | 'RENDIMIENTO' | 'SALDO'
  'comisión': number | null
  fecha: string
  codigoregimen: number
  'régimen': string
  codigofondo: string
  fondo: string
}

export interface RawRendimiento {
  entidad: string
  tipo: string // 'NOMINAL' | 'REAL'
  periodicidad: string // 'ANUAL' | '3 AÑOS' | '5 AÑOS' | '10 AÑOS' | 'HISTÓRICA'
  rentabilidad: number | null
  fecha: string
  codigoregimen: number
  'régimen': string
  codigofondo: string
  fondo: string
}

export interface RawPortafolio {
  entidad: string
  instrumento: string
  montocolones: number | null
  montodolares: number | null
  fecha: string
  codigofondo: string
  fondo: string
}

export interface RawAfiliado {
  entidad: string
  codigosexo: string
  sexo: string
  rangoedad: string
  afiliados: number | null
  aportantes: number | null
  fecha: string
  codigofondo: string
  fondo: string
}

export interface RawBeneficio {
  entidad: string
  codigosexo: string
  sexo: string
  rangoedad: string
  tipobeneficio: string
  beneficio: number | null
  beneficiocolones: number | null
  fecha: string
  codigofondo: string
  fondo: string
}

export interface RawCuenta {
  entidad: string
  cuenta: string
  montocolones: number | null
  fecha: string
  codigofondo: string
  fondo: string
}

export interface RawLibreTransferencia {
  entidadorigen: string
  [clave: string]: string | number | null
}

export interface RawPortafolioISIN {
  entidad: string
  fecha: string
  codigofondo: string
  fondo: string
  /** Código ISIN del título (campo real de la API). */
  isin: string
  /** Emisor/gestor legible del título (campo real de la API). */
  emisor_gestor: string
  /** 'EMISOR' | 'GESTOR' — la misma posición se repite en ambos tipos. */
  tipo: string
  montocolones: number | null
}
