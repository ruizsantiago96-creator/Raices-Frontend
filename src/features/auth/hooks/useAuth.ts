import { useQuery, useQueryClient, useMutation, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query'
import { useUiStore } from '@shared/stores/uiStore'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useAuthStore } from '../store/authStore'
import { setRememberMe, saveUser, getRememberMe } from '@shared/lib/storage'
import { firebaseBridgeLogin, isBridgeAvailable } from '../lib/firebaseBridge'
import type { User, UserRole, BackendUser } from '../../../types/auth'

/**
 * HOOKS Y SERVICIOS DE AUTENTICACIÓN Y PERFIL (Fase 3 · Migración TS)
 * ===================================================================
 */

/**
 * Normaliza el rol retornado por el backend al formato interno del frontend.
 * El backend puede retornar 'institucion', 'Institucion', etc. en español,
 * mientras que el frontend espera 'institution' (inglés).
 */
export function normalizeRole(rawRole?: string | null): UserRole {
  if (!rawRole) return (rawRole ?? '') as UserRole
  const lower = rawRole.toLowerCase()
  if (lower === 'institucion' || lower === 'institución') return 'institution'
  if (lower === 'padre_tutor' || lower === 'padre-tutor') return 'tutor'
  return rawRole as UserRole
}

/**
 * Retorna la ruta inicial según el rol del usuario.
 * Por defecto redirige al feed principal ('/feed').
 */
export function getHomePathByRole(rawRole?: string | null): string {
  const role = normalizeRole(rawRole)
  if (role === 'admin') return '/admin'
  if (role === 'institution') return '/institution-portal'
  return '/feed'
}

export interface LoginVariables {
  _rememberMe?: boolean
  email: string
  password: string
}

export interface LoginSuccessData {
  token: string
  refreshToken: string | null
  user?: User
}

export interface LoginResult {
  source: 'backend' | 'firebase-bridge'
  data: LoginSuccessData
  rememberMe: boolean
}

export function useLogin(): UseMutationResult<LoginResult, Error, LoginVariables> {
  const { setAuth } = useAuthStore()
  return useMutation<LoginResult, Error, LoginVariables>({
    mutationFn: async ({ _rememberMe, email, password }: LoginVariables) => {
      const rememberMe = _rememberMe ?? true

      // ── Intento 1: Login contra nuestro backend ──────────────────
      try {
        const raw = await api.post('/autenticacion/inicio-sesion', { email, password }).then(r => r.data)
        // Mapear respuesta del backend (español) al formato interno
        const data: LoginSuccessData = {
          token: raw.tokenAcceso,
          refreshToken: raw.tokenRefresco ?? null,
          user: raw.usuario ? {
            id: raw.usuario.id,
            email: raw.usuario.email,
            role: normalizeRole(raw.usuario.rol),
            full_name: raw.usuario.nombreCompleto,
            features: raw.usuario.features ?? {},
          } : undefined,
        }
        return { source: 'backend', data, rememberMe }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
        // Si el backend indica que el usuario está inactivo o desactivado, lanzamos el error amigable directamente.
        const backendMessage = axiosErr.response?.data?.message ?? ''
        const isInactive = 
          backendMessage.toLowerCase().includes('inactiv') || 
          backendMessage.toLowerCase().includes('desactiv') || 
          backendMessage.toLowerCase().includes('deshabilit') ||
          backendMessage.toLowerCase().includes('disabled') ||
          backendMessage.toLowerCase().includes('suspende')
          
        if (isInactive) {
          const customErr = new Error('Tu cuenta ha sido desactivada. Por favor, contacta al soporte.')
          throw customErr
        }

        // ── Solo interceptamos 401 y solo si el bridge está habilitado ──
        if (axiosErr.response?.status !== 401 || !isBridgeAvailable()) {
          throw err as Error
        }

        console.log('[Auth] Backend devolvió 401 — intentando puente con Firebase…')

        // ── Intento 2: Puente Firebase REST API ────────────────────
        const { idToken, profile } = await firebaseBridgeLogin(email, password)

        console.log('[Auth] Puente Firebase exitoso — token obtenido ✓')

        return {
          source: 'firebase-bridge',
          data: {
            token: idToken,
            user: profile as User,
            refreshToken: null,
          },
          rememberMe,
        }
      }
    },
    onSuccess: (result: LoginResult) => {
      const { source, data, rememberMe } = result
      const token = data.token
      const refresh = data.refreshToken ?? null

      console.log('[Auth] Login response:', { source, token: Boolean(token), hasRefreshToken: Boolean(refresh), rememberMe, role: data.user?.role })

      setRememberMe(rememberMe)
      setAuth(token, data.user, refresh, rememberMe)

      console.log('[Auth] Saved to storage:', {
        hasToken: Boolean(token),
        hasRefreshToken: Boolean(refresh),
        storageType: rememberMe ? 'localStorage' : 'sessionStorage',
      })
    },
  })
}

export interface RegisterVariables {
  _rememberMe?: boolean
  full_name: string
  role: string
  city?: string
  state?: string
  country?: string
  [key: string]: unknown
}

export interface RegisterApiResponse {
  tokenAcceso?: string
  tokenRefresco?: string | null
  usuario?: BackendUser
  mensaje?: string
  requiereInicioSesion?: boolean
  [key: string]: unknown
}

export function useRegister(): UseMutationResult<RegisterApiResponse, Error, RegisterVariables> {
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  const { addToast } = useUiStore()
  return useMutation<RegisterApiResponse, Error, RegisterVariables>({
    mutationFn: ({ _rememberMe, full_name, role, city, state, country, ...rest }: RegisterVariables) => {
      // Mapear roles del frontend a los valores que acepta el backend
      const ROLE_MAP: Record<string, string> = { tutor: 'padre_tutor', empresa: 'empresa', institution: 'institucion' }
      const body = {
        ...rest,
        ...(role === 'institution' ? { nombre: full_name, nombreCompleto: full_name } : { nombreCompleto: full_name }),
        rol: ROLE_MAP[role] || role,
        ciudad: city,
        estado: state,
        ...(country ? { pais: country } : {}),
      }
      return api.post('/autenticacion/registro', body).then(r => r.data)
    },
    onSuccess: (raw: RegisterApiResponse, variables: RegisterVariables) => {
      const rememberMe = variables?._rememberMe ?? true
      const role = variables?.role

      if (!raw.tokenAcceso) {
        console.log('[Auth] ' + (role ?? 'user') + ' registered — no token returned. Redirecting to login.')
        addToast(raw.mensaje ?? 'Registro exitoso. Inicia sesión para continuar.', 'success')
        nav('/auth')
        return
      }

      // Con token: login automático
      const token = raw.tokenAcceso
      const refresh = raw.tokenRefresco ?? null
      const user: User | undefined = raw.usuario ? {
        id: raw.usuario.id,
        email: raw.usuario.email,
        role: normalizeRole(raw.usuario.rol),
        full_name: raw.usuario.nombreCompleto || '',
        features: raw.usuario.features ?? {},
      } : undefined

      console.log('[Auth] Register response:', { token: Boolean(token), hasRefreshToken: Boolean(refresh), rememberMe, role: user?.role })
      setRememberMe(rememberMe)
      setAuth(token, user, refresh, rememberMe)
      console.log('[Auth] Register - saved to storage:', {
        hasToken: Boolean(token),
        hasRefreshToken: Boolean(refresh),
        storageType: rememberMe ? 'localStorage' : 'sessionStorage',
      })
      nav(getHomePathByRole(role), { replace: true })
    },
  })
}

export interface MeResponse extends User {
  avatar_url?: string | null
  is_verified?: boolean
}

export function useMe(): UseQueryResult<MeResponse, Error> {
  const { token } = useAuthStore()
  return useQuery<MeResponse, Error>({
    queryKey: ['me'],
    queryFn: () => api.get('/autenticacion/yo').then(r => {
      const d = r.data
      return {
        id: d.id,
        email: d.email,
        role: normalizeRole(d.rol),
        full_name: d.nombreCompleto,
        city: d.ciudad,
        state: d.estado,
        country: d.pais,
        codigoPostal: d.codigoPostal,
        avatar_url: d.urlAvatar,
        is_verified: d.verificado,
        features: d.features ?? {},
        destinatarioRegistro: d.destinatarioRegistro ?? null,
        curp: d.curp ?? null,
        telefonoContacto: d.telefonoContacto ?? null,
        preferenciasAcompanamiento: d.preferenciasAcompanamiento ?? null,
      }
    }),
    enabled: Boolean(token),
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

export interface PerfilNecesidadesBackend {
  id?: string
  usuarioId?: string
  tiposDiscapacidad?: string[]
  severidadDiscapacidad?: string | null
  modosComunicacion?: string[]
  necesidadesMovilidad?: string[]
  accesoTecnologia?: string[]
  zonasPreferidas?: string[]
  necesidades?: string[]
  metasActuales?: string[]
  areasApoyo?: string[]
  historialEducacion?: string[]
  historialTerapia?: string[]
  etapaVida?: string | null
  preocupacionesActuales?: string | null
  nivelApoyo?: string | null
  edad?: number | null
  fechaNacimiento?: string | null
}

export interface ProfilingFrontend {
  disability_types: string[]
  severity: string | null
  communication_modes: string[]
  mobility_needs: string[]
  tech_access: string[]
  preferred_zones: string[]
  needs: string[]
  goals: string[]
  support_areas: string[]
  education_history: string[]
  therapy_history: string[]
  life_stage: string | null
  current_concerns: string | null
  support_level: string | null
  age?: number | null
  birth_date?: string | null
}

export interface UserProfileResponse extends User {
  profiling: ProfilingFrontend | null
}

function mapUsuarioBackendToFrontend(d: BackendUser): User {
  return {
    id: d.id,
    email: d.email,
    full_name: d.nombreCompleto || '',
    city: d.ciudad,
    state: d.estado,
    country: d.pais,
    codigoPostal: d.codigoPostal,
    role: normalizeRole(d.rol),
    avatar_url: d.urlAvatar,
    is_active: d.activo,
    is_verified: d.verificado,
    created_at: d.fechaCreacion,
    features: d.features ?? {},
  }
}

function mapPerfilNecesidadesToFrontend(p?: PerfilNecesidadesBackend | null): ProfilingFrontend | null {
  if (!p) return null
  return {
    disability_types: p.tiposDiscapacidad ?? [],
    severity: p.severidadDiscapacidad ?? null,
    communication_modes: p.modosComunicacion ?? [],
    mobility_needs: p.necesidadesMovilidad ?? [],
    tech_access: p.accesoTecnologia ?? [],
    preferred_zones: p.zonasPreferidas ?? [],
    needs: p.necesidades ?? [],
    goals: p.metasActuales ?? [],
    support_areas: p.areasApoyo ?? [],
    education_history: p.historialEducacion ?? [],
    therapy_history: p.historialTerapia ?? [],
    life_stage: p.etapaVida ?? null,
    current_concerns: p.preocupacionesActuales ?? null,
    support_level: p.nivelApoyo ?? null,
    age: p.edad ?? null,
    birth_date: p.fechaNacimiento ?? null,
  }
}

function mapPerfilNecesidadesToBackend(profiling: Partial<ProfilingFrontend>): PerfilNecesidadesBackend {
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
    edad: profiling.age ?? null,
    fechaNacimiento: profiling.birth_date ?? null,
  }
}

export function useProfile(): UseQueryResult<UserProfileResponse, Error> {
  const { token, user } = useAuthStore()
  return useQuery<UserProfileResponse, Error>({
    queryKey: ['profile'],
    queryFn: () => api.get('/usuarios/perfil').then(r => {
      const d = r.data?.datos ?? r.data
      const mapped: UserProfileResponse = {
        ...mapUsuarioBackendToFrontend(d),
        profiling: mapPerfilNecesidadesToFrontend(d.perfilNecesidades),
      }
      if (mapped.profiling) {
        const userId = user?.id || mapped.id
        if (userId) {
          const localBirthDate = localStorage.getItem(`raices_birth_date_${userId}`)
          const localAge = localStorage.getItem(`raices_age_${userId}`)
          if (localBirthDate && !mapped.profiling.birth_date) {
            mapped.profiling.birth_date = localBirthDate
          }
          if (localAge && !mapped.profiling.age) {
            mapped.profiling.age = Number(localAge)
          }
        }
      }
      return mapped
    }),
    enabled: Boolean(token),
  })
}

export interface UpdateProfileVariables {
  full_name?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  profiling?: Partial<ProfilingFrontend>
}

export function useUpdateProfile(): UseMutationResult<BackendUser, Error, UpdateProfileVariables> {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  return useMutation<BackendUser, Error, UpdateProfileVariables>({
    mutationFn: async (data: UpdateProfileVariables) => {
      let resultUser: BackendUser = {} as BackendUser
      const body: Record<string, unknown> = {}
      if (data.full_name !== undefined) body.nombreCompleto = data.full_name
      if (data.city !== undefined) body.ciudad = data.city
      if (data.state !== undefined) body.estado = data.state
      if (data.country !== undefined) body.pais = data.country
      if (data.postalCode !== undefined) body.codigoPostal = data.postalCode
      if (Object.keys(body).length > 0) {
        const res = await api.put('/usuarios/perfil', body)
        resultUser = res.data
      }
      if (data.profiling) {
        const needsBody = mapPerfilNecesidadesToBackend(data.profiling)
        await api.put('/usuarios/perfil-necesidades', needsBody)
      }
      return resultUser
    },
    onSuccess: (raw: BackendUser) => {
      const updatedUser = mapUsuarioBackendToFrontend(raw)
      if (user) {
        useAuthStore.setState({ user: updatedUser })
        saveUser(updatedUser, getRememberMe())
      }
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export interface UpdateNeedsProfileVariables {
  profiling: Partial<ProfilingFrontend>
}

export function useUpdateNeedsProfile(): UseMutationResult<unknown, Error, UpdateNeedsProfileVariables> {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  return useMutation<unknown, Error, UpdateNeedsProfileVariables>({
    mutationFn: (data: UpdateNeedsProfileVariables) => {
      const body = mapPerfilNecesidadesToBackend(data.profiling)
      const userId = user?.id
      if (userId) {
        if (data.profiling?.birth_date) {
          localStorage.setItem(`raices_birth_date_${userId}`, data.profiling.birth_date)
        }
        if (data.profiling?.age) {
          localStorage.setItem(`raices_age_${userId}`, String(data.profiling.age))
        }
      }
      return api.post('/usuarios/perfil-necesidades', body).then(r => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['perfil'] })
    },
  })
}

export interface ActualizarAvatarResponse {
  mensaje: string
  urlAvatar: string
}

export function useActualizarAvatar(): UseMutationResult<ActualizarAvatarResponse, Error, File> {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  return useMutation<ActualizarAvatarResponse, Error, File>({
    mutationFn: (archivoImagen: File) => {
      const formData = new FormData()
      formData.append('avatar', archivoImagen)
      return api.post('/usuarios/avatar', formData).then(r => r.data)
    },
    onSuccess: (data: ActualizarAvatarResponse) => {
      if (data.urlAvatar && user) {
        const updatedUser: User = { ...user, avatar_url: data.urlAvatar }
        useAuthStore.setState({ user: updatedUser })
        saveUser(updatedUser, getRememberMe())
      }
      qc.invalidateQueries({ queryKey: ['me'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export interface EliminarAvatarResponse {
  exito: boolean
  mensaje: string
}

export function useEliminarAvatar(): UseMutationResult<EliminarAvatarResponse, Error, void> {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  return useMutation<EliminarAvatarResponse, Error, void>({
    mutationFn: () => api.delete('/usuarios/avatar').then(r => r.data),
    onSuccess: (data: EliminarAvatarResponse) => {
      if (!data.exito) {
        throw new Error(data.mensaje ?? 'No se pudo eliminar el avatar')
      }
      if (user) {
        const updatedUser: User = { ...user, avatar_url: null }
        useAuthStore.setState({ user: updatedUser })
        saveUser(updatedUser, getRememberMe())
      }
      qc.invalidateQueries({ queryKey: ['me'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
