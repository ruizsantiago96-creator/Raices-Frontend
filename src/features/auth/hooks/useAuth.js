import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useAuthStore } from '../store/authStore'
import { setRememberMe, saveUser, getRememberMe } from '@shared/lib/storage'
import { firebaseBridgeLogin, isBridgeAvailable } from '../lib/firebaseBridge'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  return useMutation({
    mutationFn: async ({ _rememberMe, email, password }) => {
      const rememberMe = _rememberMe ?? true

      // ── Intento 1: Login contra nuestro backend ──────────────────
      try {
        const raw = await api.post('/autenticacion/inicio-sesion', { email, password }).then(r => r.data)
        // Mapear respuesta del backend (español) al formato interno
        const data = {
          token: raw.tokenAcceso,
          refreshToken: raw.tokenRefresco ?? null,
          user: raw.usuario ? {
            id: raw.usuario.id,
            email: raw.usuario.email,
            role: raw.usuario.rol,
            full_name: raw.usuario.nombreCompleto,
          } : undefined,
        }
        return { source: 'backend', data, rememberMe }
      } catch (err) {
        // ── Solo interceptamos 401 y solo si el bridge está habilitado ──
        if (err.response?.status !== 401 || !isBridgeAvailable()) {
          throw err
        }

        console.log('[Auth] Backend devolvió 401 — intentando puente con Firebase…')

        // ── Intento 2: Puente Firebase REST API ────────────────────
        const { idToken, profile } = await firebaseBridgeLogin(email, password)

        console.log('[Auth] Puente Firebase exitoso — token obtenido ✓')

        return {
          source: 'firebase-bridge',
          data: {
            token: idToken,
            user: profile,
            refreshToken: null,
          },
          rememberMe,
        }
      }
    },
    onSuccess: (result) => {
      const { source, data, rememberMe } = result
      const token = data.token
      const refresh = data.refreshToken ?? null

      console.log('[Auth] Login response:', { source, token: !!token, hasRefreshToken: !!refresh, rememberMe, role: data.user?.role })

      setRememberMe(rememberMe)
      setAuth(token, data.user, refresh, rememberMe)

      console.log('[Auth] Saved to storage:', {
        hasToken: !!token,
        hasRefreshToken: !!refresh,
        storageType: rememberMe ? 'localStorage' : 'sessionStorage',
      })

      const role = data.user?.role
      if (role === 'admin') nav('/admin')
      else if (role === 'institution') nav('/institution-portal')
      else nav('/dashboard')
    },
  })
}

export function useRegister() {
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  return useMutation({
    mutationFn: ({ _rememberMe, full_name, role, city, state, ...rest }) => {
      const body = {
        ...rest,
        nombreCompleto: full_name,
        rol: role,
        ciudad: city,
        estado: state,
      }
      return api.post('/autenticacion/registro', body).then(r => r.data)
    },
    onSuccess: (raw, variables) => {
      const token = raw.tokenAcceso
      const refresh = raw.tokenRefresco ?? null
      const rememberMe = variables?._rememberMe ?? true
      const user = raw.usuario ? {
        id: raw.usuario.id,
        email: raw.usuario.email,
        role: raw.usuario.rol,
        full_name: raw.usuario.nombreCompleto,
      } : undefined
      console.log('[Auth] Register response:', { token: !!token, hasRefreshToken: !!refresh, rememberMe, role: user?.role })
      setRememberMe(rememberMe)
      setAuth(token, user, refresh, rememberMe)
      console.log('[Auth] Register - saved to storage:', {
        hasToken: !!token,
        hasRefreshToken: !!refresh,
        storageType: rememberMe ? 'localStorage' : 'sessionStorage',
      })
      const role = user?.role
      if (role === 'admin') nav('/admin')
      else if (role === 'institution') nav('/institution-portal')
      else nav('/dashboard')
    },
  })
}

export function useMe() {
  const { token } = useAuthStore()
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/autenticacion/yo').then(r => {
      const d = r.data
      return {
        id: d.id,
        email: d.email,
        role: d.rol,
        full_name: d.nombreCompleto,
        city: d.ciudad,
        state: d.estado,
        avatar_url: d.urlAvatar,
        is_verified: d.verificado,
      }
    }),
    enabled: !!token,
  })
}

/**
 * @typedef {Object} PerfilNecesidades
 * @property {string} id - ID del perfil
 * @property {string} usuarioId - ID del usuario
 * @property {string[]} tiposDiscapacidad - Tipos de discapacidad
 * @property {string|null} severidadDiscapacidad - Severidad de la discapacidad
 * @property {string[]} modosComunicacion - Modos de comunicación
 * @property {string[]} necesidadesMovilidad - Necesidades de movilidad
 * @property {string[]} accesoTecnologia - Acceso a tecnología
 * @property {string[]} zonasPreferidas - Zonas preferidas
 * @property {string[]} necesidades - Necesidades generales
 * @property {string[]} metasActuales - Metas actuales
 * @property {string[]} areasApoyo - Áreas de apoyo
 * @property {string[]} historialEducacion - Historial educativo
 * @property {string[]} historialTerapia - Historial de terapia
 * @property {string|null} etapaVida - Etapa de vida
 * @property {string|null} preocupacionesActuales - Preocupaciones actuales
 * @property {string|null} nivelApoyo - Nivel de apoyo
 */

/**
 * @typedef {Object} UsuarioPerfilCompleto
 * @property {string} id - ID del usuario
 * @property {string} email - Correo electrónico
 * @property {string} nombreCompleto - Nombre completo
 * @property {string} [ciudad] - Ciudad
 * @property {string} [estado] - Estado
 * @property {boolean} activo - Si la cuenta está activa
 * @property {boolean} verificado - Si la identidad está verificada
 * @property {string} fechaCreacion - Fecha de creación (ISO)
 * @property {'admin'|'pcd'|'tutor'|'institution'} rol - Rol del usuario
 * @property {string} [urlAvatar] - URL del avatar
 * @property {PerfilNecesidades} [perfilNecesidades] - Perfil de necesidades
 */

/**
 * Mapea un objeto de usuario desde el formato del backend (español)
 * al formato interno del frontend (inglés).
 * @param {Object} d - Objeto del backend con campos en español
 * @returns {Object} Objeto con campos en inglés
 */
function mapUsuarioBackendToFrontend(d) {
  return {
    id: d.id,
    email: d.email,
    full_name: d.nombreCompleto,
    city: d.ciudad,
    state: d.estado,
    role: d.rol,
    avatar_url: d.urlAvatar,
    is_active: d.activo,
    is_verified: d.verificado,
    created_at: d.fechaCreacion,
  }
}

/**
 * Mapea el perfil de necesidades desde el formato del backend (español)
 * al formato interno del frontend (inglés).
 * @param {Object} p - Objeto perfilNecesidades del backend
 * @returns {Object} Objeto profiling con campos en inglés
 */
function mapPerfilNecesidadesToFrontend(p) {
  if (!p) return null
  return {
    disability_types: p.tiposDiscapacidad ?? [],
    severity: p.severidadDiscapacidad,
    communication_modes: p.modosComunicacion ?? [],
    mobility_needs: p.necesidadesMovilidad ?? [],
    tech_access: p.accesoTecnologia ?? [],
    preferred_zones: p.zonasPreferidas ?? [],
    needs: p.necesidades ?? [],
    goals: p.metasActuales ?? [],
    support_areas: p.areasApoyo ?? [],
    education_history: p.historialEducacion ?? [],
    therapy_history: p.historialTerapia ?? [],
    life_stage: p.etapaVida,
    current_concerns: p.preocupacionesActuales,
    support_level: p.nivelApoyo,
  }
}

/**
 * Mapea el perfil de necesidades desde el formato interno (inglés)
 * al formato del backend (español) para enviar al PUT.
 * @param {Object} profiling - Objeto profiling con campos en inglés
 * @returns {Object} Objeto perfilNecesidades con campos en español
 */
function mapPerfilNecesidadesToBackend(profiling) {
  return {
    tiposDiscapacidad: profiling.disability_types ?? [],
    severidadDiscapacidad: profiling.severity ?? null,
    modosComunicacion: profiling.communication_modes ?? [],
    necesidadesMovilidad: profiling.mobility_needs ?? [],
    accesoTecnologia: profiling.tech_access ?? [],
    zonasPreferidas: profiling.preferred_zones ?? [],
    necesidades: profiling.needs ?? [],
    metasActuales: profiling.goals ?? [],
    areasApoyo: profiling.support_areas ?? [],
    historialEducacion: profiling.education_history ?? [],
    historialTerapia: profiling.therapy_history ?? [],
    etapaVida: profiling.life_stage ?? null,
    preocupacionesActuales: profiling.current_concerns ?? null,
    nivelApoyo: profiling.support_level ?? null,
  }
}

/**
 * Hook para obtener el perfil completo del usuario autenticado.
 * GET /api/usuarios/perfil
 */
export function useProfile() {
  const { token } = useAuthStore()
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/usuarios/perfil').then(r => {
      const d = r.data?.datos ?? r.data
      return {
        ...mapUsuarioBackendToFrontend(d),
        profiling: mapPerfilNecesidadesToFrontend(d.perfilNecesidades),
      }
    }),
    enabled: !!token,
  })
}

/**
 * Hook para actualizar el perfil del usuario.
 * PUT /api/usuarios/perfil
 * Acepta datos del usuario y opcionalmente perfilNecesidades.
 */
export function useUpdateProfile() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: (data) => {
      // Construir el body en español para el backend
      const body = {
        nombreCompleto: data.full_name,
        ciudad: data.city,
        estado: data.state,
      }
      // Si se proporcionan datos de perfilNecesidades, incluirlos
      if (data.profiling) {
        body.perfilNecesidades = mapPerfilNecesidadesToBackend(data.profiling)
      }
      return api.put('/usuarios/perfil', body).then(r => r.data)
    },
    onSuccess: (raw) => {
      // Mapear la respuesta completa del backend al formato interno
      const updatedUser = mapUsuarioBackendToFrontend(raw)
      // Actualizar el store global con los nuevos datos del usuario
      if (user) {
        useAuthStore.setState({ user: updatedUser })
        saveUser(updatedUser, getRememberMe())
      }
      // Invalidar queries para refrescar datos
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

/**
 * Hook para subir y actualizar el avatar del usuario.
 * POST /api/usuarios/avatar (multipart/form-data)
 * @param {File} archivoImagen - Archivo de imagen a subir
 * @returns {{ mensaje: string, urlAvatar: string }}
 */
export function useActualizarAvatar() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: (archivoImagen) => {
      const formData = new FormData()
      formData.append('avatar', archivoImagen)
      // Axios configura automáticamente el Content-Type con el boundary correcto
      return api.post('/usuarios/avatar', formData).then(r => r.data)
    },
    onSuccess: (data) => {
      // Actualizar el usuario en el store global con la nueva URL del avatar
      if (data.urlAvatar && user) {
        const updatedUser = { ...user, avatar_url: data.urlAvatar }
        // Actualizar store directamente sin llamar setAuth (evita re-saves de token)
        useAuthStore.setState({ user: updatedUser })
        // Persistir en storage con el rememberMe correcto
        saveUser(updatedUser, getRememberMe())
      }
      // Invalidar queries para refrescar datos
      qc.invalidateQueries({ queryKey: ['me'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
