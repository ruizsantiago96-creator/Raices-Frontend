import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

/**
 * Mapea campos en español del response de la API a los campos en inglés
 * que el componente ReviewsTab espera.
 */
function mapReviewAdmin(r) {
  return {
    ...r,
    id: r.id ?? r._id,
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
  return useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => api.get('/administracion/resenas').then(r => {
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapReviewAdmin)
    }),
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/administracion/resenas/${id}`).then(r => r.data),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['admin', 'reviews'] })
      const previousReviews = qc.getQueryData(['admin', 'reviews'])
      qc.setQueryData(['admin', 'reviews'], (old = []) =>
        old.filter(r => String(r.id) !== String(id))
      )
      return { previousReviews }
    },
    onError: (err, id, context) => {
      if (context?.previousReviews) {
        qc.setQueryData(['admin', 'reviews'], context.previousReviews)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
    },
  })
}
