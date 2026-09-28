import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { EMPRESA_HOME, esEmpresa, esRutaEmpresa, tieneRol } from '../lib/empresaRole'

export interface ProtectedRouteProps {
  children: ReactNode
  role?: string
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { token, user } = useAuthStore()
  const location = useLocation()

  if (!token) return <Navigate to="/" replace />

  // ── Empresa (persona moral) ────────────────────────────────────────
  // Las cuentas de empresa NUNCA renderizan la superficie de usuario estándar
  // (feed, oportunidades, rutas…), así que se las expulsa a su portal. Sin esto
  // aterrizarían en el panel de CURP, que no les corresponde.
  if (esEmpresa(user) && !esRutaEmpresa(location.pathname)) {
    return <Navigate to={EMPRESA_HOME} replace />
  }

  // Redirección por rol: a una empresa la mandamos a su portal (evita un bucle
  // con el redirect anterior); al resto, al dashboard de siempre.
  //
  // `tieneRol` resuelve el caso persona moral, que puede llegar como
  // `institution` + `tipo: 'empresa'` o con el `rol` crudo: comparar el
  // `user.role` en crudo rechazaba a la empresa en su propia home y el
  // `<Navigate>` apuntaba a la ruta actual (bucle infinito).
  if (role && !tieneRol(user, role)) {
    const destino = esEmpresa(user) ? EMPRESA_HOME : '/dashboard'
    // Cinturón de seguridad: nunca redirigir a la ruta en la que ya estamos.
    return <Navigate to={destino === location.pathname ? EMPRESA_HOME : destino} replace />
  }

  return <>{children}</>
}
