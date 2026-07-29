/**
 * Firebase Cloud Messaging — Inicialización del SDK modular (v12+)
 *
 * Este módulo configura Firebase solo para messaging. Si las variables
 * de entorno no están definidas, Firebase no se inicializa y todas las
 * funciones exportadas degradan gracefully (return null / no-ops).
 */

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging'

/* ─── Variables de entorno ─────────────────────────────────────────── */

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY                ?? '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN            ?? '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID             ?? '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET         ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID    ?? '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID                 ?? '',
}

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY ?? ''

/* ─── Inicialización (singleton) ───────────────────────────────────── */

let firebaseApp = null
let messagingInstance = null

/**
 * Inicializa Firebase (una sola vez) y devuelve la instancia de Messaging.
 * @returns {Promise<import('firebase/messaging').Messaging | null>}
 */
export async function getFirebaseMessaging() {
  // Si el navegador no soporta FCM (ej: Safari sin permisos), no hacer nada
  if (!(await isSupported())) {
    console.warn('[FCM] El navegador no soporta notificaciones push.')
    return null
  }

  // Solo inicializar una vez (singleton)
  if (!firebaseApp) {
    firebaseApp = getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApp()
  }

  if (!messagingInstance) {
    messagingInstance = getMessaging(firebaseApp)
  }

  return messagingInstance
}

/**
 * Verifica si FCM está configurado correctamente (variables de entorno presentes).
 * @returns {boolean}
 */
export function isFCMConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId)
}
