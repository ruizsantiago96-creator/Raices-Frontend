/**
 * Tipos de dominio para el Módulo de Notificaciones y Alertas en Tiempo Real.
 */

export type NotificationType = 'info' | 'warning' | 'error' | 'success' | string

export interface NotificationItem {
  id: string | number
  title: string
  body: string
  is_read: boolean
  type: NotificationType
  created_at: string
  url?: string
  [key: string]: unknown
}

export interface RawBackendNotification {
  id?: string | number
  title?: string
  titulo?: string
  body?: string
  mensaje?: string
  contenido?: string
  is_read?: boolean
  leido?: boolean
  es_leido?: boolean
  leida?: boolean
  es_leida?: boolean
  type?: string
  tipo?: string
  created_at?: string
  creado_at?: string
  fecha?: string
  url?: string
  redirect_url?: string
  redirectUrl?: string
  ruta?: string
  path?: string
  enlace?: string
  link?: string
  redireccion?: string
  [key: string]: unknown
}

export interface MarkReadResponse {
  exito?: boolean
  mensaje?: string
  [key: string]: unknown
}

export interface PushNotificationPayload {
  title?: string
  body?: string
  data?: Record<string, unknown>
  [key: string]: unknown
}
