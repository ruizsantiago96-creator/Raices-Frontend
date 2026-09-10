/**
 * Generador de catálogos locales de códigos postales (offline, sin API keys).
 * ===========================================================================
 * Fuente de datos: GeoNames postal codes (CC BY 4.0) — https://www.geonames.org/export/zip/
 *
 * Descarga los .zip por país, compacta cada uno a un JSON pequeño
 * (clave = código postal; valor = [estado, municipio, ...zonas]) y los
 * escribe en src/shared/data/postalCodes/.
 *
 * Uso:
 *   node scripts/buildPostalCodes.mjs                # usa /tmp/geonames si existe
 *   OUT_DIR=/tmp/geonames node scripts/buildPostalCodes.mjs
 *
 * Licencia de los datos generados: CC BY 4.0 (GeoNames).
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

/** Países incluidos en el bundle inicial (agregar más = re-ejecutar). */
const COUNTRIES = ['MX', 'US', 'CA', 'ES', 'AR', 'CO', 'CL']

/** Nombre legible (es) por código ISO 3166-1 alpha-2. */
export const COUNTRY_NAMES = {
  MX: 'México', US: 'Estados Unidos', CA: 'Canadá', ES: 'España',
  AR: 'Argentina', CO: 'Colombia', CL: 'Chile', PE: 'Perú',
  BR: 'Brasil', EC: 'Ecuador', UY: 'Uruguay', PY: 'Paraguay',
  BO: 'Bolivia', VE: 'Venezuela', GT: 'Guatemala', CR: 'Costa Rica',
  PA: 'Panamá', DO: 'República Dominicana', CU: 'Cuba', HN: 'Honduras',
  NI: 'Nicaragua', SV: 'El Salvador', PR: 'Puerto Rico', FR: 'Francia',
  DE: 'Alemania', IT: 'Italia', PT: 'Portugal', GB: 'Reino Unido',
  NL: 'Países Bajos', BE: 'Bélgica', CH: 'Suiza', AT: 'Austria',
  PL: 'Polonia', JP: 'Japón', AU: 'Australia', NZ: 'Nueva Zelanda',
}

const OUT_DIR = path.resolve('src/shared/data/postalCodes')
const RAW_DIR = process.env.OUT_DIR || '/tmp/geonames'

function download(cc) {
  const zipPath = path.join(RAW_DIR, `${cc}.zip`)
  const txtPath = path.join(RAW_DIR, `${cc}.txt`)
  if (!existsSync(txtPath)) {
    if (!existsSync(zipPath)) {
      console.log(`  ↓ descargando ${cc}...`)
      execFileSync('curl', ['-sL', `https://download.geonames.org/export/zip/${cc}.zip`, '-o', zipPath], { stdio: 'inherit' })
    }
    execFileSync('unzip', ['-o', zipPath, '-d', RAW_DIR], { stdio: 'inherit' })
  }
  return txtPath
}

/**
 * Compacta el dump TSV de GeoNames a:
 *   { "20000": ["Aguascalientes", "Aguascalientes", "Zona Centro", ...],
 *     "09810": ["Ciudad de México", "Venustiano Carranza", "Valentino", ...] }
 * La clave es el CP; el valor guarda una sola vez el estado y el municipio,
 * seguidos de las zonas/colonias (F3) para ese CP.
 */
function compact(cc) {
  const txt = download(cc)
  const lines = readFileSync(txt, 'utf8').split('\n')
  const byPostal = new Map()

  for (const line of lines) {
    const f = line.split('\t')
    if (f.length < 11 || !f[1]) continue
    const postal = f[1].trim()
    const state = (f[3] || '').trim()
    const admin2 = (f[5] || '').trim()
    const zone = (f[2] || '').trim()

    if (!byPostal.has(postal)) byPostal.set(postal, [state, admin2])
    const entry = byPostal.get(postal)
    if (zone && !entry.includes(zone)) entry.push(zone)
  }

  // JSON compacto: sin espacios; orden de claves por CP para diffs estables
  const sorted = Object.fromEntries([...byPostal.entries()].sort(([a], [b]) => a.localeCompare(b)))
  return JSON.stringify(sorted)
}

mkdirSync(OUT_DIR, { recursive: true })

for (const cc of COUNTRIES) {
  console.log(`→ ${cc}`)
  const json = compact(cc)
  const file = path.join(OUT_DIR, `${cc}.json`)
  writeFileSync(file, json)
  const entries = Object.keys(JSON.parse(json)).length
  console.log(`   ${entries} CPs · ${(json.length / 1024).toFixed(0)} KB → ${file}`)
}

// Índice de países disponibles para la UI
writeFileSync(
  path.join(OUT_DIR, 'index.json'),
  JSON.stringify(COUNTRIES.map(cc => ({ code: cc, name: COUNTRY_NAMES[cc] ?? cc })))
)
console.log(`→ index.json (${COUNTRIES.length} países)`)
