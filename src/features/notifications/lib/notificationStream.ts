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

// ─── Instancia activa y timers ────────────────────────────────────────
let activeEventSource: EventSource | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

// ─── Freno de mano absoluto ──────────────────────────────────────────
// true = bloquea TODA creación de EventSource (activo durante logout)
// false = permite conexiones normales (activo durante sesión)
let streamSuspended = false

/**
 * Registra un timer de reconexión activo para ser abortado al cerrar sesión.
 */
export function registerReconnectTimer(timer: ReturnType<typeof setTimeout> | null) {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  reconnectTimer = timer
}

/**
 * Aborta cualquier timer de reconexión pendiente.
 */
export function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

/**
 * Activa el freno de mano y cancela timers pendientes. Llamar ANTES de limpiar tokens.
 */
export function suspendStream() {
  streamSuspended = true
  clearReconnectTimer()
}

/**
 * Desactiva el freno de mano. Llamar al hacer login.
 */
export function resumeStream() {
  streamSuspended = false
}

/**
 * Consulta el estado del freno.
 */
export function isStreamSuspended() {
  return streamSuspended
}

// ─── Gestión de la instancia ─────────────────────────────────────────

/**
 * Registra (o actualiza) la referencia al EventSource activo.
 */
export function setActiveEventSource(es: EventSource | null) {
  activeEventSource = es
}

/**
 * Cierra la conexión SSE activa, borra timers de reconexión y limpia la referencia.
 */
export function closeNotificationStream() {
  clearReconnectTimer()
  if (activeEventSource) {
    try {
      activeEventSource.close()
    } catch {
      /* ignore — el stream ya podría estar cerrado */
    }
    activeEventSource = null
  }
}
