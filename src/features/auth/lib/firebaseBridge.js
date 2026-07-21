import axios from 'axios'

/**
 * Normaliza errores de la REST API de Firebase a mensajes legibles.
 * Firebase devuelve: { error: { message: "INVALID_PASSWORD", ... } }
 */
function normalizeFirebaseError(err) {
  const fbMessage = err.response?.data?.error?.message
  if (!fbMessage) throw err

  const MAP = {
    EMAIL_NOT_FOUND: 'No existe una cuenta con este correo',
    INVALID_PASSWORD: 'Correo o contraseña incorrectos',
    USER_DISABLED: 'Esta cuenta ha sido deshabilitada',
    EMAIL_EXISTS: 'Ya existe una cuenta con este correo',
    INVALID_EMAIL: 'El formato del correo no es válido',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'Demasiados intentos. Intenta más tarde',
    OPERATION_NOT_ALLOWED: 'Inicio de sesión con contraseña deshabilitado',
  }

  const friendly = MAP[fbMessage] ?? 'Correo o contraseña incorrectos'
  const error = new Error(friendly)
  error.response = err.response // preservar para quien quiera inspeccionar
  throw error
}

/**
 * Firebase REST API Bridge — sin SDK.
 *
 * Cuando el login a nuestro backend falla con 401, este módulo:
 *   1. Autentica directamente con Firebase Identity Toolkit (REST API).
 *   2. Extrae el idToken de la respuesta de Google.
 *   3. Usa ese idToken para hacer PUT /api/users/profile hacia nuestro backend.
 *
 * ⚠️  NO se instala el SDK de Firebase. Todo se hace con Axios puro.
 */

/* ─── API Key de Firebase (pública, segura para el cliente) ──────── */
// Reemplaza TU_API_KEY_DE_FIREBASE con tu Web API Key de Firebase Console:
//   Firebase Console → Proyecto → ⚙️ Configuración del proyecto → General → Web API Key
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY ?? ''

if (!FIREBASE_API_KEY) {
  console.warn(
    '[FirebaseBridge] VITE_FIREBASE_API_KEY no está definida. ' +
    'Agrégala a tu archivo .env — el puente de autenticación no funcionará sin ella.',
  )
}

/* ─── Constantes ──────────────────────────────────────────────────── */

const FIREBASE_AUTH_URL =
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

/* ─── Cliente Axios aislado (sin interceptores del api.js principal) ── */

const firebaseClient = axios.create({ timeout: 15000 })

const backendClient = axios.create({ baseURL: BACKEND_BASE_URL, timeout: 15000 })

/* ─── Función principal: login puente ──────────────────────────────── */

/**
 * Intenta autenticar con Firebase y sincronizar el perfil en nuestro backend.
 *
 * @param {string} email    - Correo del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<{ idToken: string, profile: object }>}
 *   Resuelve con el idToken de Firebase y la respuesta del PUT /users/profile.
 *   Rechaza si Firebase o el backend fallan.
 */
export async function firebaseBridgeLogin(email, password) {
  if (!FIREBASE_API_KEY) {
    throw new Error(
      'Firebase bridge no configurado: define VITE_FIREBASE_API_KEY en .env',
    )
  }

  // ── 1. POST a Firebase Identity Toolkit ──────────────────────────
  let firebaseResponse
  try {
    firebaseResponse = await firebaseClient.post(FIREBASE_AUTH_URL, {
      email,
      password,
      returnSecureToken: true,
    })
  } catch (err) {
    normalizeFirebaseError(err)
  }

  const { idToken } = firebaseResponse.data

  if (!idToken) {
    throw new Error('Firebase no devolvió idToken')
  }

  console.log('[FirebaseBridge] idToken obtenido de Firebase ✓')

  // ── 2. PUT /api/users/profile con el idToken de Firebase ─────────
  // Se envía la contraseña en el body para que el backend pueda crear/
  // sincronizar la cuenta con las credenciales correctas.
  const profileResponse = await backendClient.put(
    '/users/profile',
    { password },
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
  )

  console.log('[FirebaseBridge] PUT /users/profile sincronizado ✓')

  return {
    idToken,
    profile: profileResponse.data,
  }
}

/**
 * Verifica si el bridge está disponible (API key configurada).
 * @returns {boolean}
 */
export function isBridgeAvailable() {
  return Boolean(FIREBASE_API_KEY)
}
