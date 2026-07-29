/**
 * Firebase Cloud Messaging — Service Worker para segundo plano
 *
 * Este archivo maneja notificaciones cuando la app está cerrada o en segundo plano.
 * Debe estar en la raíz de `public/` para que sea accesible en /firebase-messaging-sw.js.
 *
 * ⚠️  IMPORTANTE: Los Service Workers NO pueden acceder a import.meta.env (Vite).
 *     Por eso la config de Firebase se inyecta aquí con valores reales (son públicos,
 *     seguros para el cliente). Si cambias tu proyecto Firebase, actualiza estos valores.
 *
 * ⚠️  Para inyectar variables de entorno automáticamente durante el build de Vite,
 *     instala vite-plugin-firebase-reload o usa el script de prebuild en package.json.
 */

// ─── Cargar Firebase compat (necesario para Service Workers) ─────────
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js')

// ─── Configuración de Firebase ──────────────────────────────────────
// Los valores de abajo son PÚBLICOS (seguros para el cliente).
// Se obtienen de Firebase Console → ⚙️ Configuración → General → Tus apps web.
//
// NOTA: En producción, puedes usar un script de prebuild para reemplazar
// estos placeholders con las variables reales de tu .env:
//   sed -i "s/__FIREBASE_API_KEY__/$VITE_FIREBASE_API_KEY/g" public/firebase-messaging-sw.js
//
const firebaseConfig = {
  apiKey:            '__FIREBASE_API_KEY__',
  authDomain:        '__FIREBASE_AUTH_DOMAIN__',
  projectId:         '__FIREBASE_PROJECT_ID__',
  storageBucket:     '__FIREBASE_STORAGE_BUCKET__',
  messagingSenderId: '__FIREBASE_MESSAGING_SENDER_ID__',
  appId:             '__FIREBASE_APP_ID__',
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

/**
 * Maneja notificaciones en segundo plano (cuando la app está cerrada/minimizada).
 * El backend envía el payload con título y cuerpo en `notification`,
 * o con datos custom en `data` para manejo programático.
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Mensaje recibido en segundo plano:', payload)

  const title = payload.notification?.title ?? payload.data?.title ?? 'Nueva notificación'
  const options = {
    body:  payload.notification?.body  ?? payload.data?.body  ?? '',
    icon:  payload.notification?.icon  ?? payload.data?.icon  ?? '/images/logo192.png',
    badge: '/images/badge-72x72.png',
    tag:   payload.data?.tag   ?? 'raices-notification',
    data:  {
      url: payload.data?.url ?? '/notifications',
      ...payload.data,
    },
  }

  self.registration.showNotification(title, options)
})

/**
 * Maneja el click en una notificación.
 * Navega a la URL especificada en los datos de la notificación.
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Click en notificación:', event.notification)
  event.notification.close()

  const url = event.notification?.data?.url ?? '/notifications'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si la app ya está abierta, enfocar la ventana existente
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      // Si no, abrir una nueva ventana
      return clients.openWindow(url)
    })
  )
})
