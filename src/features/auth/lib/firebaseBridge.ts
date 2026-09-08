import axios, { AxiosResponse } from 'axios'

/**
 * Normaliza errores de la REST API de Firebase a mensajes legibles.
 * Firebase devuelve: { error: { message: "INVALID_PASSWORD", ... } }
 */
function normalizeFirebaseError(err: unknown): never {
  const errObj = err as { response?: { data?: { error?: { message?: string } } } }
  const fbMessage = errObj?.response?.data?.error?.message
  if (!fbMessage) throw err

  const MAP: Record<string, string> = {
    EMAIL_NOT_FOUND: 'No existe una cuenta con este correo',
    INVALID_PASSWORD: 'Correo o contraseña incorrectos',
    USER_DISABLED: 'Esta cuenta ha sido deshabilitada',
    EMAIL_EXISTS: 'Ya existe una cuenta con este correo',
    INVALID_EMAIL: 'El formato del correo no es válido',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'Demasiados intentos. Intenta más tarde',
    OPERATION_NOT_ALLOWED: 'Inicio de sesión con contraseña deshabilitado',
  }

  const friendly = MAP[fbMessage] ?? 'Correo o contraseña incorrectos'
  const error = new Error(friendly) as Error & { response?: unknown }
  error.response = errObj.response
  throw error
}

export interface FirebaseBridgeResult {
  idToken: string
  profile: unknown
}

const FIREBASE_API_KEY = (import.meta.env.VITE_FIREBASE_API_KEY as string) ?? ''

if (!FIREBASE_API_KEY) {
  console.warn(
    '[FirebaseBridge] VITE_FIREBASE_API_KEY no está definida. ' +
    'Agrégala a tu archivo .env — el puente de autenticación no funcionará sin ella.',
  )
}

const FIREBASE_AUTH_URL =
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`

const BACKEND_BASE_URL = (import.meta.env.VITE_API_URL as string) ?? '/api'

const firebaseClient = axios.create({ timeout: 15000 })
const backendClient = axios.create({ baseURL: BACKEND_BASE_URL, timeout: 15000 })

/**
 * Intenta autenticar con Firebase y sincronizar el perfil en nuestro backend.
 */
export async function firebaseBridgeLogin(email: string, password: string): Promise<FirebaseBridgeResult> {
  if (!FIREBASE_API_KEY) {
    throw new Error(
      'Firebase bridge no configurado: define VITE_FIREBASE_API_KEY en .env',
    )
  }

  let firebaseResponse: AxiosResponse<{ idToken?: string }>
  try {
    firebaseResponse = await firebaseClient.post(FIREBASE_AUTH_URL, {
      email,
      password,
      returnSecureToken: true,
    })
  } catch (err: unknown) {
    normalizeFirebaseError(err)
  }

  const { idToken } = firebaseResponse!.data

  if (!idToken) {
    throw new Error('Firebase no devolvió idToken')
  }

  console.log('[FirebaseBridge] idToken obtenido de Firebase ✓')

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
 */
export function isBridgeAvailable(): boolean {
  return Boolean(FIREBASE_API_KEY)
}
