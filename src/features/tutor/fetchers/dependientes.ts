import api from '@shared/lib/api'
import type { CrearDependientePayload, Dependiente, DependientesCountResponse, DependentFeatures, MisPersonasResponse } from '@/types/tutor'

function extractError(error: unknown): unknown {
  const err = error as { response?: { data?: unknown } }
  return err?.response?.data || error
}

/**
 * Fetcher: obtiene la lista de dependientes del usuario autenticado.
 */
export async function getDependientes(): Promise<Dependiente[]> {
  try {
    const { data } = await api.get('/usuarios/dependientes')
    return data
  } catch (error) {
    throw extractError(error)
  }
}

/**
 * Fetcher: obtiene el conteo de dependientes y límite restante.
 */
export async function getDependientesCount(): Promise<DependientesCountResponse> {
  try {
    const { data } = await api.get('/usuarios/dependientes/count')
    return data
  } catch (error) {
    throw extractError(error)
  }
}

/**
 * Fetcher: lista consolidada y paginada de dependientes planos y cuentas PCD vinculadas.
 */
export async function getMisPersonas(params: Record<string, unknown> = {}): Promise<MisPersonasResponse> {
  try {
    const { data } = await api.get('/usuarios/mis-personas', { params })
    return data
  } catch (error) {
    throw extractError(error)
  }
}

/**
 * Fetcher: crea un nuevo dependiente para el usuario autenticado.
 */
export async function createDependiente(payload: CrearDependientePayload | Record<string, unknown>): Promise<Dependiente> {
  try {
    const { data } = await api.post('/usuarios/dependientes', payload)
    return data
  } catch (error) {
    throw extractError(error)
  }
}

/**
 * Fetcher: actualiza las features de un dependiente (PATCH).
 */
export async function updateDependentFeaturesPatch(
  dependienteId: string | number,
  features: DependentFeatures
): Promise<{ id: string | number; features: DependentFeatures }> {
  try {
    const { data } = await api.patch(`/usuarios/dependientes/${dependienteId}/features`, features)
    return data
  } catch (error) {
    throw extractError(error)
  }
}

/**
 * Fetcher: actualiza las features de una cuenta PCD vinculada (PATCH).
 */
export async function updatePCDLinkedFeaturesPatch(
  pcdId: string | number,
  features: DependentFeatures
): Promise<{ id: string | number; features: DependentFeatures }> {
  try {
    const { data } = await api.patch(`/usuarios/vincular-pcd/${pcdId}/features`, features)
    return data
  } catch (error) {
    throw extractError(error)
  }
}

/**
 * Fetcher: desvincula una cuenta PCD del tutor.
 */
export async function unlinkPCD(
  pcdUserId: string | number
): Promise<{ desvinculado: boolean; pcdUserId: string | number; tutorId: string | number }> {
  try {
    const { data } = await api.delete(`/usuarios/pcd-vinculado/${pcdUserId}/desvincular`)
    return data
  } catch (error) {
    throw extractError(error)
  }
}
