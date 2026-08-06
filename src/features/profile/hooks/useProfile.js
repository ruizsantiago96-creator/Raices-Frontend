import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth/store/authStore'
import { useUiStore } from '@shared/stores/uiStore'

export function useProfile() {
  const { token } = useAuthStore()
  const addToast = useUiStore(s => s.addToast)

  const query = useQuery({
    queryKey: ['perfil'],
    queryFn: () => api.get('/usuarios/perfil').then(r => r.data),
    enabled: !!token,
  })

  // Error handling con useEffect (v5 ya no soporta onError en useQuery)
  useEffect(() => {
    if (query.isError) {
      const message = query.error?.response?.data?.message
        || 'No se pudo cargar la información del perfil'
      addToast(message, 'error')
    }
  }, [query.isError, query.error, addToast])

  return query
}

export default useProfile

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.put('/usuarios/perfil', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['perfil'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['yo'] })
    },
  })
}

/**
 * Mapea los datos del onboarding (inglés) al formato del backend (español).
 * El backend espera campos en español para perfilNecesidades.
 */
function mapOnboardingToBackend(data) {
  return {
    tiposDiscapacidad: data.disability_types ?? [],
    severidadDiscapacidad: data.disability_severity || null,
    modosComunicacion: data.communication_modes ?? [],
    necesidadesMovilidad: data.mobility_needs ?? [],
    accesoTecnologia: data.tech_access ?? [],
    zonasPreferidas: data.preferred_zones ?? [],
    necesidades: data.needs ?? [],
    metasActuales: data.goals ?? [],
    areasApoyo: data.support_areas ? data.support_areas.split(',').map(s => s.trim()).filter(Boolean) : [],
    historialEducacion: data.education ? [data.education] : [],
    historialTerapia: data.therapies ? data.therapies.split(',').map(s => s.trim()) : [],
    etapaVida: data.stage || null,
    preocupacionesActuales: data.concerns || null,
    nivelApoyo: data.disability_severity || null,
    // Campos adicionales del onboarding
    edad: data.age ? Number(data.age) : null,
    experienciaLaboral: data.work || null,
    experienciaSocial: data.social || null,
    fechaNacimiento: data.birth_date || null,
  }
}

export function useSaveProfiling() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: (data) => {
      const backendData = mapOnboardingToBackend(data)
      const userId = user?.id
      if (userId) {
        if (data.birth_date) {
          localStorage.setItem(`raices_birth_date_${userId}`, data.birth_date)
        }
        if (data.age) {
          localStorage.setItem(`raices_age_${userId}`, data.age)
        }
      }
      return api.post('/usuarios/perfil-necesidades', backendData).then(r => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['perfil'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['yo'] })
    },
  })
}
