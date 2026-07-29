# Migración de Notificaciones: SSE → Firebase Cloud Messaging (FCM)

## Resumen

Se reemplazó el sistema de notificaciones en tiempo real basado en **Server-Sent Events (SSE)** por **Firebase Cloud Messaging (FCM)**, el servicio de push notifications de Google. Esto permite notificaciones reales que llegan aunque la app esté cerrada o en segundo plano.

---

## ¿Qué existía antes? (SSE)

El sistema anterior usaba `EventSource` (SSE) para mantener un canal abierto entre el navegador y el servidor:

```
┌──────────┐    GET /notificaciones/flujo    ┌──────────┐
│  Browser  │ ──────────────────────────────→ │ Backend  │
│           │ ←─────── stream de datos ────── │          │
└──────────┘                                  └──────────┘
```

### Archivos del sistema anterior
- `src/features/notifications/lib/notificationStream.js` — Gestor del EventSource con "freno de mano" para logout seguro
- `src/features/notifications/hooks/useNotifications.js` — Hook `useNotificationStream()` que creaba el EventSource

### Problemas de SSE
| Problema | Descripción |
|----------|-------------|
| **No funciona en segundo plano** | Si el usuario minimiza la app o cambia de pestaña, el EventSource puede desconectarse |
| **Depende de la pestaña abierta** | Mientras la pestaña esté cerrada, no hay notificaciones |
| **Backend debe mantener conexión** | Cada usuario conectado ocupa un hilo/respuesta HTTP abierta en el servidor |
| **Deshabilitado actualmente** | El SSE estaba comentado en el código porque el endpoint `/notificaciones/flujo` devolvía 401 |
| **Polling como fallback** | Se usaba `useQuery` con polling para obtener notificaciones, lo cual genera requests innecesarios |

### Estado actual del código SSE
```javascript
// En useNotifications.js — SSE estaba COMENTADO:
// ⚠️ SSE temporalmente deshabilitado.
//    El endpoint /notificaciones/flujo devuelve 401 en el backend actual.
//    El polling de useNotifications() ya funciona correctamente.
```

---

## ¿Qué se implementa ahora? (FCM)

FCM usa el servicio de push de Google/Android/iOS para entregar notificaciones directamente al dispositivo, sin importar si la app está abierta:

```
┌──────────┐    Token FCM    ┌──────────────┐    Push    ┌──────────┐
│  Browser  │ ←───────────── │   Firebase   │ ←───────── │ Backend  │
│  (SW)     │  notificación  │   Cloud      │  HTTP POST │          │
└──────────┘                 │  Messaging   │            └──────────┘
     ↑                       └──────────────┘
     │                              ↑
     └──── Service Worker recibe ───┘
           y muestra notificación nativa
```

### Archivos nuevos/actualizados

| Archivo | Función | Nuevo/Actualizado |
|---------|---------|-------------------|
| `src/features/notifications/lib/firebase.js` | Inicialización del SDK Firebase v12 (singleton) | **Nuevo** |
| `public/firebase-messaging-sw.js` | Service Worker para notificaciones en segundo plano | **Nuevo** |
| `src/features/notifications/hooks/useFCM.js` | Hook: permiso, token, mensajes en primer plano, toasts | **Nuevo** |
| `src/features/notifications/components/FCMProvider.jsx` | Provider que activa FCM y escucha eventos | **Nuevo** |
| `src/features/notifications/index.js` | Exports públicos del módulo | **Actualizado** |
| `src/App.jsx` | Integración de `<FCMProvider>` | **Actualizado** |
| `.env.development` | Variables de Firebase para FCM | **Actualizado** |
| `.env.example` | Template de variables de entorno | **Actualizado** |

---

## Cómo funciona el nuevo sistema

### 1. Inicialización (`firebase.js`)

```
Al cargar la app:
  → Lee variables VITE_FIREBASE_* de .env
  → Inicializa Firebase App (singleton)
  → Prepara la instancia de Firebase Messaging
  → Si no hay variables configuradas → degrada gracefully (no-op)
```

**Degradación graceful**: Si no se configuran las variables de Firebase, toda la funcionalidad FCM se desactiva silenciosamente sin errores.

### 2. Registro del Token (`useFCM.js`)

Cuando un usuario tiene sesión activa:

```
1. useFCM detecta que hay authToken → ejecuta setup
2. Solicita permiso de notificaciones al navegador
3. Registra el Service Worker (/firebase-messaging-sw.js)
4. Obtiene el Token FCM del dispositivo (único por navegador+usuario)
5. Envía el token al backend: POST /notificaciones/fcm-token
6. El backend almacena el token y lo usa para enviar pushes
```

**Cada token es único** por combinación de dispositivo + navegador + proyecto Firebase.

### 3. Notificaciones en Primer Plano (`useFCM.js`)

Cuando la app está abierta y el usuario recibe una notificación:

```
FCM → onMessage() → callback:
  1. Muestra un Toast global con el título y cuerpo
  2. Dispara evento custom 'fcm-notification'
  3. FCMProvider escucha el evento y refresca la lista de notificaciones
```

### 4. Notificaciones en Segundo Plano (`firebase-messaging-sw.js`)

Cuando la app está cerrada o en segundo plano:

```
FCM → Service Worker → onBackgroundMessage():
  1. Muestra una notificación nativa del sistema operativo
  2. Al hacer click → navega a la URL especificada en los datos
  3. Si la app ya está abierta → enfoca la ventana existente
  4. Si no → abre una nueva ventana/pestaña
```

### 5. Limpieza al Cerrar Sesión (`FCMProvider.jsx`)

```
Al desmontar FCMProvider (logout):
  → removeTokenFromBackend()
  → DELETE /notificaciones/fcm-token { token: fcmToken }
  → El backend elimina el token y ya no enviará pushes a ese dispositivo
```

---

## Comparación lado a lado

| Aspecto | SSE (antes) | FCM (ahora) |
|---------|-------------|-------------|
| **Conexión** | HTTP persistente (EventSource) | Push nativo del navegador |
| **Segundo plano** | ❌ Se desconecta | ✅ Funciona siempre |
| **App cerrada** | ❌ No recibe nada | ✅ Notificación nativa del SO |
| **Carga en servidor** | 1 hilo por usuario conectado | Sin conexiones persistentes |
| **Dependencia** | Backend propio | Firebase (Google) |
| **Permisos** | Ninguno | El usuario debe aceptar |
| **Configuración** | Solo backend | Firebase Console + .env |
| **Service Worker** | No necesario | Obligatorio |
| **Token por dispositivo** | No aplica | Sí (1 por navegador/dispositivo) |

---

## Variables de entorno requeridas

```bash
# En .env.development (obtenidas desde Firebase Console)
VITE_FIREBASE_API_KEY=...          # Configuración → General → Web API Key
VITE_FIREBASE_AUTH_DOMAIN=...      # Configuración → General → dominant
VITE_FIREBASE_PROJECT_ID=...       # Configuración → General → ID del proyecto
VITE_FIREBASE_STORAGE_BUCKET=...   # Configuración → General → Storage bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=... # Cloud Messaging → Configuración → ID del remitente
VITE_FIREBASE_APP_ID=...           # Configuración → Tus apps → ID de la app web
VITE_FIREBASE_VAPID_KEY=...        # Cloud Messaging → Certificados web push → Generar llave pareada
```

---

## Endpoints requeridos en el Backend

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/notificaciones/fcm-token` | Registra el token FCM del dispositivo para el usuario autenticado |
| `DELETE` | `/notificaciones/fcm-token` | Elimina el token al cerrar sesión |

El backend debe:
1. Almacenar tokens FCM asociados a cada usuario
2. Usar el SDK de Firebase Admin para enviar pushes a los tokens
3. Enviar payloads con `notification` (título/cuerpo) y/o `data` (datos custom)

---

## Estructura del proyecto

```
src/features/notifications/
├── components/
│   ├── NotificationBell.jsx     # Campana de notificaciones (existente)
│   └── FCMProvider.jsx          # Provider que activa FCM (nuevo)
├── hooks/
│   ├── useNotifications.js      # Fetch polling de notificaciones (existente)
│   └── useFCM.js                # Hook FCM: permiso, token, escucha (nuevo)
├── lib/
│   ├── notificationStream.js    # Gestor SSE (mantenido por compatibilidad)
│   └── firebase.js              # Inicialización Firebase SDK v12 (nuevo)
├── pages/
│   └── NotificationsPage.jsx    # Página de notificaciones (existente)
└── index.js                     # Exports públicos (actualizado)

public/
└── firebase-messaging-sw.js     # Service Worker para 2do plano (nuevo)
```

---

## Notas de implementación

### Service Worker y variables de entorno
Los Service Workers **no pueden acceder** a `import.meta.env` de Vite. Por eso `firebase-messaging-sw.js` usa placeholders `__FIREBASE_*__` que deben reemplazarse manualmente o con un script de prebuild:

```bash
# Script de prebuild (agregar a package.json scripts)
"prebuild": "sed -i \"s/__FIREBASE_API_KEY__/$VITE_FIREBASE_API_KEY/g\" public/firebase-messaging-sw.js"
```

### SDK de Firebase: Modular vs Compat
- **App principal** (`firebase.js`): Usa el SDK modular v12 (`import { getMessaging } from 'firebase/messaging'`)
- **Service Worker** (`firebase-messaging-sw.js`): Usa el SDK compat v11.6.0 via `importScripts()` porque los SW no soportan módulos ES

### Degradación graceful
Si el navegador no soporta notificaciones push (ej: Safari en iOS < 16.4) o las variables de Firebase no están configuradas, el sistema se desactiva sin errores visibles. El polling de `useNotifications()` sigue funcionando como fallback.
