import { useQuery } from '@tanstack/react-query'
import api from '@shared/lib/api'

const DEFAULT_CATALOGOS = {
  categoriasInstitucion: [
    { value: 'funcional', label: 'Salud y Terapia' },
    { value: 'educativo', label: 'Educación' },
    { value: 'laboral', label: 'Empleo' },
    { value: 'social', label: 'Comunidad y Recreación' }
  ],
  parentescos: ['Hijo/a', 'Hermano/a', 'Nieto/a', 'Sobrino/a', 'Cónyuge', 'Tutor legal', 'Otro familiar'],
  tiposDiscapacidad: [
    { id: 'motriz', value: 'motriz', label: 'Motriz' },
    { id: 'visual', value: 'visual', label: 'Visual' },
    { id: 'auditiva', value: 'auditiva', label: 'Auditiva' },
    { id: 'intelectual', value: 'intelectual', label: 'Intelectual' },
    { id: 'psicosocial', value: 'psicosocial', label: 'Psicosocial' },
    { id: 'tea', value: 'tea', label: 'TEA / Autismo' },
    { id: 'down', value: 'down', label: 'Síndrome de Down' },
    { id: 'lenguaje', value: 'lenguaje', label: 'Lenguaje' },
    { id: 'multiple', value: 'multiple', label: 'Múltiple' },
    { id: 'otra', value: 'otra', label: 'Otra' }
  ],
  etapasVida: [
    { id: 'infancia', label: 'Infancia (0-12)' },
    { id: 'adolescencia', label: 'Adolescencia (13-17)' },
    { id: 'adulto_joven', label: 'Adulto joven (18-29)' },
    { id: 'adulto', label: 'Adulto (30-59)' },
    { id: 'mayor', label: 'Adulto mayor (60+)' }
  ],
  features: [
    { id: 'favoritos', label: 'Favoritos', description: 'Guardar instituciones favoritas' },
    { id: 'comunidad', label: 'Comunidad', description: 'Participar en foros y grupos' },
    { id: 'mensajes', label: 'Mensajes', description: 'Enviar mensajes directos' },
    { id: 'empleos', label: 'Empleos', description: 'Buscar vacantes de empleo' }
  ]
}

/**
 * Hook: consulta todos los catálogos del backend.
 *
 * Devuelve un objeto con todas las listas de opciones que el frontend necesita
 * para formularios, filtros, etc. Los catálogos se cachean por 24 horas ya que
 * son datos que cambian muy raramente.
 */
export function useCatalogos() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['catalogos'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/catalogos')
        return data
      } catch (err) {
        console.warn('Backend /catalogos returned error, using local fallback:', err)
        return DEFAULT_CATALOGOS
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 horas - los catálogos cambian poco
    retry: 2,
  })

  return {
    data: data ?? DEFAULT_CATALOGOS,
    isLoading,
    isError,
    error,
  }
}

