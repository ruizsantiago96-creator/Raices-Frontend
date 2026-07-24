import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

/**
 * @typedef {Object} FiltrosInstituciones
 * @property {string} [busqueda]  - Búsqueda por nombre, descripción o ciudad
 * @property {string} [ciudad]    - Búsqueda parcial por ciudad
 * @property {string} [categoria] - Categoría: 'funcional', 'educativo', 'laboral', 'social'
 * @property {string} [tipoDiscapacidad] - Tipo de discapacidad: 'tea', 'motriz', 'visual', etc.
 * @property {number|string} [edad] - Edad del usuario para filtrar
 */

/**
 * Limpia un objeto de filtros eliminando claves con valores vacíos, null o undefined.
 * @param {FiltrosInstituciones} filtros
 * @returns {Record<string, string|number>} Filtros limpios para enviar como query params
 */
function limpiarFiltros(filtros) {
  const cleaned = {}
  for (const [key, value] of Object.entries(filtros)) {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value
    }
  }
  return cleaned
}

/**
 * Mapea los campos en español del response de la API a los campos en inglés
 * que el frontend espera (name, description, category, city, etc.).
 * @param {Object} inst - Objeto institución crudo de la API
 * @returns {Object} Institución con campos normalizados en inglés
 */
function mapInstitucion(inst) {
  return {
    ...inst,
    name: inst.name ?? inst.nombre,
    description: inst.description ?? inst.descripcion,
    category: inst.category ?? inst.categoria,
    city: inst.city ?? inst.ciudad,
    state: inst.state ?? inst.estado,
    address: inst.address ?? inst.direccion,
    phone: inst.phone ?? inst.telefono,
    website: inst.website ?? inst.sitioWeb,
  }
}

/**
 * Hook para listar instituciones con filtros opcionales.
 * GET /api/instituciones
 * @param {FiltrosInstituciones} filtros
 */
export function useInstitutions(filtros = {}) {
  const params = limpiarFiltros(filtros)
  return useQuery({
    queryKey: ['institutions', params],
    queryFn: async () => {
      const r = await api.get('/instituciones', { params })
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapInstitucion)
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

/**
 * @typedef {Object} Institucion
 * @property {string} id - ID único de la institución
 * @property {string} name - Nombre de la institución
 * @property {string} [description] - Descripción de la institución
 * @property {string} [category] - Categoría: 'funcional', 'educativo', 'laboral', 'social'
 * @property {string} [city] - Ciudad de la institución
 * @property {string} [state] - Estado de la institución
 * @property {string} [address] - Dirección de la institución
 * @property {string} [phone] - Teléfono de contacto
 * @property {string} [email] - Correo electrónico de contacto
 * @property {string} [website] - Sitio web de la institución
 * @property {string[]} [disability_types] - Tipos de discapacidad que atiende
 * @property {number} [lat] - Latitud
 * @property {number} [lng] - Longitud
 * @property {number} [rating_avg] - Calificación promedio
 * @property {number} [rating_count] - Cantidad de reseñas
 * @property {string} [plan_type] - Tipo de plan (ej. 'premium')
 * @property {boolean} [is_verified] - Si la institución está verificada
 * @property {string} [created_at] - Fecha de creación (ISO)
 */

/**
 * Hook para obtener el detalle de una institución por su ID.
 * GET /api/instituciones/:id
 * @param {string} id - ID único de la institución a consultar
 * @returns {{ data: Institucion | undefined, isLoading: boolean, error: Error | null }}
 */
export function useInstitution(id) {
  return useQuery({
    queryKey: ['institution', id],
    queryFn: () => api.get(`/instituciones/${id}`).then(r => {
      const inst = r.data?.datos ?? r.data
      return mapInstitucion(inst)
    }),
    enabled: !!id,
  })
}

/**
 * @typedef {Object} DatosInstitucion
 * @property {string} nombre - Nombre de la institución
 * @property {string} [descripcion] - Descripción de la institución
 * @property {string} [categoria] - Categoría: 'funcional', 'educativo', 'laboral', 'social'
 * @property {string} [ciudad] - Ciudad de la institución
 * @property {string} [estado] - Estado de la institución
 * @property {string} [direccion] - Dirección de la institución
 * @property {string} [telefono] - Teléfono de contacto
 * @property {string} [email] - Correo electrónico de contacto
 * @property {string} [sitioWeb] - Sitio web de la institución
 * @property {string[]} [tiposDiscapacidad] - Tipos de discapacidad que atiende
 * @property {Object} [coordenadas] - Coordenadas geográficas
 * @property {number} [coordenadas.lat] - Latitud
 * @property {number} [coordenadas.lng] - Longitud
 */

/**
 * @typedef {Object} RespuestaCrearInstitucion
 * @property {string} id - ID de la institución creada
 * @property {string[]} tiposDiscapacidad - Tipos de discapacidad
 * @property {string} creadoPor - UID del usuario que la creó
 * @property {boolean} activa - Si la institución está activa
 * @property {boolean} verificada - Si la institución está verificada
 * @property {string} fechaCreacion - Fecha de creación (ISO)
 */

/**
 * Hook para crear una nueva institución.
 * POST /api/instituciones
 */
export function useCrearInstitucion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datosInstitucion) => api.post('/instituciones', datosInstitucion).then(r => r.data?.datos ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institutions'] })
    },
  })
}

export function useDiscovery() {
  return useQuery({
    queryKey: ['discovery'],
    queryFn: () => api.get('/discovery').then(r => r.data),
  })
}
