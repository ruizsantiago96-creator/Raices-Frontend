import api from '@shared/lib/api'

/**
 * Fetcher: obtiene la lista de dependientes del usuario autenticado.
 *
 * Usa la instancia Axios preconfigurada (con interceptor de token y refresh).
 * Propaga el error para que React Query pueda manejar isError.
 *
 * @returns {Promise<Array>} Lista de dependientes
 */
export async function getDependientes() {
  try {
    const { data } = await api.get('/usuarios/dependientes')
    return data
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Fetcher: obtiene el conteo de dependientes y límite restante.
 * GET /api/usuarios/dependientes/count
 *
 * @returns {Promise<{total: number, limite: number, restantes: number}>}
 */
export async function getDependientesCount() {
  try {
    const { data } = await api.get('/usuarios/dependientes/count')
    return data
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Fetcher: lista consolidada y paginada de dependientes planos y cuentas PCD vinculadas.
 * GET /api/usuarios/mis-personas
 *
 * @param {Object} params - Parámetros de consulta
 * @param {number} [params.pagina=1] - Número de página
 * @param {number} [params.limite=20] - Elementos por página
 * @param {string} [params.ordenarPor=fechaCreacion] - Campo para ordenar
 * @param {string} [params.direccion=desc] - Dirección del ordenamiento
 * @param {string} [params.buscar] - Búsqueda por texto
 * @returns {Promise<{datos: Array, total: number, pagina: number, limite: number, totalPaginas: number}>}
 */
export async function getMisPersonas(params = {}) {
  try {
    const { data } = await api.get('/usuarios/mis-personas', { params })
    return data
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Fetcher: crea un nuevo dependiente para el usuario autenticado.
 *
 * @param {Object} payload - Datos del dependiente (nombreCompleto, parentesco, etc.)
 * @returns {Promise<Object>} Dependiente creado
 */
export async function createDependiente(payload) {
  try {
    const { data } = await api.post('/usuarios/dependientes', payload)
    return data
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Fetcher: actualiza las features de un dependiente (PATCH).
 * PATCH /api/usuarios/dependientes/:dependienteId/features
 *
 * @param {string} dependienteId - ID del dependiente
 * @param {Object} features - Mapa parcial de features { chat: true, postulaciones: false, ... }
 * @returns {Promise<Object>} { id, features }
 */
export async function updateDependentFeaturesPatch(dependienteId, features) {
  try {
    const { data } = await api.patch(`/usuarios/dependientes/${dependienteId}/features`, features)
    return data
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Fetcher: actualiza las features de una cuenta PCD vinculada (PATCH).
 * PATCH /api/usuarios/vincular-pcd/:pcdId/features
 *
 * @param {string} pcdId - ID de la cuenta PCD vinculada
 * @param {Object} features - Mapa parcial de features { chat: true, postulaciones: false, ... }
 * @returns {Promise<Object>} { id, features }
 */
export async function updatePCDLinkedFeaturesPatch(pcdId, features) {
  try {
    const { data } = await api.patch(`/usuarios/vincular-pcd/${pcdId}/features`, features)
    return data
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Fetcher: desvincula una cuenta PCD del tutor.
 * DELETE /api/usuarios/pcd-vinculado/:pcdUserId/desvincular
 *
 * @param {string} pcdUserId - ID de la cuenta PCD a desvincular
 * @returns {Promise<{desvinculado: boolean, pcdUserId: string, tutorId: string}>}
 */
export async function unlinkPCD(pcdUserId) {
  try {
    const { data } = await api.delete(`/usuarios/pcd-vinculado/${pcdUserId}/desvincular`)
    return data
  } catch (error) {
    throw error.response?.data || error
  }
}
