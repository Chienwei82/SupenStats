export interface Comision {
  Entidad: string
  Fondo: string
  FechaCorte: string
  ComisionAdministracion: number
  ComisionReserva: number
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
  Porcentaje: number
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
  CantidadCuentas: number
  SaldoPromedio: number
}

export interface LibreTransferencia {
  Entidad: string
  FechaCorte: string
  CantidadTransferencias: number
  MontoTransferido: number
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
  sexo: string
  rangoedad: string
  afiliados: number | null
  aportantes: number | null
  fecha: string
  codigofondo: string
  fondo: string
}
