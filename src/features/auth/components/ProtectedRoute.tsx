import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { EMPRESA_HOME, esEmpresa, puedeAbrirEmpresa, tieneRol } from '../lib/empresaRole'

export interface ProtectedRouteProps {
  children: ReactNode
  role?: string
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { token, user } = useAuthStore()
  const location = useLocation()

  if (!token) return <Navigate to="/" replace />

  // ── Empresa (persona moral) ────────────────────────────────────────
  // La empresa recorre la app como cualquier usuario: el sidebar estándar es el
  // que ve y todas sus secciones (Mis Rutas, Oportunidades, Conectemos,
  // Guardados…) abren de verdad. Solo se la expulsa de las superficies que no
  // tienen sentido para una persona moral, declaradas en
  // RUTAS_BLOQUEADAS_EMPRESA: administración, portal de institución, alta de
  // institución y las vistas de identidad que piden CURP (se acredita con CSF).
  //
  // El panel sigue siendo su aterrizaje: MainLayout lo deduce de la ruta, y el
  // item "Panel" del sidebar devuelve desde cualquier sección de la app.
  if (esEmpresa(user) && !puedeAbrirEmpresa(location.pathname)) {
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
