import axios from 'axios'
import { getToken, getRefreshToken, getRememberMe, clearAllAuth, saveToken, saveRefreshToken } from './storage'
import { useAuthStore } from '@features/auth/store/authStore'

/* ─── Configuración ───────────────────────────────────────────────── */

const REFRESH_ENDPOINT = '/autenticacion/renovar-token'
const PUBLIC_ROUTES = ['/auth']

/** Rutas donde NUNCA redirigimos a /auth (evita loops en páginas públicas) */
function isPublicRoute() {
  return PUBLIC_ROUTES.includes(window.location.pathname)
}

/* ─── Token forzado: limpiar y redirigir ───────────────────────────── */

function forceLogout(message) {
  clearAllAuth()
  useAuthStore.getState().logout()
  // NO usamos window.location.href porque eso hace push al historial
  // del navegador. En su lugar, el cambio de estado en el store provoca
  // que ProtectedRoute detecte la ausencia de token y redirija a '/'
  // con <Navigate replace />, manteniendo el historial limpio.
}

/* ─── ETag Cache ──────────────────────────────────────────────────── */
// Almacena ETags de respuestas GET para enviar If-None-Match.
// Key: URL completa (path + query string)
// Value: { etag: string, data: any, status: number }
const etagCache = new Map()

function getEtagKey(config) {
  // Solo para GETs, usar URL completa como key
  if (config.method !== 'get') return null
  const base = config.baseURL ?? ''
  const url = config.url ?? ''
  return `${config.method}:${base}${url}`
}

/* ─── Axios instance ──────────────────────────────────────────────── */

// 🛡️ Prevenir bug de conversión de rutas POSIX-to-Windows de Git Bash en Windows (ej. convirtiendo "/api" en "C:/Program Files/Git/api")
let rawApiUrl = import.meta.env.VITE_API_URL
if (rawApiUrl && (rawApiUrl.includes('Git') || /^[a-zA-Z]:[/\\]/.test(rawApiUrl))) {
  rawApiUrl = '/api'
}

const api = axios.create({
  baseURL: rawApiUrl ?? '/api',
})

// Instance aislada para el refresh (sin interceptores, evita loops)
const refreshClient = axios.create({ baseURL: rawApiUrl ?? '/api' })

/* ─── Cola de peticiones pendientes durante refresh ────────────────── */

let isRefreshing = false
let failedQueue = []


/* ─── Interceptor de Request ──────────────────────────────────────── */

api.interceptors.request.use(cfg => {
  const storeToken = useAuthStore.getState().token
  const storageToken = getToken()

  // Storage fue limpiado pero store aún tiene token → logout forzado
  if (storeToken && !storageToken) {
    forceLogout('storage_cleared')
    return Promise.reject(new Error('Storage cleared, session invalidated'))
  }

  if (storageToken) cfg.headers.Authorization = `Bearer ${storageToken}`

  // ─── ETag: enviar If-None-Match si tenemos un ETag previo ──────
  const etagKey = getEtagKey(cfg)
  if (etagKey) {
    const cached = etagCache.get(etagKey)
    if (cached?.etag) {
      cfg.headers['If-None-Match'] = cached.etag
    }
  }

  return cfg
})

/* ─── Interceptor de Response (ETag) ─────────────────────────────── */

api.interceptors.response.use(
  response => {
    // ─── Capturar ETag de la respuesta (solo GETs con 200) ─────────
    const etagKey = getEtagKey(response.config)
    if (etagKey && response.status === 200) {
      const etag = response.headers['etag']
      if (etag) {
        etagCache.set(etagKey, {
          etag,
          data: response.data,
          status: response.status,
        })
      }
    }
    return response
  },
  // ─── Error handler: capturar 304 (axios lo lanza como error) ────
  error => {
    const { response, config } = error
    // Solo procesar 304 en peticiones GET
    if (response?.status === 304 && config?.method === 'get') {
      const etagKey = getEtagKey(config)
      const cached = etagKey ? etagCache.get(etagKey) : null
      if (cached) {
        // Devolver datos cacheados como si fuera 200
        return {
          data: cached.data,
          status: 200,
          statusText: 'OK (304 cached)',
          headers: { ...response.headers, 'x-etag-cache': 'hit' },
          config,
        }
      }
    }
    // Para cualquier otro error, propagar
    return Promise.reject(error)
  }
)

/* ─── Interceptor de Response (Error + 401 refresh) ──────────────── */

api.interceptors.response.use(
  r => r,
  async err => {
    const originalRequest = err.config

    // 1. Solo procesamos 401
    if (err.response?.status !== 401) {
      return Promise.reject(err)
    }

    // 2. Evitar loop: si ya se reintentó o es petición de refresh → rechazar
    if (originalRequest._retry) {
      return Promise.reject(err)
    }

    // 3. En páginas públicas (/, /auth, /explore) no intentamos refresh
    if (isPublicRoute()) {
      return Promise.reject(err)
    }

    // 4. Ya hay un refresh en curso → encolar esta petición
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      }).catch(e => Promise.reject(e))
    }

    // 5. Iniciar proceso de refresh
    originalRequest._retry = true
    isRefreshing = true

    // 6. Recuperar refresh token del storage
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      // No hay refresh token → sesión expirada o limpiada
      const pendingQueue = [...failedQueue]
      failedQueue = []
      isRefreshing = false
      pendingQueue.forEach(({ reject }) => reject(new Error('No refresh token')))
      forceLogout('refresh_token_missing')
      return Promise.reject(err)
    }

    try {
      // 7. POST /autenticacion/renovar-token { tokenRefresco }
      const { data } = await refreshClient.post(REFRESH_ENDPOINT, { tokenRefresco: refreshToken })

      const newToken = data.tokenAcceso
      const newRefresh = data.tokenRefresco ?? refreshToken
      const rememberMe = getRememberMe()

      // 8. Actualizar storage (respetando rememberMe)
      saveToken(newToken, rememberMe)
      saveRefreshToken(newRefresh, rememberMe)

      // 9. Actualizar Zustand store (solo token y refresh, el user se mantiene)
      useAuthStore.setState({
        token: newToken,
        refreshToken: newRefresh,
      })

      // 10. Capturar la cola ANTES de resetear flags (evita race condition)
      const pendingQueue = [...failedQueue]
      failedQueue = []
      isRefreshing = false

      // 11. Reintentar la petición original con el nuevo token
      originalRequest.headers.Authorization = `Bearer ${newToken}`

      // 12. Despertar todas las peticiones encoladas
      pendingQueue.forEach(({ resolve }) => resolve(newToken))

      return api(originalRequest)
    } catch (refreshErr) {
      // Capturar cola antes de resetear flags
      const pendingQueue = [...failedQueue]
      failedQueue = []
      isRefreshing = false

      // Rechazar todas las peticiones encoladas
      pendingQueue.forEach(({ reject }) => reject(refreshErr))

      // Solo forzar logout si el refresh devolvió 401
      // (token inválido/expirado). Errores de red o 500 NO
      // deben expulsar al usuario.
      if (refreshErr.response?.status === 401) {
        forceLogout('session_expired')
      }

      return Promise.reject(refreshErr)
    }
  }
)

export default api
