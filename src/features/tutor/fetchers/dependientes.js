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
