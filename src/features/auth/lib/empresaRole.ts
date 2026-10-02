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
 *
 * La empresa recorre la app como cualquier usuario (el sidebar estándar es el
 * que ve, con sus secciones completas); su panel de administración queda
 * siempre a un click, vía el item "Panel" del sidebar.
 */
import { useAuthStore } from '../store/authStore'

/** Ruta de aterrizaje obligatoria de toda cuenta de empresa. */
export const EMPRESA_HOME = '/empresa/dashboard'

/** Ruta de edición de la entidad empresa. */
export const EMPRESA_EDITAR = '/empresa/editar'

/**
 * Vista previa de perfil público de la empresa (solo lectura).
 *
 * El backend excluye a las empresas del directorio público de instituciones
 * (`institutions.service.ts`, `filas.filter(f => f.tipo !== 'empresa')`), así que
 * la empresa no puede "verse a sí misma" en `/instituciones`. Esta ruta dedicada
 * cubre ese hueco: muestra lo mismo que verían los postulantes, dibujada con el
 * sidebar de la app en vez del del panel.
 *
 * Vive bajo el prefijo `/empresa`, que no está en RUTAS_BLOQUEADAS_EMPRESA:
 * ProtectedRoute no expulsa la cuenta. MainLayout la excluye del modo `empresa`
 * para que se dibuje el sidebar de la app, igual que en `/feed`.
 */
export const EMPRESA_VISTA_PREVIA = '/empresa/vacantes'

/** Indica si el pathname actual es la vista previa pública de la empresa. */
export function esVistaPreviaEmpresa(pathname: string): boolean {
  return pathname === EMPRESA_VISTA_PREVIA || pathname.startsWith(`${EMPRESA_VISTA_PREVIA}/`)
}

/**
 * Únicas superficies que una cuenta de empresa NO puede abrir. Cualquier otra
 * ruta se la deja abrir, igual que a un PCD.
 *
 * La lista es de bloqueo, y no de permiso, a propósito: la superficie de la app
 * crece con cada sección nueva (Mis Rutas, Conectemos, Guardados, Escalas de
 * Vida…) y una lista de permiso obligaba a tocar este módulo cada vez que se
 * añadía una, que es justo la divergencia que este archivo existe para evitar.
 *
 * Se bloquea solo lo que no tiene sentido para una persona moral:
 *  - `/admin`: administration de la plataforma.
 *  - `/institution-portal`: es de otro rol; `tieneRol` ya lo rechaza, pero
 *    mantenerlo explícito evita depender de ese segundo guard.
 *  - `/institution/nueva`: alta de institución. La empresa ya tiene su registro
 *    en la colección `instituciones` (el backend lo crea con `tipo: 'empresa'`),
 *    así que este formulario produciría un duplicado.
 *  - `/verificacion-identidad`: CURP e identificación oficial. La persona moral
 *    se acredita con la CSF y la vista ya la redirige (`SoloPersonaFisica`).
 *  - `/completar-perfil`: onboarding de usuario físico.
 *
 * La superficie propia del panel (`/empresa/*`), la vista previa
 * (EMPRESA_VISTA_PREVIA) y toda la app (incluido `/feed`, destino del botón
 * "Ir a app") quedan permitidas sin declararlas aquí.
 */
export const RUTAS_BLOQUEADAS_EMPRESA: readonly string[] = [
  '/admin',
  '/institution-portal',
  '/institution/nueva',
  '/verificacion-identidad',
  '/completar-perfil',
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

/**
 * Indica si una cuenta de empresa puede abrir el pathname dado.
 *
 * Todo vale salvo RUTAS_BLOQUEADAS_EMPRESA: la empresa recorre la app igual que
 * un PCD (salto de "/feed", "Mis Rutas", "Oportunidades", "Conectemos",
 * "Guardados"…) y solo se le impide lo que no aplica a una persona moral.
 */
export function puedeAbrirEmpresa(pathname: string): boolean {
  return !RUTAS_BLOQUEADAS_EMPRESA.some(
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
