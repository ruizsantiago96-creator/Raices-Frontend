/**
 * Firebase Cloud Messaging — Inicialización del SDK modular (v12+)
 *
 * Este módulo configura Firebase solo para messaging. Si las variables
 * de entorno no están definidas, Firebase no se inicializa y todas las
 * funciones exportadas degradan gracefully (return null / no-ops).
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import type { Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY                ?? '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN            ?? '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID             ?? '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET         ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID    ?? '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID                 ?? '',
}

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY ?? ''

// Inicialización singleton idempotente
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

let messagingPromise: Promise<Messaging | null> | null = null

/**
 * Carga diferida y segura de Firebase Messaging.
 * Previene colisiones estático/dinámico y asegura ejecución solo en cliente con soporte de Service Worker.
 */
export async function getLazyMessaging(): Promise<Messaging | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  if (!messagingPromise) {
    messagingPromise = (async () => {
      try {
        const { getMessaging, isSupported } = await import('firebase/messaging')
        const supported = await isSupported()
        if (!supported) return null
        return getMessaging(app)
      } catch (err) {
        console.warn('Firebase Messaging no soportado en este entorno:', err)
        return null
      }
    })()
  }

  return messagingPromise
}

// Alias para compatibilidad con importadores existentes
export const getFirebaseMessaging = getLazyMessaging

/**
 * Verifica si FCM está configurado correctamente (variables de entorno presentes).
 */
export function isFCMConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId)
}
