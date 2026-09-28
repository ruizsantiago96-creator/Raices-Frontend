/**
 * EMPRESA ROLE GUARD (personas morales)
 * ======================================
 * Una cuenta de empresa es una *persona moral*: no tiene CURP, ni identificación
 * oficial, ni fecha de nacimiento. Su identidad se acredita con la Constancia de
 * Situación Fiscal (CSF).
 *
 * Este módulo es la única fuente de verdad de "¿es una empresa?" y de qué rutas
 * puede abrir, para que el ruteo, el layout y las vistas de verificación no
 * divergan entre sí.
 */
import { useAuthStore } from '../store/authStore'

/** Ruta de aterrizaje obligatoria de toda cuenta de empresa. */
export const EMPRESA_HOME = '/empresa/dashboard'

/** Ruta de edición de la entidad empresa. */
export const EMPRESA_EDITAR = '/empresa/editar'

/**
 * Rutas que una cuenta de empresa puede renderizar dentro del MainLayout.
 * Cualquier otra ruta la expulsa de vuelta a EMPRESA_HOME.
 *
 * Se mantiene deliberadamente corta: la superficie de usuario estándar
 * (/feed, /jobs, /rutas, /social, /explore...) no aplica a personas morales.
 */
export const RUTAS_EMPRESA: readonly string[] = [
  '/empresa',
  '/profile',
  '/notifications',
  '/inicio',
]

/**
 * Forma mínima que necesitamos para decidir si un usuario es empresa.
 * Acepta tanto el campo normalizado (`role`, en inglés) como el crudo del
 * backend (`rol`, en español) más el discriminante `tipo`.
 */
export interface EmpresaLikeUser {
  role?: unknown
  rol?: unknown
  tipo?: unknown
}

const norm = (value: unknown): string => (typeof value === 'string' ? value.trim().toLowerCase() : '')

const ROLES_PERSONA_MORAL = new Set(['empresa'])
const ROLES_INSTITUCION = new Set(['institution', 'institucion', 'institución'])

/**
 * Determina si el usuario es una empresa (persona moral).
 *
 * Cubre los tres casos que devuelve el sistema:
 *  1. `role === 'empresa'`
 *  2. `rol === 'empresa'`  (payload crudo del backend, sin normalizar)
 *  3. `role === 'institution' && tipo === 'empresa'` (institución con tipo empresa)
 */
export function esEmpresa(user: EmpresaLikeUser | null | undefined): boolean {
  if (!user) return false

  const role = norm(user.role)
  const rol = norm(user.rol)
  const tipo = norm(user.tipo)

  if (ROLES_PERSONA_MORAL.has(role) || ROLES_PERSONA_MORAL.has(rol)) return true

  // Una institución clasificada como empresa sigue siendo persona moral.
  if (ROLES_INSTITUCION.has(role) && tipo === 'empresa') return true
  if (ROLES_INSTITUCION.has(rol) && tipo === 'empresa') return true

  return false
}

/** Indica si el pathname actual pertenece a la superficie permitida de empresa. */
export function esRutaEmpresa(pathname: string): boolean {
  return RUTAS_EMPRESA.some(
    ruta => pathname === ruta || pathname.startsWith(`${ruta}/`),
  )
}

/**
 * Comprueba si el usuario satisface el rol exigido por un guard de ruta.
 *
 * No basta con comparar `user.role === role`: una persona moral puede llegar
 * con `role: 'institution'` + `tipo: 'empresa'`, o con el campo crudo `rol`.
 * Comparar en crudo devolvería `false` sobre `/empresa/dashboard` y el guard
 * redirigiría a EMPRESA_HOME, que es justo la ruta actual: bucle infinito.
 *
 * Reglas:
 *  - El rol `'empresa'` se satisface con `esEmpresa()` (rol normalizado, crudo o
 *    institución tipada como empresa).
 *  - Una empresa NO satisface el guard de otro rol (p. ej. `institution`,
 *    `pcd`, `tutor`, `admin`), para que no entre por la puerta de atrás.
 *  - El resto de roles se compara tolerando el valor crudo del backend.
 */
export function tieneRol(user: EmpresaLikeUser | null | undefined, rolExigido: string): boolean {
  const exigido = norm(rolExigido)
  if (!exigido) return true

  if (exigido === 'empresa') return esEmpresa(user)

  // Una persona moral jamás debe pasar el guard de otro rol.
  if (esEmpresa(user)) return false

  const role = norm(user?.role)
  const rol = norm(user?.rol)
  if (role === exigido || rol === exigido) return true

  // `institucion` (crudo) y `institution` (normalizado) son el mismo rol.
  if (exigido === 'institution' || exigido === 'institucion') {
    return ROLES_INSTITUCION.has(role) || ROLES_INSTITUCION.has(rol)
  }

  return false
}

/** Variante de `esEmpresa` ligada al store de sesión, para componentes. */
export function useEsEmpresa(): boolean {
  return esEmpresa(useAuthStore(s => s.user))
}
