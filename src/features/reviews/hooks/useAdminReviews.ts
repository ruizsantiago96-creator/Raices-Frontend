import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import type { ReviewAdmin, RawBackendReviewAdmin } from '@/types/admin'

/**
 * Mapea campos en español del response de la API a los campos normalizados.
 */
function mapReviewAdmin(r: RawBackendReviewAdmin): ReviewAdmin {
  return {
    ...r,
    id: (r.id ?? r._id ?? '') as string | number,
    rating: r.calificacion ?? r.rating ?? 0,
    comment: r.comentario ?? r.comment ?? '',
    institution_name: r.nombreInstitucion ?? r.institucionNombre ?? r.institution_name ?? r.institucion?.nombre,
    user_name: r.nombreUsuario ?? r.usuarioNombre ?? r.user_name ?? r.usuario?.nombre,
    created_at: r.fechaCreacion ?? r.created_at ?? r.createdAt,
  }
}

/**
 * Hook para listar todas las reseñas (panel admin).
 * GET /api/administracion/resenas
 */
export function useAdminReviews() {
  return useQuery<ReviewAdmin[]>({
    queryKey: ['admin', 'reviews'],
    queryFn: () => api.get('/administracion/resenas').then(r => {
      const res = r.data
      const data: RawBackendReviewAdmin[] = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapReviewAdmin)
    }),
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => api.delete(`/administracion/resenas/${id}`).then(r => r.data),
    onMutate: async (id: string | number) => {
      await qc.cancelQueries({ queryKey: ['admin', 'reviews'] })
      const previousReviews = qc.getQueryData<ReviewAdmin[]>(['admin', 'reviews'])
      qc.setQueryData<ReviewAdmin[]>(['admin', 'reviews'], (old = []) =>
        old.filter(r => String(r.id) !== String(id))
      )
      return { previousReviews }
    },
    onError: (_err, _id, context) => {
      if (context?.previousReviews) {
        qc.setQueryData(['admin', 'reviews'], context.previousReviews)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
    },
  })
}
