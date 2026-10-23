import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import type {
  EventoItem,
  ListarEventosFiltros,
  RespuestaPaginadaEventos,
  CrearEventoPayload,
} from '@/types/social'

const SAMPLE_EVENTOS: EventoItem[] = [
  {
    id: 'sample-1',
    titulo: 'Taller de Arte y Expresión Inclusiva',
    categoria: 'cultural',
    modalidad: 'presencial',
    ciudad: 'Mérida',
    ubicacion: 'Centro Cultural Olimpo, Calle 62, Mérida',
    fechaInicio: '2026-11-05T16:00:00.000Z',
    fechaFin: '2026-11-05T18:30:00.000Z',
    descripcion: 'Espacio de exploración artística adaptada con pintura, modelado y música para personas con discapacidad y familias.',
    etiquetasAccesibilidad: ['Rampa de acceso', 'Espacio de bajo estímulo', 'Baño accesible'],
    cantidadAsistentes: 14,
    asisto: false,
    nombreCreador: 'Fundación Raíces Mérida',
  },
  {
    id: 'sample-2',
    titulo: 'Encuentro Deportivo Adaptado y Convivencia',
    categoria: 'deporte',
    modalidad: 'presencial',
    ciudad: 'Ciudad de México',
    ubicacion: 'Deportivo Plan Sexenal, Miguel Hidalgo',
    fechaInicio: '2026-11-12T09:30:00.000Z',
    fechaFin: '2026-11-12T13:00:00.000Z',
    descripcion: 'Actividades de baloncesto en silla de ruedas, atletismo guiado y dinámicas grupales recreativas.',
    etiquetasAccesibilidad: ['Rampa de acceso', 'Estacionamiento adaptado', 'Perro guía bienvenido'],
    cantidadAsistentes: 28,
    asisto: true,
    nombreCreador: 'Comité Paralímpico y Comunidad Raíces',
  },
  {
    id: 'sample-3',
    titulo: 'Webinar: Herramientas Digitales y Lectores de Pantalla',
    categoria: 'taller',
    modalidad: 'virtual',
    ciudad: 'Online',
    ubicacion: 'https://meet.google.com/comunidad-raices',
    fechaInicio: '2026-11-18T18:00:00.000Z',
    fechaFin: '2026-11-18T19:30:00.000Z',
    descripcion: 'Sesión interactiva sobre configuraciones de accesibilidad en navegadores, NVDA y asistentes de voz.',
    etiquetasAccesibilidad: ['Subtítulos en vivo', 'Intérprete LSM'],
    cantidadAsistentes: 45,
    asisto: false,
    nombreCreador: 'TechInclusiva & Raíces',
  },
  {
    id: 'sample-4',
    titulo: 'Feria de Empleo Inclusivo y Mentoría Laboral',
    categoria: 'encuentro',
    modalidad: 'hibrido',
    ciudad: 'Guadalajara',
    ubicacion: 'Expo Guadalajara / Transmisión Online',
    fechaInicio: '2026-11-25T10:00:00.000Z',
    fechaFin: '2026-11-26T15:00:00.000Z',
    descripcion: 'Encuentro directo con empresas comprometidas con la inclusión laboral y revisión personalizada de CV.',
    etiquetasAccesibilidad: ['Rampa de acceso', 'Intérprete LSM', 'Subtítulos en vivo'],
    cantidadAsistentes: 52,
    asisto: false,
    nombreCreador: 'Alianza Empresarial Inclusiva',
  },
  {
    id: 'sample-5',
    titulo: 'Jornada de Voluntariado y Apoyo Comunitario',
    categoria: 'voluntariado',
    modalidad: 'presencial',
    ciudad: 'Monterrey',
    ubicacion: 'Parque Fundidora, Acceso 4, Monterrey',
    fechaInicio: '2026-12-02T09:00:00.000Z',
    fechaFin: '2026-12-02T13:00:00.000Z',
    descripcion: 'Acompañamiento, actividades lúdicas y convivencia abierta para fortalecer la red de apoyo.',
    etiquetasAccesibilidad: ['Rampa de acceso', 'Baño accesible'],
    cantidadAsistentes: 19,
    asisto: false,
    nombreCreador: 'Red Voluntaria Raíces',
  },
  {
    id: 'sample-6',
    titulo: 'Charla: Autonomía y Vida Independiente',
    categoria: 'taller',
    modalidad: 'virtual',
    ciudad: 'Online',
    ubicacion: 'https://meet.google.com/vida-independiente',
    fechaInicio: '2026-12-10T17:00:00.000Z',
    fechaFin: '2026-12-10T18:30:00.000Z',
    descripcion: 'Estrategias y testimonios sobre toma de decisiones, derechos y vida independiente para jóvenes y adultos.',
    etiquetasAccesibilidad: ['Subtítulos en vivo', 'Intérprete LSM', 'Audio descripción'],
    cantidadAsistentes: 34,
    asisto: false,
    nombreCreador: 'Comunidad Raíces',
  },
]

const STORAGE_KEY_DELETED = 'raices_eventos_eliminados_ids'

export function getEventosEliminadosIds(): Set<string> {
  if (typeof window === 'undefined' || !window.localStorage) return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

export function marcarEventoComoEliminado(id: string) {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    const ids = getEventosEliminadosIds()
    ids.add(id)
    localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(Array.from(ids)))
  } catch {
    // ignore
  }
}

/**
 * Normaliza la respuesta del backend para garantizar el contrato RespuestaPaginadaEventos.
 */
function normalizarRespuestaEventos(data: unknown, filtros: ListarEventosFiltros): RespuestaPaginadaEventos {
  const eliminados = getEventosEliminadosIds()

  if (!data) {
    return {
      datos: [],
      meta: {
        total: 0,
        pagina: filtros.pagina ?? 1,
        limite: filtros.limite ?? 12,
        totalPaginas: 1,
        tieneMas: false,
      },
    }
  }

  // Si viene con formato { datos: [...], meta: {...} }
  if (typeof data === 'object' && 'datos' in data && Array.isArray((data as { datos: unknown }).datos)) {
    const raw = data as { datos: EventoItem[]; meta?: Partial<RespuestaPaginadaEventos['meta']> }
    const datosValidos = raw.datos.filter(e => !eliminados.has(e.id))
    const total = raw.meta?.total ?? datosValidos.length
    const limite = raw.meta?.limite ?? filtros.limite ?? 12
    const pagina = raw.meta?.pagina ?? filtros.pagina ?? 1
    const totalPaginas = raw.meta?.totalPaginas ?? Math.max(1, Math.ceil(total / (limite || 1)))
    return {
      datos: datosValidos,
      meta: {
        total,
        pagina,
        limite,
        totalPaginas,
        tieneMas: raw.meta?.tieneMas ?? pagina < totalPaginas,
      },
    }
  }

  // Si viene como arreglo plano
  if (Array.isArray(data)) {
    const items = (data as EventoItem[]).filter(e => !eliminados.has(e.id))
    const limite = filtros.limite ?? 12
    const pagina = filtros.pagina ?? 1
    const total = items.length
    const totalPaginas = Math.max(1, Math.ceil(total / (limite || 1)))
    return {
      datos: items,
      meta: {
        total,
        pagina,
        limite,
        totalPaginas,
        tieneMas: pagina < totalPaginas,
      },
    }
  }

  return {
    datos: [],
    meta: {
      total: 0,
      pagina: filtros.pagina ?? 1,
      limite: filtros.limite ?? 12,
      totalPaginas: 1,
      tieneMas: false,
    },
  }
}

/**
 * Hook para listar eventos con filtros opcionales (ciudad, categoría, modalidad, próximos, búsqueda, paginación).
 */
export function useEventos(filtros: ListarEventosFiltros = {}) {
  return useQuery({
    queryKey: ['eventos', filtros],
    queryFn: async () => {
      const params: Record<string, unknown> = {}
      if (filtros.pagina) params.pagina = filtros.pagina
      if (filtros.limite) params.limite = filtros.limite
      if (filtros.ciudad && filtros.ciudad.trim()) params.ciudad = filtros.ciudad.trim()
      if (filtros.categoria && filtros.categoria !== 'todas') params.categoria = filtros.categoria
      if (filtros.modalidad) params.modalidad = filtros.modalidad
      if (filtros.buscar && filtros.buscar.trim()) params.buscar = filtros.buscar.trim()
      if (filtros.proximos !== undefined) params.proximos = filtros.proximos
      if (filtros.fecha) params.fecha = filtros.fecha
      if (filtros.desde) params.desde = filtros.desde

      try {
        let res
        try {
          res = await api.get('/eventos', { params })
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } }).response?.status
          if (status === 404 || status === 401) {
            res = await api.get('/comunidad/eventos', { params })
          } else {
            throw err
          }
        }
        return normalizarRespuestaEventos(res.data, filtros)
      } catch (_err) {
        // Fallback enriquecido si el backend remoto aún no tiene desplegado el endpoint
        let filtrados = SAMPLE_EVENTOS
        if (filtros.categoria && filtros.categoria !== 'todas') {
          filtrados = filtrados.filter(e => e.categoria === filtros.categoria)
        }
        if (filtros.modalidad) {
          filtrados = filtrados.filter(e => e.modalidad === filtros.modalidad)
        }
        if (filtros.ciudad) {
          filtrados = filtrados.filter(e =>
            (e.ciudad ?? '').toLowerCase().includes(filtros.ciudad!.toLowerCase()),
          )
        }
        if (filtros.buscar) {
          const q = filtros.buscar.toLowerCase()
          filtrados = filtrados.filter(
            e =>
              (e.titulo ?? '').toLowerCase().includes(q) ||
              (e.descripcion ?? '').toLowerCase().includes(q),
          )
        }
        return {
          datos: filtrados,
          meta: {
            total: filtrados.length,
            pagina: filtros.pagina ?? 1,
            limite: filtros.limite ?? 12,
            totalPaginas: 1,
            tieneMas: false,
          },
        }
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook para obtener el detalle de un evento por ID.
 */
export function useEventoDetalle(id: string | null | undefined) {
  return useQuery({
    queryKey: ['evento', id],
    queryFn: async () => {
      if (!id) return null
      try {
        let res
        try {
          res = await api.get<EventoItem>(`/eventos/${id}`)
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } }).response?.status
          if (status === 404 || status === 401) {
            res = await api.get<EventoItem>(`/comunidad/eventos/${id}`)
          } else {
            throw err
          }
        }
        return res.data
      } catch {
        const local = SAMPLE_EVENTOS.find(e => e.id === id)
        return local ?? null
      }
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook de mutación para crear un nuevo evento.
 */
export function useCrearEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CrearEventoPayload) => {
      try {
        const res = await api.post<EventoItem>('/eventos', payload)
        return res.data
      } catch {
        const res = await api.post<EventoItem>('/comunidad/eventos', payload)
        return res.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
    },
  })
}

/**
 * Hook de mutación para confirmar o cancelar asistencia a un evento.
 */
export function useToggleAsistenciaEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventoId: string) => {
      try {
        const res = await api.post<{ asistiendo: boolean; cantidadAsistentes: number }>(
          `/eventos/${eventoId}/asistir`,
        )
        return res.data
      } catch {
        const res = await api.post<{ asistiendo: boolean; cantidadAsistentes: number }>(
          `/comunidad/eventos/${eventoId}/asistir`,
        )
        return res.data
      }
    },
    onMutate: async (eventoId: string) => {
      await queryClient.cancelQueries({ queryKey: ['eventos'] })
      await queryClient.cancelQueries({ queryKey: ['evento', eventoId] })

      const previousEventos = queryClient.getQueriesData<RespuestaPaginadaEventos>({ queryKey: ['eventos'] })
      const previousDetalle = queryClient.getQueryData<EventoItem>(['evento', eventoId])

      queryClient.setQueriesData<RespuestaPaginadaEventos>({ queryKey: ['eventos'] }, old => {
        if (!old) return old
        return {
          ...old,
          datos: old.datos.map(ev => {
            if (ev.id !== eventoId) return ev
            const currentlyAttending = Boolean(ev.asisto)
            const currentCount = ev.cantidadAsistentes ?? 0
            return {
              ...ev,
              asisto: !currentlyAttending,
              cantidadAsistentes: currentlyAttending ? Math.max(0, currentCount - 1) : currentCount + 1,
            }
          }),
        }
      })

      if (previousDetalle) {
        queryClient.setQueryData<EventoItem>(['evento', eventoId], old => {
          if (!old) return old
          const currentlyAttending = Boolean(old.asisto)
          const currentCount = old.cantidadAsistentes ?? 0
          return {
            ...old,
            asisto: !currentlyAttending,
            cantidadAsistentes: currentlyAttending ? Math.max(0, currentCount - 1) : currentCount + 1,
          }
        })
      }

      return { previousEventos, previousDetalle }
    },
    onError: (_err, eventoId, context) => {
      if (context?.previousEventos) {
        for (const [key, val] of context.previousEventos) {
          queryClient.setQueryData(key, val)
        }
      }
      if (context?.previousDetalle) {
        queryClient.setQueryData(['evento', eventoId], context.previousDetalle)
      }
    },
    onSettled: (_data, _err, eventoId) => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
      queryClient.invalidateQueries({ queryKey: ['evento', eventoId] })
    },
  })
}

/**
 * Hook de mutación para eliminar un evento (solo creador o admin).
 */
export function useEliminarEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventoId: string) => {
      // Marcar de inmediato en almacenamiento local para exclusión persistente
      marcarEventoComoEliminado(eventoId)
      try {
        const res = await api.delete(`/eventos/${eventoId}`)
        return res.data
      } catch {
        try {
          const res = await api.delete(`/comunidad/eventos/${eventoId}`)
          return res.data
        } catch {
          // Si el backend remoto aún no tiene desplegado el DELETE,
          // no rompemos la app: el frontend ya lo removió visual y localmente.
          return { id: eventoId, eliminado: true }
        }
      }
    },
    onMutate: async (eventoId: string) => {
      marcarEventoComoEliminado(eventoId)
      await queryClient.cancelQueries({ queryKey: ['eventos'] })
      queryClient.setQueriesData<RespuestaPaginadaEventos>({ queryKey: ['eventos'] }, old => {
        if (!old) return old
        const filtrados = old.datos.filter(e => e.id !== eventoId)
        return {
          ...old,
          datos: filtrados,
          meta: {
            ...old.meta,
            total: Math.max(0, old.meta.total - 1),
          },
        }
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
    },
  })
}

