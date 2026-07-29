# Especificación de Endpoints — FCM Push Notifications

## Contexto

El frontend ya implementó Firebase Cloud Messaging (FCM). Cuando el usuario hace login, el navegador obtiene un **Token FCM** (único por dispositivo/navegador) y lo envía al backend para almacenarlo. Cuando el backend quiera enviar una notificación push al usuario, usa este token con el SDK de Firebase Admin.

---

## Endpoint 1: Registrar Token FCM

### `POST /api/notificaciones/fcm-token`

**Descripción**: Guarda el token FCM del dispositivo del usuario autenticado.

**Headers**:
```
Authorization: Bearer <token_jwt>
Content-Type: application/json
```

**Request Body**:
```json
{
  "token": "fcm_token_string_largo_del_dispositivo"
}
```

**Validaciones**:
- `token` debe ser un string no vacío
- El usuario debe estar autenticado (JWT válido)
- Si el token ya existe para ese usuario, no duplicarlo (upsert)
- Usar `INSERT ... ON CONFLICT (usuario_id, token) DO UPDATE` o lógica equivalente

**Response 200**:
```json
{
  "mensaje": "Token FCM registrado correctamente"
}
```

**Response 400** (token inválido):
```json
{
  "mensaje": "El token es requerido"
}
```

**Response 401** (no autenticado):
```json
{
  "mensaje": "No autorizado"
}
```

---

## Endpoint 2: Eliminar Token FCM

### `DELETE /api/notificaciones/fcm-token`

**Descripción**: Elimina el token FCM del dispositivo al cerrar sesión.

**Headers**:
```
Authorization: Bearer <token_jwt>
Content-Type: application/json
```

**Request Body**:
```json
{
  "token": "fcm_token_string_largo_del_dispositivo"
}
```

**Response 200** (siempre, incluso si el token no existía):
```json
{
  "mensaje": "Token FCM eliminado correctamente"
}
```

> **Nota**: Devolver 200 siempre (no 404) para evitar confusión en el frontend.

**Response 401** (no autenticado):
```json
{
  "mensaje": "No autorizado"
}
```

---

## Modelo de Base de Datos (sugerido)

### Tabla `fcm_tokens`

```sql
CREATE TABLE fcm_tokens (
  id            SERIAL PRIMARY KEY,
  usuario_id    INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token         TEXT NOT NULL,
  device_info   JSONB DEFAULT '{}',    -- info opcional del dispositivo
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_id, token)            -- evitar duplicados
);

CREATE INDEX idx_fcm_tokens_usuario ON fcm_tokens(usuario_id);
CREATE INDEX idx_fcm_tokens_token   ON fcm_tokens(token);
```

### Esquema equivalente (si usas TypeORM/Sequelize):
```typescript
@Entity('fcm_tokens')
export class FcmToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column('text')
  token: string;

  @Column('jsonb', { default: '{}' })
  deviceInfo: object;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

---

## Lógica de Negocio

### Al hacer login (POST /auth/login):
1. El frontend obtiene el token FCM del navegador
2. El frontend llama `POST /notificaciones/fcm-token` con el token
3. El backend almacena el token asociado al usuario

### Al enviar una notificación:
1. El backend busca todos los tokens FCM del usuario destinatario
2. Usa Firebase Admin SDK para enviar el push:

```javascript
const admin = require('firebase-admin');

// Enviar a múltiples tokens del mismo usuario
const response = await admin.messaging().sendEachForMulticast({
  tokens: tokensDelUsuario,  // array de strings
  notification: {
    title: 'Nueva notificación',
    body: 'Tienes una nueva reseña en tu institución',
  },
  data: {
    url: '/notifications',  // URL a abrir al hacer click
    tag: 'nueva-resena',
  },
});

// Limpiar tokens inválidos (404 = token expirado/eliminado)
response.responses.forEach((resp, idx) => {
  if (resp.error?.code === 'messaging/registration-token-not-registered') {
    // Eliminar este token de la base de datos
    eliminarToken(tokensDelUsuario[idx]);
  }
});
```

### Al cerrar sesión:
1. El frontend llama `DELETE /notificaciones/fcm-token` con el token
2. El backend elimina el token de la base de datos

---

## Instalación de Firebase Admin SDK

```bash
# Node.js
npm install firebase-admin

# Python
pip install firebase-admin

# Java
# Agregar dependencia de Maven o Gradle
```

### Inicialización (Node.js):

> **En desarrollo**: usar archivo `service-account-key.json` descargado de Firebase Console.
> **En producción**: usar variables de entorno (más seguro, no exponer el archivo).
```javascript
const admin = require('firebase-admin');

// Opción 1: Usar archivo de service account
const serviceAccount = require('./service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Opción 2: Usar variables de entorno (recomendado para producción)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});
```

### Variables de entorno necesarias en el backend:
```bash
FIREBASE_PROJECT_ID=raices-499122
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@raices-499122.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv..."
```

> **Nota**: El `service-account-key.json` o las credenciales se obtienen desde
> Firebase Console → ⚙️ Configuración → Cuentas de servicio → Generar nueva clave privada

---

## Cómo probar

### 1. Registrar token (desde el frontend ya funciona):
```bash
curl -X POST http://localhost:3000/api/notificaciones/fcm-token \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "fcm_token_de_prueba"}'
```

### 2. Enviar notificación de prueba (desde Firebase Console):
1. Ve a Firebase Console → Cloud Messaging → Envíos de prueba
2. Pega el token FCM que obtuviste del frontend
3. Escribe título y cuerpo del mensaje
4. Envía — debería llegar la notificación al navegador

---

## Referencia del Frontend

El frontend ya está implementado y usa estos endpoints automáticamente:

| Archivo | Función |
|---------|---------|
| `src/features/notifications/hooks/useFCM.js` | `sendTokenToBackend()` → llama `POST /notificaciones/fcm-token` |
| `src/features/notifications/components/FCMProvider.jsx` | `removeTokenFromBackend()` → llama `DELETE /notificaciones/fcm-token` |
| `public/firebase-messaging-sw.js` | Service Worker que muestra notificaciones en 2do plano |
| `src/features/notifications/lib/firebase.js` | Inicialización del SDK Firebase v12 |
