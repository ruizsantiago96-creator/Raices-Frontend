# 🔐 Flujo de Autenticación - Raíces

## Resumen

Este documento describe el sistema completo de autenticación implementado en la aplicación, incluyendo la gestión de tokens, refresh automático, y manejo de sesiones.

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE AUTENTICACIÓN                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────────────┐     │
│   │   Login/     │      │   API        │      │   Backend            │     │
│   │   Registro   │─────▶│   Client     │─────▶│   (Express/Nest)     │     │
│   └──────────────┘      └──────────────┘      └──────────────────────┘     │
│                              │                                              │
│                              │  1. POST /auth/login                         │
│                              │     { email, password }                      │
│                              │                                              │
│                              │◀─────────────────────────────────────────────│
│                              │     { token, refreshToken, user }            │
│                              │                                              │
│   ┌──────────────┐          │                                              │
│   │   Storage    │◀─────────┤  2. Guardar tokens                           │
│   │   Manager    │          │     - rememberMe=true  → localStorage        │
│   └──────────────┘          │     - rememberMe=false → sessionStorage      │
│                              │                                              │
│   ┌──────────────┐          │                                              │
│   │   Zustand    │◀─────────┤  3. Actualizar estado global                 │
│   │   Store      │          │     { user, token, refreshToken }            │
│   └──────────────┘          │                                              │
│                              │                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Refresh Token

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REFRESH TOKEN FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Cliente                           Servidor                                │
│      │                                  │                                   │
│      │  1. Petición API con token      │                                   │
│      │     Authorization: Bearer xxx   │                                   │
│      │─────────────────────────────────▶│                                   │
│      │                                  │                                   │
│      │  2. Token expirado/inválido     │                                   │
│      │◀─────────────────────────────────│                                   │
│      │     401 Unauthorized            │                                   │
│      │                                  │                                   │
│      │  3. Interceptor detecta 401     │                                   │
│      │     y guarda petición original  │                                   │
│      │     en la cola (failedQueue)    │                                   │
│      │                                  │                                   │
│      │  4. POST /auth/refresh          │                                   │
│      │     { refreshToken }            │                                   │
│      │─────────────────────────────────▶│                                   │
│      │                                  │                                   │
│      │  5. Servidor valida refresh     │                                   │
│      │     y genera nuevos tokens      │                                   │
│      │◀─────────────────────────────────│                                   │
│      │     { token, refreshToken }     │                                   │
│      │                                  │                                   │
│      │  6. Actualizar storage y store  │                                   │
│      │     con nuevos tokens           │                                   │
│      │                                  │                                   │
│      │  7. Reenviar petición original  │                                   │
│      │     con nuevo token             │                                   │
│      │─────────────────────────────────▶│                                   │
│      │                                  │                                   │
│      │  8. Respuesta exitosa           │                                   │
│      │◀─────────────────────────────────│                                   │
│      │     { data }                    │                                   │
│      │                                  │                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos Relacionados

```
src/
├── lib/
│   ├── api.js          # Configuración de Axios + interceptores
│   └── storage.js      # Gestión de almacenamiento de tokens
├── stores/
│   └── authStore.js    # Estado global de autenticación (Zustand)
└── hooks/
    └── useAuth.js      # Hook personalizado para operaciones de auth
```

---

## 🔧 Componentes Principales

### 1. API Client (`src/lib/api.js`)

**Responsabilidades:**
- Configurar instancia de Axios con baseURL
- Interceptor de REQUEST: inyectar token automáticamente
- Interceptor de RESPONSE: manejar 401 y refresh token
- Gestión de cola de peticiones pendientes durante refresh

**Instancias Axios:**
```javascript
// Instancia principal con interceptores
const api = axios.create({ baseURL: VITE_API_URL })

// Instancia aislada para refresh (sin interceptores, evita loops)
const refreshClient = axios.create({ baseURL: VITE_API_URL })
```

### 2. Storage Manager (`src/lib/storage.js`)

**Responsabilidades:**
- Almacenar/recuperar tokens según preferencia "Recordarme"
- Limpiar autenticación completa en logout
- Mantener preferencia de "Recordarme" en localStorage siempre

**Estrategia de Storage:**
| rememberMe | Token Storage | Refresh Token Storage |
|------------|---------------|----------------------|
| `true`     | localStorage  | localStorage         |
| `false`    | sessionStorage| sessionStorage       |

### 3. Auth Store (`src/stores/authStore.js`)

**Estado global:**
```javascript
{
  user: null,           // Objeto usuario completo
  token: null,          // JWT access token
  refreshToken: null,   // Refresh token para renovación
  isAuthenticated: false
}
```

---

## 🛡️ Seguridad Implementada

### 1. Inyección Automática del Token

```javascript
// src/lib/api.js - Interceptor de Request
api.interceptors.request.use(cfg => {
  const storageToken = getToken()  // localStorage primero, luego sessionStorage
  
  if (storageToken) {
    cfg.headers.Authorization = `Bearer ${storageToken}`
  }
  return cfg
})
```

### 2. Detección de Storage Limpiado

```javascript
// Si el store tiene token pero storage fue limpiado → logout forzado
const storeToken = useAuthStore.getState().token
const storageToken = getToken()

if (storeToken && !storageToken) {
  forceLogout('storage_cleared')
  return Promise.reject(new Error('Storage cleared, session invalidated'))
}
```

### 3. Prevención de Loops Infinitos

```javascript
// Evitar reintentos múltiples
if (originalRequest._retry) {
  return Promise.reject(err)
}

// Marcar petición como reintentada
originalRequest._retry = true
```

### 4. Excepciones para Rutas Públicas

```javascript
const PUBLIC_ROUTES = ['/', '/auth', '/explore']

function isPublicRoute() {
  return PUBLIC_ROUTES.includes(window.location.pathname)
}

// En interceptor de response:
if (isPublicRoute()) {
  return Promise.reject(err)  // No intentar refresh
}
```

---

## 📊 Cola de Peticiones (Failed Queue)

**Problema:** Múltiples peticiones fallan con 401 simultáneamente.

**Solución:** Cola de peticiones pendientes que se resuelven una vez completado el refresh.

```javascript
let isRefreshing = false
let failedQueue = []

// Cuando una petición falla con 401:
if (isRefreshing) {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject })
  }).then(token => {
    originalRequest.headers.Authorization = `Bearer ${token}`
    return api(originalRequest)
  })
}

// Después del refresh exitoso:
const pendingQueue = [...failedQueue]
failedQueue = []
pendingQueue.forEach(({ resolve }) => resolve(newToken))
```

**Flujo visual:**
```
Peticiones simultáneas:    [Req1, Req2, Req3]
                               │
                               ▼
                           isRefreshing = true
                               │
                           Req1 → 401 → Encolada
                           Req2 → 401 → Encolada
                           Req3 → 401 → Encolada
                               │
                           Refresh Token...
                               │
                           isRefreshing = false
                               │
                           Req1 → Reintentada con nuevo token
                           Req2 → Reintentada con nuevo token
                           Req3 → Reintentada con nuevo token
```

---

## 🚨 Manejo de Errores

### Error 401 - Token Expirado/Inválido

```
Flujo:
1. Interceptor detecta 401
2. Verificar si es ruta pública → Si: rechazar error
3. Verificar si ya se está refrescando → Si: encolar petición
4. Iniciar refresh token
5. Si refresh exitoso → reenviar petición con nuevo token
6. Si refresh falla → logout forzado
```

### Error de Refresh Token

```
Flujo:
1. POST /auth/refresh falla
2. Rechazar todas las peticiones encoladas
3. Si error es 401 → logout forzado (token inválido)
4. Si error es de red/500 → NO logout (puede ser temporal)
```

### Storage Limpiado Manualmente

```
Flujo:
1. Interceptor de request detecta discrepancia
2. storeToken existe pero storageToken no
3. Ejecutar forceLogout('storage_cleared')
4. Rechazar petición actual
```

---

## 🔄 Ciclo de Vida del Token

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TOKEN LIFECYCLE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Login                                                                     │
│      │                                                                      │
│      ▼                                                                      │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│   │  Token   │───▶│  Token   │───▶│  Token   │───▶│  Token   │            │
│   │  Nuevo   │    │  Válido  │    │  Por     │    │  Refresh │            │
│   │          │    │          │    │  Expirar │    │          │            │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘            │
│      │                              │              │                        │
│      │                              │              ▼                        │
│      │                              │         ┌──────────┐                 │
│      │                              │         │  Refresh │                 │
│      │                              │         │  Token   │                 │
│      │                              │         └──────────┘                 │
│      │                              │              │                        │
│      │                              │              ▼                        │
│      │                              │         ┌──────────┐                 │
│      │                              │         │  Nuevo   │◀───┘            │
│      │                              │         │  Token   │                 │
│      │                              │         └──────────┘                 │
│      │                              │              │                        │
│      │                              │              ▼                        │
│      │                              │         ┌──────────┐                 │
│      │                              │         │  Guardar │                 │
│      │                              │         │  en      │                 │
│      │                              │         │  Storage │                 │
│      │                              │         └──────────┘                 │
│      │                              │              │                        │
│      │                              │              ▼                        │
│      │                              │         ┌──────────┐                 │
│      │                              │         │  Reenviar│                 │
│      │                              │         │  Request │                 │
│      │                              │         └──────────┘                 │
│      │                              │                                      │
│      │                              │                                      │
│      ▼                              ▼                                      │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                            │
│   │  Logout  │    │  Session │    │  Clear   │                            │
│   │  (401    │    │  Expired │    │  Storage │                            │
│   │  refresh)│    │          │    │          │                            │
│   └──────────┘    └──────────┘    └──────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Endpoints Relacionados

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Iniciar sesión | No requerida |
| POST | `/auth/register` | Registrar usuario | No requerida |
| POST | `/auth/refresh` | Renovar token | Refresh Token |
| POST | `/auth/logout` | Cerrar sesión | Bearer Token |
| GET | `/auth/me` | Obtener usuario actual | Bearer Token |

---

## 🧪 Testing del Flujo

### Casos de Prueba Críticos

1. **Login exitoso** → Token se guarda correctamente
2. **Petición con token válido** → Header Authorization inyectado
3. **Petición con token expirado** → Refresh automático exitoso
4. **Refresh token inválido** → Logout forzado
5. **Múltiples peticiones simultáneas con 401** → Cola procesada correctamente
6. **Ruta pública sin token** → No se intenta refresh
7. **Storage limpiado manualmente** → Logout forzado detectado

---

## 🔍 Debugging

### Habilitar Logs

En desarrollo, el storage.js incluye logs detallados:

```javascript
// Logs habilitados por defecto en desarrollo
console.log('[Storage] saveRefreshToken called:', { refresh: !!refresh, rememberMe })
console.log('[Storage] Refresh token saved to:', rememberMe ? 'localStorage' : 'sessionStorage')
```

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Storage cleared, session invalidated` | Token en store pero no en storage | Verificar que storage no fue limpiado externamente |
| `No refresh token` | Refresh token no encontrado | Verificar login/registro exitoso |
| `Refresh token expired` | Refresh token inválido | Re-login necesario |
| `Network Error` | Sin conexión a servidor | Verificar connectivity |

---

## 📚 Referencias

- [JWT.io](https://jwt.io/) - Decodificador JWT
- [Axios Interceptors](https://axios-http.com/docs/interceptors) - Documentación oficial
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) - Estado global

---

## 📋 Changelog

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-07-15 | Documentación inicial del flujo de autenticación | Buffy (AI) |

---

**Última actualización:** 15 de Julio, 2026
