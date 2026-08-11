import { useRef, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useUiStore } from '@shared/stores/uiStore'

/**
 * FeatureGuard — Protege una ruta verificando que el usuario tenga la feature habilitada.
 *
 * Si la feature está deshabilitada (false), muestra un toast informativo y redirige a /dashboard.
 *
 * @param {string} feature - Nombre de la feature a verificar (ej: 'postulaciones', 'comunidad', 'chat')
 * @param {React.ReactNode} children - Componente a renderizar si la feature está habilitada
 */

const FEATURE_LABELS = {
  postulaciones: 'Oportunidades de empleo',
  comunidad: 'Comunidad',
  chat: 'Mensajería',
  favoritos: 'Guardados',
  reseñas: 'Reseñas',
  multimedia: 'Contenido multimedia',
}

export default function FeatureGuard({ feature, children }) {
  const { user } = useAuthStore()
  const addToast = useUiStore(s => s.addToast)
  const toastShownRef = useRef(false)

  // Verificar si la feature está habilitada (cálculo antes de hooks)
  const features = user?.features ?? {}

  let isEnabled = true
  if (Array.isArray(features)) {
    isEnabled = features.includes(feature)
  } else if (typeof features === 'object') {
    isEnabled = features[feature] !== false
  }

  // Mostrar toast la primera vez que se detecta la restricción
  useEffect(() => {
    if (!isEnabled && !toastShownRef.current) {
      toastShownRef.current = true
      const label = FEATURE_LABELS[feature] ?? feature
      addToast(
        `Tu tutor ha restringido el acceso a: ${label}. Si crees que es un error, contacta a tu tutor.`,
        'warning'
      )
    }
  }, [isEnabled, feature, addToast])

  // Si no hay usuario, ProtectedRoute ya se encarga
  if (!user) return children

  if (!isEnabled) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
