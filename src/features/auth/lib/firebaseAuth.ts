/**
 * Firebase Auth — Instancia compartida (singleton)
 *
 * Reutiliza la inicialización de Firebase App que ya existe en
 * features/notifications/lib/firebase.ts para obtener una instancia
 * de Auth usable por el módulo de autenticación (cambio de contraseña, etc.).
 */

import { getApps, getApp, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY                ?? '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN            ?? '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID             ?? '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET         ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID    ?? '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID                 ?? '',
}

let firebaseApp: FirebaseApp | null = null
let authInstance: Auth | null = null

/**
 * Devuelve la instancia de Firebase Auth (singleton).
 * Si Firebase no está configurado (API key ausente), devuelve null.
 */
export function getFirebaseAuth(): Auth | null {
  if (authInstance) return authInstance

  if (!firebaseConfig.apiKey) {
    console.warn(
      '[FirebaseAuth] VITE_FIREBASE_API_KEY no está definida. ' +
      'El cambio de contraseña no funcionará sin ella.',
    )
    return null
  }

  // Reutilizar la app existente o crear una nueva (mismo patrón que firebase.ts)
  firebaseApp = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp()

  authInstance = getAuth(firebaseApp)
  return authInstance
}
