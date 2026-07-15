/**
 * Helper para gestionar el almacenamiento de tokens según la preferencia "Recordarme".
 *
 * Flujo estándar:
 *   rememberMe=true  → token en localStorage (sobrevive cierre de navegador)
 *   rememberMe=false → token en sessionStorage (se destruye al cerrar pestaña/navegador)
 *
 * La preferencia raices_remember SIEMPRE se guarda en localStorage (true o false)
 * para restaurar el estado del checkbox en el próximo login.
 */

const AUTH_TOKEN_KEY = 'raices_token'
const AUTH_REFRESH_KEY = 'raices_refresh'
const AUTH_USER_KEY = 'raices_user'
const REMEMBER_KEY = 'raices_remember'

// ─── Preferencia "Recordarme" ───────────────────────────────────────

/** Lee la preferencia Recordarme (siempre de localStorage). */
export function getRememberMe() {
  try {
    return localStorage.getItem(REMEMBER_KEY) === 'true'
  } catch {
    return false
  }
}

/** Guarda la preferencia Recordarme (siempre en localStorage, true o false). */
export function setRememberMe(value) {
  try {
    localStorage.setItem(REMEMBER_KEY, String(!!value))
  } catch { /* ignore */ }
}

// ─── Storage selector ────────────────────────────────────────────────

function getStorage(rememberMe) {
  return rememberMe ? localStorage : sessionStorage
}

// ─── Guardar (escritura) ────────────────────────────────────────────

export function saveToken(token, rememberMe) {
  const target = getStorage(rememberMe)
  const other = rememberMe ? sessionStorage : localStorage
  target.setItem(AUTH_TOKEN_KEY, token)
  try { other.removeItem(AUTH_TOKEN_KEY) } catch { /* ignore */ }
}

export function saveRefreshToken(refresh, rememberMe) {
  console.log('[Storage] saveRefreshToken called:', { refresh: !!refresh, rememberMe })
  if (!refresh) {
    console.warn('[Storage] saveRefreshToken: refresh is falsy, skipping')
    return
  }
  const target = getStorage(rememberMe)
  const other = rememberMe ? sessionStorage : localStorage
  target.setItem(AUTH_REFRESH_KEY, refresh)
  try { other.removeItem(AUTH_REFRESH_KEY) } catch { /* ignore */ }
  console.log('[Storage] Refresh token saved to:', rememberMe ? 'localStorage' : 'sessionStorage')
  console.log('[Storage] Verification - token stored:', !!target.getItem(AUTH_REFRESH_KEY))
}

export function saveUser(user, rememberMe) {
  if (!user) return
  const target = getStorage(rememberMe)
  const other = rememberMe ? sessionStorage : localStorage
  target.setItem(AUTH_USER_KEY, JSON.stringify(user))
  try { other.removeItem(AUTH_USER_KEY) } catch { /* ignore */ }
}

// ─── Leer (lectura) ─────────────────────────────────────────────────
// localStorage primero, sessionStorage después.
// Al iniciar la app buscamos primero en localStorage (sesión persistente).
// Si no está, buscamos en sessionStorage (sesión de pestaña).

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(AUTH_REFRESH_KEY) || sessionStorage.getItem(AUTH_REFRESH_KEY)
}

export function getUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ─── Limpiar (logout / 401) ────────────────────────────────────────
// Limpia tokens y usuario de AMBOS storages.
// NO toca raices_remember — la preferencia debe persistir para el
// próximo login y restaurar el estado del checkbox.

export function clearAllAuth() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_REFRESH_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    localStorage.removeItem('raices_auth')
  } catch { /* ignore */ }
  try {
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
    sessionStorage.removeItem(AUTH_REFRESH_KEY)
    sessionStorage.removeItem(AUTH_USER_KEY)
  } catch { /* ignore */ }
}


