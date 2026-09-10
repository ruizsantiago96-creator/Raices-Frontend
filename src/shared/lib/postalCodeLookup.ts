/**
 * Búsqueda local de códigos postales (offline, gratuita, sin API keys).
 * ============================================================================
 * - Catálogos: GeoNames postal codes (CC BY 4.0), compactados por país en
 *   `src/shared/data/postalCodes/<PAIS>.json` (ver scripts/buildPostalCodes.mjs).
 * - Validación de formato: postal-codes-js (Apache-2.0).
 * - Cada catálogo se descarga UNA vez por sesión (dynamic import → chunk
 *   separado por país) y se cachea en memoria.
 *
 * Forma de cada entrada:  { "20000": ["Aguascalientes", "Aguascalientes", "Zona Centro", ...] }
 *                          clave = CP · [0] = estado/provincia · [1] = municipio/ciudad · [2+] = zonas
 */

import postalCodes from 'postal-codes-js'

export interface PostalLocation {
  estado: string
  ciudad: string
  zonas: string[]
}

export type LookupStatus =
  | { status: 'encontrado'; location: PostalLocation }
  | { status: 'formato_invalido'; mensaje: string }
  | { status: 'no_encontrado' }          // formato válido pero sin datos → fallback manual
  | { status: 'catalogo_no_disponible' } // país sin catálogo local → fallback manual

type Catalog = Record<string, string[]>

/**
 * Catálogos disponibles: un chunk por país (dynamic import), cargado solo
 * cuando el usuario selecciona ese país. Agregar un país = generar su JSON
 * con scripts/buildPostalCodes.mjs y añadirlo aquí + a countries.ts.
 */
const catalogLoaders: Record<string, () => Promise<{ default: Catalog }>> = {
  MX: () => import('@shared/data/postalCodes/MX.json'),
  US: () => import('@shared/data/postalCodes/US.json'),
  CA: () => import('@shared/data/postalCodes/CA.json'),
  ES: () => import('@shared/data/postalCodes/ES.json'),
  AR: () => import('@shared/data/postalCodes/AR.json'),
  CO: () => import('@shared/data/postalCodes/CO.json'),
  CL: () => import('@shared/data/postalCodes/CL.json'),
}

const catalogCache = new Map<string, Catalog>()
const inflight = new Map<string, Promise<Catalog | null>>()

/** Carga (y memoiza) el catálogo del país indicado. null = no disponible. */
async function loadCatalog(countryCode: string): Promise<Catalog | null> {
  const cc = countryCode.toUpperCase()
  if (catalogCache.has(cc)) return catalogCache.get(cc)!
  if (inflight.has(cc)) return inflight.get(cc)!

  const loader = catalogLoaders[cc]
  if (!loader) return null

  const promise = loader()
    .then((mod: { default: Catalog }) => {
      catalogCache.set(cc, mod.default)
      return mod.default
    })
    .catch(() => null)
    .finally(() => inflight.delete(cc))

  inflight.set(cc, promise)
  return promise
}

/** Valida el formato del CP para el país; devuelve mensaje de error o null. */
export function validatePostalCodeFormat(countryCode: string, postalCode: string): string | null {
  const result = postalCodes.validate(countryCode.toUpperCase(), postalCode.trim())
  return result === true ? null : String(result)
}

/**
 * Busca estado/municipio/zonas por CP usando el catálogo local del país.
 * Nunca lanza: los errores se traducen a estados del tipo `LookupStatus`.
 */
export async function lookupPostalCode(countryCode: string, postalCode: string): Promise<LookupStatus> {
  const cc = countryCode.toUpperCase()
  const cp = postalCode.trim()

  if (!cc || !cp) return { status: 'no_encontrado' }

  const formatError = validatePostalCodeFormat(cc, cp)
  if (formatError) return { status: 'formato_invalido', mensaje: formatError }

  const catalog = await loadCatalog(cc)
  if (!catalog) return { status: 'catalogo_no_disponible' }

  // postal-codes-js acepta extensiones tipo "91746-2302": probamos también la parte principal
  const entry = catalog[cp] ?? catalog[cp.split(/[\s-]/)[0]]
  if (!entry || entry.length < 2) return { status: 'no_encontrado' }

  const [estado, ciudad, ...zonas] = entry
  return { status: 'encontrado', location: { estado, ciudad, zonas } }
}
