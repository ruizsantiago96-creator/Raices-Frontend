import { useMutation } from '@tanstack/react-query'
import api from '@shared/lib/api'

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
]

/**
 * Hook to upload multimedia (images/videos) via multipart/form-data.
 * POST /api/multimedia
 *
 * @returns {{ url: string }}
 */
export function useUploadMultimedia() {
  return useMutation({
    mutationFn: async (file) => {
      if (!file) throw new Error('No file provided')
      if (file.size > MAX_SIZE_BYTES) {
        throw new Error(`El archivo excede el límite de ${MAX_SIZE_BYTES / (1024 * 1024)} MB`)
      }
      if (ALLOWED_TYPES.length > 0 && !ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Tipo de archivo no soportado. Solo se permiten imágenes y videos.')
      }
      const formData = new FormData()
      formData.append('archivo', file)
      const { data } = await api.post('/multimedia', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data // { url: string }
    },
  })
}
