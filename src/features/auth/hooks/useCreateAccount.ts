import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { useUiStore } from '@shared/stores/uiStore'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useAuthStore } from '../store/authStore'
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from '@shared/constants/backendEndpoints'
import { normalizeRole, getHomePathByRole } from './useAuth'
import type {
  User,
  CreateAccountResult,
  PcdRegisterPayload,
  TutorRegisterPayload,
  InstitutionRegisterPayload,
  EnterpriseRegisterPayload,
  RegisterPayload,
} from '../../../types/auth'

/**
 * MAPA DE PAYLOADS POR ROL (Fase 3 · Migración TS)
 * ==================================================
 * Define cómo construir el payload de registro para cada rol,
 * y qué post-pasos se ejecutan después del registro.
 */

export type AccountRoleType = 'pcd' | 'tutor' | 'institution' | 'empresa' | 'admin'

export interface PostStep {
  name: string
  optional?: boolean
  execute: () => Promise<void> | void
}

export interface PcdFormData {
  nombres?: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  email: string
  password: string
  curp?: string
  birth_date: string
  ciudad: string
  estado: string
  [key: string]: unknown
}

export interface InstitutionFormData {
  orgForm?: {
    nombre?: string
    descripcion?: string
    mision?: string
    contactName?: string
    phone?: string
    website?: string
    curp?: string
  }
  accountForm?: {
    email?: string
    password?: string
    city?: string
    state?: string
  }
  email?: string
  password?: string
  ciudad?: string
  estado?: string
  categoria?: string
  subtipo?: string
  selectedServices?: string[]
  selectedCommunity?: string
}

export interface EnterpriseFormData {
  orgForm?: {
    nombre?: string
    descripcion?: string
    especialidades?: string
    contactName?: string
    phone?: string
    website?: string
  }
  accountForm?: {
    email?: string
    password?: string
    city?: string
    state?: string
  }
  email?: string
  password?: string
  ciudad?: string
  estado?: string
  subtipo?: string
  selectedServices?: string[]
  selectedCommunity?: string
}

export interface RawRegisterResponse {
  tokenAcceso?: string
  tokenRefresco?: string | null
  usuario?: {
    id: string
    email?: string
    rol?: string
    nombreCompleto?: string
    features?: Record<string, boolean | string | number | undefined>
  }
  requiereInicioSesion?: boolean
  mensaje?: string
  uid?: string
}

/**
 * MAPA DE ROLES AL BACKEND
 */
const ROLE_TO_BACKEND: Record<string, string> = {
  pcd: 'pcd',
  tutor: 'padre_tutor',
  institution: 'institucion',
  empresa: 'empresa',
}

/**
 * Construye el payload de registro para PCD
 */
export function buildPcdPayload(form: PcdFormData, extra: Record<string, unknown> = {}): PcdRegisterPayload {
  const { nombres, apellidoPaterno, apellidoMaterno, email, password, curp, birth_date, ciudad, estado } = form
  const nombreCompleto = [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ').trim()

  return {
    nombreCompleto,
    email,
    password,
    rol: 'pcd',
    ...(curp ? { curp } : {}),
    fechaNacimiento: birth_date,
    ciudad,
    estado,
    ...extra,
  }
}

/**
 * Construye el payload de registro para Tutor
 */
export function buildTutorPayload(form: PcdFormData, extra: Record<string, unknown> = {}): TutorRegisterPayload {
  const { nombres, apellidoPaterno, apellidoMaterno, email, password, curp, birth_date, ciudad, estado } = form
  const nombreCompleto = [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ').trim()

  return {
    nombreCompleto,
    email,
    password,
    rol: 'padre_tutor',
    ...(curp ? { curp } : {}),
    fechaNacimiento: birth_date,
    ciudad,
    estado,
    ...extra,
  }
}

/**
 * Construye el payload de registro para Institución
 */
export function buildInstitutionPayload(data: InstitutionFormData): InstitutionRegisterPayload {
  return {
    nombre: data.orgForm?.nombre,
    nombreCompleto: data.orgForm?.nombre || data.orgForm?.contactName,
    email: (data.accountForm?.email || data.email) ?? '',
    password: (data.accountForm?.password || data.password) ?? '',
    rol: 'institucion',
    ciudad: (data.accountForm?.city || data.ciudad) ?? '',
    estado: (data.accountForm?.state || data.estado) ?? '',
    categoria: data.categoria,
    tipoInstitucion: data.subtipo,
    curp: (data.orgForm?.curp || '').trim().toUpperCase(),
    descripcion: data.orgForm?.descripcion,
    mision: data.orgForm?.mision,
    nombreContacto: data.orgForm?.contactName,
    telefonoContacto: data.orgForm?.phone,
    sitioWeb: data.orgForm?.website,
    serviciosOfrecidos: data.selectedServices,
    comunidadConectada: data.selectedCommunity,
  }
}

/**
 * Construye el payload de registro para Empresa/Ecosistema
 */
export function buildEnterprisePayload(data: EnterpriseFormData): EnterpriseRegisterPayload {
  return {
    nombre: data.orgForm?.nombre,
    nombreCompleto: data.orgForm?.nombre || data.orgForm?.contactName,
    email: (data.accountForm?.email || data.email) ?? '',
    password: (data.accountForm?.password || data.password) ?? '',
    rol: 'empresa',
    ciudad: (data.accountForm?.city || data.ciudad) ?? '',
    estado: (data.accountForm?.state || data.estado) ?? '',
    tipoEcosistema: data.subtipo,
    descripcion: data.orgForm?.descripcion,
    especialidades: data.orgForm?.especialidades,
    nombreContacto: data.orgForm?.contactName,
    telefonoContacto: data.orgForm?.phone,
    sitioWeb: data.orgForm?.website,
    serviciosOfrecidos: data.selectedServices,
    comunidadConectada: data.selectedCommunity,
  }
}

/**
 * Procesa la respuesta del backend y determina si hay que hacer auto-login
 */
function processRegisterResult(
  raw: RawRegisterResponse,
  role: AccountRoleType,
  rememberMe: boolean
): CreateAccountResult {
  const requiereInicioSesion = raw.requiereInicioSesion === true

  if (!raw.tokenAcceso) {
    if (requiereInicioSesion) {
      return {
        success: true,
        requiresLogin: true,
        message: raw.mensaje || 'Registro exitoso. Inicia sesión para continuar.',
      }
    }

    if (raw.mensaje || raw.uid) {
      return {
        success: true,
        requiresLogin: false,
        message: raw.mensaje || 'Registro completado.',
      }
    }

    return {
      success: false,
      requiresLogin: false,
      message: raw.mensaje || 'No se pudo completar el registro. Inténtalo de nuevo.',
    }
  }

  const token = raw.tokenAcceso
  const refreshToken = raw.tokenRefresco ?? null
  const usuario = raw.usuario

  if (!usuario) {
    return {
      success: false,
      requiresLogin: false,
      message: 'Error al procesar la respuesta del servidor.',
    }
  }

  const userObj: User = {
    id: usuario.id,
    email: usuario.email || '',
    role: normalizeRole(usuario.rol),
    full_name: usuario.nombreCompleto || '',
    features: usuario.features ?? {},
  }

  return {
    success: true,
    requiresLogin: false,
    user: userObj,
    token,
    refreshToken,
    message: 'Registro completado exitosamente.',
  }
}

export interface CreateAccountOptions<TForm = Record<string, unknown>, TExtra = Record<string, unknown>> {
  role: AccountRoleType
  buildPayload: (formData: TForm, extra?: TExtra) => RegisterPayload
  postSteps?: PostStep[]
  extra?: TExtra
}

/**
 * Hook centralizado para crear una cuenta
 */
export function useCreateAccount<TForm = Record<string, unknown>, TExtra = Record<string, unknown>>({
  role,
  buildPayload,
  postSteps = [],
  extra,
}: CreateAccountOptions<TForm, TExtra>): UseMutationResult<CreateAccountResult, Error, TForm> {
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  const { addToast } = useUiStore()

  return useMutation<CreateAccountResult, Error, TForm>({
    mutationFn: async (formData: TForm): Promise<CreateAccountResult> => {
      // 1. Construir el payload según el rol
      const registerPayload = buildPayload(formData, extra)

      // 2. Registrar la cuenta
      const regRes = await api.post(AUTH_ENDPOINTS.REGISTER.path, registerPayload)
      const authResult: RawRegisterResponse = regRes.data

      // 3. Procesar el resultado
      const rememberMe = true
      const result = processRegisterResult(authResult, role, rememberMe)

      // 4. Si no hay token y no hay éxito, es un error
      if (!result.success) {
        throw new Error(result.message)
      }

      // 5. Si no hay token en la respuesta del registro, intentar auto-login
      if (!authResult.tokenAcceso) {
        try {
          const loginRes = await api.post(AUTH_ENDPOINTS.LOGIN.path, {
            email: registerPayload.email,
            password: registerPayload.password,
          })
          const lr = loginRes.data
          if (lr.tokenAcceso) {
            const usuarioLogin: User | null = lr.usuario ? {
              id: lr.usuario.id,
              email: lr.usuario.email,
              role: normalizeRole(lr.usuario.rol),
              full_name: lr.usuario.nombreCompleto,
              features: lr.usuario.features ?? {},
            } : null

            setAuth(lr.tokenAcceso, usuarioLogin, lr.tokenRefresco ?? null, rememberMe)

            const postStepsResult: Array<{ name: string; success: boolean; error?: string; skipped?: boolean }> = []
            for (const step of postSteps) {
              try {
                await step.execute()
                postStepsResult.push({ name: step.name, success: true })
              } catch (err: unknown) {
                const errorMsg = err instanceof Error ? err.message : String(err)
                console.warn(`[useCreateAccount] Post-step "${step.name}" falló:`, err)
                if (!step.optional) {
                  postStepsResult.push({ name: step.name, success: false, error: errorMsg })
                } else {
                  postStepsResult.push({ name: step.name, success: false, error: errorMsg, skipped: true })
                }
              }
            }

            return {
              success: true,
              requiresLogin: false,
              user: usuarioLogin,
              token: lr.tokenAcceso,
              refreshToken: lr.tokenRefresco ?? null,
              message: 'Registro completado exitosamente.',
              postStepsResult,
            }
          }
        } catch (loginErr: unknown) {
          console.warn('[useCreateAccount] Auto login tras registro falló:', loginErr)
        }

        if (result.requiresLogin) {
          return {
            ...result,
            postStepsResult: null,
          }
        }

        throw new Error('No se pudo obtener sesión después del registro.')
      }

      // 6. Con token del registro: persistencia única vía setAuth
      const user: User | null = authResult.usuario ? {
        id: authResult.usuario.id,
        email: authResult.usuario.email || registerPayload.email,
        role: normalizeRole(authResult.usuario.rol),
        full_name: authResult.usuario.nombreCompleto || (registerPayload as { nombreCompleto?: string }).nombreCompleto || '',
        features: authResult.usuario.features ?? {},
      } : (result.user ?? null)

      setAuth(authResult.tokenAcceso, user, authResult.tokenRefresco ?? null, rememberMe)

      // 7. Ejecutar post-pasos específicos por rol
      const postStepsResult: Array<{ name: string; success: boolean; error?: string; skipped?: boolean }> = []
      for (const step of postSteps) {
        try {
          await step.execute()
          postStepsResult.push({ name: step.name, success: true })
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err)
          console.warn(`[useCreateAccount] Post-step "${step.name}" falló:`, err)
          if (!step.optional) {
            postStepsResult.push({ name: step.name, success: false, error: errorMsg })
          } else {
            postStepsResult.push({ name: step.name, success: false, error: errorMsg, skipped: true })
          }
        }
      }

      return {
        ...result,
        postStepsResult,
      }
    },
    onSuccess: (result: CreateAccountResult) => {
      if (result.requiresLogin) {
        addToast(result.message || 'Registro exitoso. Inicia sesión para continuar.', 'success')
        nav('/auth?mode=login', { replace: true })
        return
      }

      if (!result.success) {
        addToast(result.message || 'Error en el registro.', 'error')
        return
      }

      const roleName = role === 'pcd' ? 'Persona con Discapacidad' :
                       role === 'tutor' ? 'Tutor' :
                       role === 'institution' ? 'Institución' : 'Empresa'
      addToast(`¡${roleName} registrada exitosamente!`, 'success')

      // Navegación según rol
      nav(getHomePathByRole(role), { replace: true })
    },
    onError: (error: Error) => {
      addToast(error.message || 'No pudimos completar el registro. Intenta de nuevo.', 'error')
    },
  })
}

export interface PcdPostStepsDependencies {
  scales: {
    autonomia?: number
    independencia?: number
    comunicacion?: number
    comprension?: number
    energia?: number
    movilidad?: number
    social?: number
    emocional?: number
  }
  conditionData: {
    tieneDiagnostico?: string
    temporalidad?: string
    conditions: string[]
    neurodivergencias: string[]
    diagnosticoEspecifico?: string
  }
  formatos: string[]
  selectedInterests: string[]
  viabilidad: string
  preferredZones: string[]
  needsList: string[]
  supportAreas: string[]
  educacionHistory: string[]
  terapiaHistory: string[]
  birth_date: string
  updateProfile: { mutateAsync: (data: { full_name: string; city?: string; state?: string }) => Promise<unknown> }
  updateNeedsProfile: { mutateAsync: (data: { profiling: Record<string, unknown> }) => Promise<unknown> }
  calcEdad: (birthDate: string) => number | null
  calcEtapaVida: (birthDate: string) => string | null
}

export function createPcdPostStepsFactory(dependencies: PcdPostStepsDependencies): PostStep[] {
  const {
    scales,
    conditionData,
    formatos,
    selectedInterests,
    viabilidad,
    preferredZones,
    needsList,
    supportAreas,
    educacionHistory,
    terapiaHistory,
    birth_date,
    updateNeedsProfile,
    calcEdad,
    calcEtapaVida,
  } = dependencies

  return [
    {
      name: 'escalas-vida',
      optional: true,
      execute: async () => {
        const payload = {
          nivelAutonomia: scales.autonomia ?? 3,
          nivelIndependencia: scales.independencia ?? 3,
          nivelComunicacion: scales.comunicacion ?? 3,
          nivelComprension: scales.comprension ?? 3,
          nivelEnergia: scales.energia ?? 3,
          nivelMovilidad: scales.movilidad ?? 3,
          nivelSocial: scales.social ?? 3,
          nivelEmocional: scales.emocional ?? 3,
          tieneDiagnostico: conditionData.tieneDiagnostico === 'si',
          temporalidadOrigen: conditionData.temporalidad,
          preferenciaFormato: formatos[0] || 'texto',
          areasInteres: selectedInterests,
          viabilidadEconomica: viabilidad,
        }
        await api.post(USER_ENDPOINTS.SAVE_ESCALAS_VIDA.path, payload)
      },
    },
    {
      name: 'perfil-necesidades',
      optional: true,
      execute: async () => {
        const disabilityTypes = conditionData.conditions.filter(c => c !== 'Prefiero no responder')
        const allConditions = [...disabilityTypes, ...conditionData.neurodivergencias]

        await updateNeedsProfile.mutateAsync({
          profiling: {
            disability_types: allConditions.length > 0 ? allConditions : disabilityTypes,
            severity: conditionData.conditions.includes('Prefiero no responder') ? null : conditionData.conditions.join(', '),
            communication_modes: formatos.filter(f => f !== 'Prefiero no responder'),
            mobility_needs: (scales.movilidad ?? 3) >= 4 ? [] : ['Movilidad reducida'],
            tech_access: formatos,
            preferred_zones: preferredZones,
            needs: needsList,
            goals: selectedInterests,
            support_areas: supportAreas,
            education_history: educacionHistory,
            therapy_history: terapiaHistory,
            life_stage: calcEtapaVida(birth_date),
            current_concerns: conditionData.diagnosticoEspecifico || null,
            support_level: (scales.comunicacion ?? 3) >= 4 ? 'independiente' : (scales.comunicacion ?? 3) >= 2 ? 'con_apoyo' : 'necesita_apoyo_intensivo',
            birth_date,
            age: calcEdad(birth_date),
          },
        })
      },
    },
  ]
}

export function createTutorPostStepsFactory(_dependencies?: unknown): PostStep[] {
  return []
}

export function createInstitutionPostStepsFactory(_dependencies?: unknown): PostStep[] {
  return []
}

export function createEnterprisePostStepsFactory(_dependencies?: unknown): PostStep[] {
  return []
}

export const payloadBuilders = {
  pcd: buildPcdPayload,
  tutor: buildTutorPayload,
  institution: buildInstitutionPayload,
  empresa: buildEnterprisePayload,
}

export const roleMappers = {
  toBackend: ROLE_TO_BACKEND,
  normalize: normalizeRole,
}
