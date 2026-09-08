import { useRef, useEffect, ReactNode, ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useUiStore } from '@shared/stores/uiStore'

const FEATURE_LABELS: Record<string, string> = {
  postulaciones: 'Oportunidades de empleo',
  comunidad: 'Comunidad',
  chat: 'Mensajería',
  favoritos: 'Guardados',
  reseñas: 'Reseñas',
  multimedia: 'Contenido multimedia',
}

export interface FeatureGuardProps {
  feature: string
  children: ReactNode
}

export default function FeatureGuard({ feature, children }: FeatureGuardProps): ReactElement {
  const { user } = useAuthStore()
  const addToast = useUiStore(s => s.addToast)
  const toastShownRef = useRef<boolean>(false)

  // Verificar si la feature está habilitada (cálculo antes de hooks)
  const features = user?.features ?? {}

  let isEnabled = true
  if (Array.isArray(features)) {
    isEnabled = features.includes(feature)
  } else if (typeof features === 'object' && features !== null) {
    isEnabled = (features as Record<string, boolean>)[feature] !== false
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
  if (!user) return <>{children}</>

  if (!isEnabled) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
