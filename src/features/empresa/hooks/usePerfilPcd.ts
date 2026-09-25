import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth/store/authStore'

/**
 * Perfil completo de una PCD (respuesta de GET /usuarios/perfil-pcd/:id).
 * El backend permite consultarlo a instituciones (y empresas, vía la
 * normalización de rol del JWT) para evaluar postulantes.
 */
export interface PerfilPcd {
  id: string
  nombreCompleto?: string | null
  email?: string | null
  rol?: string
  ciudad?: string | null
  estado?: string | null
  urlAvatar?: string | null
  verificado?: boolean
  fechaCreacion?: string | null
  perfilNecesidades?: {
    tiposDiscapacidad?: string[] | null
    severidadDiscapacidad?: string | null
    modosComunicacion?: string[] | null
    necesidadesMovilidad?: string[] | null
    accesoTecnologia?: string[] | null
    zonasPreferidas?: string[] | null
    necesidades?: string[] | null
    metasActuales?: string[] | null
    areasApoyo?: string[] | null
    historialEducacion?: unknown[] | null
    historialTerapia?: unknown[] | null
    etapaVida?: string | null
    preocupacionesActuales?: string | null
    nivelApoyo?: string | null
    tieneDiagnostico?: boolean | null
    preferenciaFormato?: string | null
    areasInteres?: string[] | null
    [key: string]: unknown
  } | null
  [key: string]: unknown
}

/**
 * Consulta el perfil completo de una PCD por su ID.
 * Solo se ejecuta con usuario autenticado y con un ID válido.
 */
export function usePerfilPcd(pcdUserId?: string | number | null): UseQueryResult<PerfilPcd, Error> {
  const token = useAuthStore(s => s.token)
  const id = pcdUserId != null && pcdUserId !== '' ? String(pcdUserId) : null

  return useQuery<PerfilPcd, Error>({
    queryKey: ['perfil-pcd', id],
    queryFn: async () => {
      const r = await api.get(`/usuarios/perfil-pcd/${id}`)
      return r.data as PerfilPcd
    },
    enabled: !!token && !!id,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}
