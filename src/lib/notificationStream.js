/**
 * Gestor a nivel de módulo de la conexión SSE de notificaciones.
 *
 * ARQUITECTURA: "Freno de mano absoluto"
 * ─────────────────────────────────────
 * Este módulo gestiona DOS aspectos:
 *
 *   1. La instancia activa de EventSource (activeEventSource).
 *   2. Un flag de suspensión global (streamSuspended) que bloquea
 *      la creación de CUALQUIER nuevo EventSource mientras el
 *      usuario está en proceso de logout.
 *
 * Por qué un flag de módulo y no un estado de React:
 *   - Se actualiza de forma síncrona, ANTES del ciclo de efectos de React.
 *   - Es visible para cualquier módulo, sin importar el árbol de componentes.
 *   - No se destruye al desmontar componentes.
 *   - Garantiza que ningún subcomponente pueda reabrir el canal de red
 *     durante la ventana de desmontaje entre logout y redirección.
 *
 * Flujo de logout:
 *   1. suspendStream()           → flag = true (BARRERA ACTIVA)
 *   2. closeNotificationStream() → cierra el ES activo
 *   3. clearAllAuth()            → limpia tokens
 *   4. set({ token: null })      → React agenda re-render
 *   5. useEffect cleanup        → no-op (ya cerrado)
 *   6. Nuevo useEffect           → isStreamSuspended() = true → NO crea nada
 *
 * Flujo de login:
 *   1. setAuth()                 → guarda token
 *   2. resumeStream()            → flag = false (BARRERA DESACTIVADA)
 *   3. useEffect re-ejecuta     → crea EventSource normalmente
 */

// ─── Instancia activa ────────────────────────────────────────────────
let activeEventSource = null

// ─── Freno de mano absoluto ──────────────────────────────────────────
// true = bloquea TODA creación de EventSource (activo durante logout)
// false = permite conexiones normales (activo durante sesión)
let streamSuspended = false

/**
 * Activa el freno de mano. Llamar ANTES de limpiar tokens.
 * Mientras sea true, ningún useNotificationStream creará un EventSource.
 */
export function suspendStream() {
  streamSuspended = true
}

/**
 * Desactiva el freno de mano. Llamar al hacer login.
 */
export function resumeStream() {
  streamSuspended = false
}

/**
 * Consulta el estado del freno. Usado por useNotificationStream
 * como primera línea de defensa antes de crear un EventSource.
 */
export function isStreamSuspended() {
  return streamSuspended
}

// ─── Gestión de la instancia ─────────────────────────────────────────

/**
 * Registra (o actualiza) la referencia al EventSource activo.
 * Llamado por useNotificationStream al abrir la conexión.
 */
export function setActiveEventSource(es) {
  activeEventSource = es
}

/**
 * Cierra la conexión SSE activa y limpia la referencia.
 * Llamado por authStore.logout() y por el cleanup del useEffect.
 * Llamar .close() sobre un EventSource ya cerrado es un no-op,
 * por lo que es seguro llamarlo múltiples veces.
 */
export function closeNotificationStream() {
  if (activeEventSource) {
    try {
      activeEventSource.close()
    } catch {
      /* ignore — el stream ya podría estar cerrado */
    }
    activeEventSource = null
  }
}
