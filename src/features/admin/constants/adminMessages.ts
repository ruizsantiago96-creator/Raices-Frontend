/**
 * Mensajes y textos estáticos para el módulo de Admin.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const ADMIN_TOAST = {
  // Instituciones
  INSTITUTION_APPROVED: '¡Institución aprobada con éxito!',
  INSTITUTION_APPROVE_FAILED: 'No pudimos aprobar la institución. Intenta de nuevo.',
  INSTITUTION_REJECTED: 'Institución rechazada',
  INSTITUTION_REJECT_FAILED: 'No pudimos rechazar la institución. Intenta de nuevo.',
  INSTITUTION_VERIFIED: '¡Verificación actualizada!',
  INSTITUTION_VERIFY_FAILED: 'No pudimos actualizar la verificación. Intenta de nuevo.',
  
  // Usuarios
  USER_TOGGLED: 'Estado del usuario actualizado',
  USER_TOGGLE_FAILED: 'No pudimos cambiar el estado. Intenta de nuevo.',
  USER_ROLE_CHANGED: '¡Rol actualizado!',
  USER_ROLE_CHANGE_FAILED: 'No pudimos cambiar el rol. Intenta de nuevo.',
  
  // Reseñas
  REVIEW_DELETED: 'Reseña eliminada',
  REVIEW_DELETE_FAILED: 'No pudimos eliminar la reseña. Intenta de nuevo.',
  
  // Configuración
  SETTINGS_UPDATED: '¡Configuración guardada!',
  SETTINGS_UPDATE_FAILED: 'No pudimos guardar la configuración. Intenta de nuevo.',
}

// ─── Textos de UI ─────────────────────────────────────────
export const ADMIN_UI = {
  // Topbar
  TOPBAR_TITLE: 'Panel de administración',
  LOGOUT_BUTTON: 'Cerrar sesión',
  GO_TO_APP: 'Ir a app',
  BRAND: 'Admin',
  
  // Sidebar - Navegación
  NAV_OVERVIEW: 'Inicio',
  NAV_INTELLIGENCE: 'Inteligencia',
  NAV_INSTITUTIONS: 'Instituciones',
  NAV_USERS: 'Usuarios',
  NAV_REVIEWS: 'Reseñas',
  NAV_ALERTS: 'Alertas',
  NAV_SETTINGS: 'Config',
  
  // Tab titles
  TAB_OVERVIEW: 'Resumen del ecosistema',
  TAB_INTELLIGENCE: 'Inteligencia de necesidades',
  TAB_INSTITUTIONS: 'Gestión de instituciones',
  TAB_USERS: 'Gestión de usuarios',
  TAB_REVIEWS: 'Moderación de reseñas',
  TAB_ALERTS: 'Alertas de riesgo',
  TAB_SETTINGS: 'Configuración de plataforma',
  
  // Overview - KPI Cards
  KPI_USERS: 'Usuarios',
  KPI_INSTITUTIONS: 'Instituciones',
  KPI_PENDING: 'Pendientes',
  KPI_REVIEWS: 'Reseñas',
  KPI_POSTS: 'Publicaciones',
  KPI_PROFILES: 'Perfiles completos',
  KPI_ACTIVE: 'activos',
  KPI_VERIFIED: 'verificadas',
  KPI_REQUIRES_ATTENTION: 'Requiere atención',
  KPI_UP_TO_DATE: 'Al día',
  KPI_AVG_RATING: '★ promedio',
  KPI_NO_RATINGS: 'Sin calificaciones',
  KPI_GROUPS: 'grupos',
  KPI_NEEDS_DATA: 'con datos de necesidades',
  
  // Overview - Charts
  CHART_METRICS_TITLE: 'Métricas del Ecosistema',
  CHART_METRICS_SUB: 'Distribución de registros por canal y tipo',
  CHART_LEGEND_USERS: 'Usuarios',
  CHART_LEGEND_INSTITUTIONS: 'Instituciones',
  CHART_LEGEND_REVIEWS: 'Reseñas',
  CHART_LEGEND_POSTS: 'Publicaciones',
  CHART_NO_DATA: 'No hay datos históricos disponibles en el servidor',
  CHART_ACTIVE_USERS_TITLE: 'Usuarios Activos',
  CHART_LIVE_VISITORS: 'Visitantes en vivo',
  CHART_AVG_DAILY: 'Prom. Diario',
  CHART_AVG_WEEKLY: 'Prom. Semanal',
  CHART_AVG_MONTHLY: 'Prom. Mensual',
  CHART_ECOSYSTEM_TITLE: 'Resumen del Ecosistema',
  CHART_REGISTERS: 'Registros',
  CHART_HEALTH_TITLE: 'Salud del Ecosistema',
  CHART_ACTIVE_ACCOUNTS: 'Tasa de Cuentas Activas',
  CHART_ACTIVE_ACCOUNTS_DESC: 'Porcentaje de usuarios registrados con cuentas habilitadas',
  CHART_VERIFIED_INSTITUTIONS: 'Instituciones Verificadas',
  CHART_VERIFIED_INSTITUTIONS_DESC: 'Porcentaje de instituciones que han completado su verificación',
  CHART_AI_DIAGNOSIS: 'Perfiles con Diagnóstico IA',
  CHART_AI_DIAGNOSIS_DESC: 'Usuarios que completaron el onboarding de necesidades',
  
  // Intelligence
  INTEL_BANNER_TITLE: 'Motor de inteligencia de necesidades',
  INTEL_HALLFINDS_TITLE: 'Hallazgos automáticos',
  INTEL_NO_FINDINGS: 'No hay hallazgos — se necesitan más perfiles de usuario para generar inteligencia.',
  INTEL_MATRIX_TITLE: 'Matriz de cobertura · demanda vs oferta',
  INTEL_NO_PROFILES: 'Sin perfiles de necesidades registrados aún.',
  INTEL_DEMAND: 'Demanda',
  INTEL_SUPPLY: 'Oferta',
  
  // Institutions
  INST_TITLE: 'Instituciones',
  INST_PENDING_TITLE: 'Pendientes de aprobación',
  INST_NO_PENDING: 'No hay instituciones pendientes',
  INST_APPROVE: 'Aprobar',
  INST_REJECT: 'Rechazar',
  INST_VERIFY: 'Verificar',
  INST_UNVERIFY: 'Desverificar',
  
  // Users
  USERS_TITLE: 'Usuarios',
  USERS_SEARCH_PLACEHOLDER: 'Buscar por nombre o email...',
  USERS_EMPTY: 'No se encontraron usuarios',
  USERS_ACTIVE: 'Activo',
  USERS_INACTIVE: 'Inactivo',
  
  // Reviews
  REVIEWS_TITLE: 'Reseñas',
  REVIEWS_EMPTY: 'No hay reseñas pendientes de moderación',
  REVIEWS_DELETE: 'Eliminar',
  
  // Alerts
  ALERTS_TITLE: 'Alertas de riesgo',
  ALERTS_EMPTY: 'No hay alertas activas',
  ALERTS_CRITICAL: 'Crítica',
  ALERTS_MEDIUM: 'Media',
  ALERTS_INFO: 'Info',
  
  // Settings
  SETTINGS_TITLE: 'Configuración',
  SETTINGS_SAVE: 'Guardar cambios',
  SETTINGS_SAVING: 'Guardando...',
  
  // Alerts button
  ALERT_BADGE: 'alerta',
  ALERT_BADGE_PLURAL: 'alertas',
  CRITICAL_SUFFIX: 'crítica',
  CRITICAL_SUFFIX_PLURAL: 'críticas',
}

// ─── Roles y estados ──────────────────────────────────────
export const ADMIN_ROLES = {
  admin: { bg: 'color-mix(in oklch, var(--primary) 90%, white)', label: 'Admin' },
  institution: { bg: 'color-mix(in oklch, var(--primary) 70%, white)', label: 'Institución' },
  tutor: { bg: 'color-mix(in oklch, var(--primary) 50%, white)', label: 'Tutor' },
  pcd: { bg: 'color-mix(in oklch, var(--primary) 35%, white)', label: 'Persona c/ disc.' },
  user: { bg: 'var(--fg3)', label: 'Usuario' },
}

export const ADMIN_STATUS = {
  critica: { color: 'var(--color-error)', label: 'Crítica' },
  media: { color: 'var(--color-empleo)', label: 'Media' },
  adecuada: { color: 'var(--color-artes)', label: 'Adecuada' },
  sin_demanda: { color: 'var(--fg3)', label: 'Sin demanda' },
}

export const ADMIN_SEVERITY = {
  alta: { color: 'var(--color-error)' },
  media: { color: 'var(--color-empleo)' },
  info: { color: 'var(--color-comunidad)' },
}
