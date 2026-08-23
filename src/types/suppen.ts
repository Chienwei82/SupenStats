export interface Comision {
  Entidad: string
  Fondo: string
  FechaCorte: string
  ComisionTotal: number
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

export type FondoTipo = 'ROP' | 'FCL' | 'VOL' | 'BASI' | 'OCUP'

export interface DateRange {
  FechaInicio: string
  FechaFinal: string
}

export interface ApiState<T> {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => void
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
  codigoisin: string
  descripcion: string
  monto: number | null
  porcentaje: number | null
}
