/**
 * Catálogo de países para el selector de dirección.
 * Los códigos son ISO 3166-1 alpha-2 y deben coincidir con los catálogos
 * generados en src/shared/data/postalCodes/ (scripts/buildPostalCodes.mjs).
 */
export interface CountryOption {
  code: string
  name: string
}

export const COUNTRIES: CountryOption[] = [
  { code: 'MX', name: 'México' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'CA', name: 'Canadá' },
  { code: 'ES', name: 'España' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CL', name: 'Chile' },
]

export const DEFAULT_COUNTRY = 'MX'
