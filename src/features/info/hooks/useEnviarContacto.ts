import { useMutation } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'

export interface ContactoFormData {
  email: string
  nombre: string
  asunto: string
  mensaje: string
}

interface ContactoResponse {
  id: string
  estado: string
}

/**
 * Envía el formulario de contacto al endpoint público POST /contacto.
 *
 * - `skipAuth: true` evita adjuntar un token residual en una página pública.
 * - `aceptoContacto: true` se marca implícito al enviar desde el formulario
 *   (la casilla de consentimiento es el propio acto de enviar el mensaje).
 */
export function useEnviarContacto() {
  const addToast = useUiStore(s => s.addToast)

  return useMutation<ContactoResponse, Error, ContactoFormData>({
    mutationFn: async (datos) => {
      const { data } = await api.post<ContactoResponse>(
        '/contacto',
        { ...datos, aceptoContacto: true },
        { skipAuth: true },
      )
      return data
    },
    onSuccess: () => {
      addToast('¡Mensaje enviado! Te responderemos en un máximo de 48 horas hábiles.', 'success')
    },
    onError: () => {
      addToast('No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos a contacto@raices.app', 'error')
    },
  })
}
