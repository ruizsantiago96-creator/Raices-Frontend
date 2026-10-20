import { useState, useRef, useEffect, type FormEvent, type ChangeEvent, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useRutas,
  useRutasSummary,
  useGenerarRutaPersonalizada,
  useUpdateRuta,
  useDeleteRuta,
  useRutaDetail,
  useAddPaso,
  useCompletarPaso,
  useDescompletarPaso,
  useMiRuta,
  useCreateRuta,
} from '../hooks/useRutas'
import api from '@shared/lib/api'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore, useProfile } from '@features/auth'
import { Icons, RestrictedBlock, FriendlyIcons } from '@shared/components/shared'
import { CustomSelect } from '@shared/components/CustomSelect'
import { useOnboardingStatus } from '@features/institutions/hooks/useRecommendations'
import { hasValidScales, getStoredScales } from '@features/profile/components/EscalasVidaSection'
import type {
  PasoRuta,
  RutaPrioridad,
  RutaEstado,
  RutaDesarrollo,
} from '@/types/rutas'

const PRIORITY_COLORS: Record<string, { bg: string; fg: string }> = {
  baja: { bg: 'rgba(75, 163, 163, 0.15)', fg: '#4BA3A3' },
  media: { bg: 'rgba(212, 148, 76, 0.15)', fg: '#D4944C' },
  alta: { bg: 'rgba(220, 53, 69, 0.15)', fg: '#DC3545' },
}

const STATUS_LABELS: Record<string, string> = {
  activa: 'Activa',
  completada: 'Completada',
  pausada: 'Pausada',
  cancelada: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  activa: '#01ADFF',
  completada: '#10B981',
  pausada: '#D4944C',
  cancelada: '#94A3B8',
}

interface AreaItem {
  id: string
  label: string
}

export interface GuiaAccion {
  tipo: 'instituciones' | 'empleo' | 'comunidad' | 'perfil' | 'asistente' | 'casa' | 'otro'
  etiqueta: string
  destino: string
  icono: string
  ayuda: string
}

/**
 * Genera actividades sugeridas cuando un camino tiene 0 actividades (0/0),
 * desglosando la meta del usuario en pasos reales que combinan el uso de la plataforma
 * con preparación y hábitos para realizar en el hogar.
 */
export function obtenerPasosSugeridosParaRuta(ruta: { nombre: string; metaFinal?: string; areaInteres?: string }) {
  const nombre = (ruta.nombre || '').toLowerCase()
  const meta = (ruta.metaFinal || '').toLowerCase()
  const esTerapiaSalud = nombre.includes('terapia') || meta.includes('terapia') || ruta.areaInteres === 'salud'

  if (esTerapiaSalud) {
    return [
      {
        titulo: 'Consultar directorio de instituciones y especialistas verificados',
        descripcion: 'Explora en Raíces las clínicas, centros y profesionales disponibles en tu zona para contactarlos por tu cuenta si decides acudir.',
        tipo: 'institucion',
      },
      {
        titulo: 'Anotar dudas y recordatorios personales en tu perfil',
        descripcion: 'Guarda en tu perfil tus propias notas, preguntas o fechas clave para cuando consultes con especialistas de salud.',
        tipo: 'perfil',
      },
      {
        titulo: 'Explorar o iniciar conversaciones en Conectemos',
        descripcion: 'Conoce experiencias de otros usuarios y familias en la comunidad, o comparte tus propias vivencias si lo deseas.',
        tipo: 'comunidad',
      },
      {
        titulo: 'Registrar tus avances y fechas en Mi Camino',
        descripcion: 'Marca tus fechas cumplidas en la plataforma para llevar tu propio control personal de metas.',
        tipo: 'perfil',
      },
    ]
  }

  // Empleo
  if (ruta.areaInteres === 'empleo' || nombre.includes('empleo') || nombre.includes('trabajo') || meta.includes('trabajo')) {
    return [
      {
        titulo: 'Revisar tu perfil y apoyos laborales en casa',
        descripcion: 'Actualiza tus preferencias y requerimientos de accesibilidad para que las empresas conozcan tus fortalezas.',
        tipo: 'perfil',
      },
      {
        titulo: 'Explorar vacantes inclusivas en la bolsa de empleo',
        descripcion: 'Revisa las ofertas de trabajo adaptadas a tu perfil disponibles en la plataforma.',
        tipo: 'vacante',
      },
      {
        titulo: 'Preparar tu entrevista y preguntas desde casa',
        descripcion: 'Practica en casa cómo describir tus habilidades y los apoyos o adaptaciones que requieres en el puesto.',
        tipo: 'casa',
      },
      {
        titulo: 'Postularte a tu primera oportunidad',
        descripcion: 'Envía tu postulación a una vacante que se adapte a tus metas.',
        tipo: 'empleo',
      },
    ]
  }

  // Comunidad / Genérico
  return [
    {
      titulo: 'Explorar recursos y servicios de apoyo en la plataforma',
      descripcion: 'Revisa las instituciones y servicios verificados que pueden orientarte en esta meta.',
      tipo: 'institucion',
    },
    {
      titulo: 'Establecer una rutina diaria en casa para tu meta',
      descripcion: 'Dedica 15 a 20 minutos al día en casa a actividades que te acerquen a tu objetivo.',
      tipo: 'casa',
    },
    {
      titulo: 'Compartir dudas o buscar experiencias en Conectemos',
      descripcion: 'Publica en la comunidad para conocer cómo otras personas alcanzaron metas similares.',
      tipo: 'comunidad',
    },
    {
      titulo: 'Registrar tu progreso semanal en tu perfil',
      descripcion: 'Actualiza tu perfil y anota tus logros para mantener la motivación.',
      tipo: 'perfil',
    },
  ]
}

/**
 * Resuelve la guía en el sistema para una actividad según su contenido, tipo y categoría.
 * Permite que los usuarios PCD sepan con certeza qué acción realizar y cómo completarla.
 */
export function resolverGuiaActividad(paso: PasoRuta, areaInteres?: string): GuiaAccion {
  const texto = `${paso.titulo} ${paso.descripcion || ''}`.toLowerCase()
  const tipo = String(paso.tipo || '').toLowerCase()
  const categoria = String(paso.categoria || '').toLowerCase()

  // 1. Notas, recordatorios y preparación personal
  if (
    tipo === 'casa' ||
    tipo === 'notas' ||
    texto.includes('en casa') ||
    texto.includes('hogar') ||
    texto.includes('notas') ||
    texto.includes('apuntes') ||
    texto.includes('preguntas') ||
    texto.includes('dudas')
  ) {
    return {
      tipo: 'perfil',
      etiqueta: 'Revisar notas en mi perfil',
      destino: '/profile',
      icono: 'fileText',
      ayuda: 'Te guiaremos a tu perfil para guardar o consultar tus notas y recordatorios personales.',
    }
  }

  // 2. Empleo / vacantes / oportunidades laborales
  if (
    tipo === 'vacante' ||
    tipo === 'empleo' ||
    categoria === 'empleo' ||
    texto.includes('empleo') ||
    texto.includes('vacante') ||
    texto.includes('laboral') ||
    texto.includes('postula') ||
    texto.includes('cv') ||
    texto.includes('currículum') ||
    texto.includes('trabajo')
  ) {
    return {
      tipo: 'empleo',
      etiqueta: 'Explorar Oportunidades laborales',
      destino: '/jobs',
      icono: 'briefcase',
      ayuda: 'Te guiaremos a la bolsa de trabajo inclusiva con vacantes y empresas adaptadas.',
    }
  }

  // 3. Instituciones / centros / especialistas / rehabilitación / terapias
  if (
    tipo === 'institucion' ||
    tipo === 'servicio' ||
    categoria === 'salud' ||
    categoria === 'educacion' ||
    paso.institucionId ||
    texto.includes('instituci') ||
    texto.includes('especialista') ||
    texto.includes('terapia') ||
    texto.includes('centro') ||
    texto.includes('médic') ||
    texto.includes('rehabilitaci') ||
    texto.includes('clínic') ||
    texto.includes('atención') ||
    texto.includes('apoyo local')
  ) {
    const destino = paso.institucionId ? `/instituciones/${paso.institucionId}` : '/instituciones'
    return {
      tipo: 'instituciones',
      etiqueta: paso.institucionId ? 'Ver Institución de apoyo' : 'Explorar Instituciones y Especialistas',
      destino,
      icono: 'building',
      ayuda: 'Te guiaremos a instituciones y servicios verificados para tu bienestar y desarrollo.',
    }
  }

  // 4. Comunidad / foros / social / grupos de apoyo
  if (
    tipo === 'comunidad' ||
    categoria === 'comunidad' ||
    texto.includes('comunidad') ||
    texto.includes('foro') ||
    texto.includes('grupo') ||
    texto.includes('conectar') ||
    texto.includes('red') ||
    texto.includes('social') ||
    texto.includes('experiencia')
  ) {
    return {
      tipo: 'comunidad',
      etiqueta: 'Participar en Conectemos',
      destino: '/social',
      icono: 'users',
      ayuda: 'Te guiaremos al espacio comunitario para compartir vivencias y aprender con otros.',
    }
  }

  // 5. Perfil / autonomía / escalas de vida / apoyos del día a día
  if (
    texto.includes('perfil') ||
    texto.includes('autonom') ||
    texto.includes('escala') ||
    texto.includes('independencia') ||
    texto.includes('preferencia') ||
    texto.includes('apoyo') ||
    texto.includes('día a día') ||
    texto.includes('identidad')
  ) {
    return {
      tipo: 'perfil',
      etiqueta: 'Revisar Mi Perfil y Apoyos',
      destino: '/profile',
      icono: 'user',
      ayuda: 'Te guiaremos a tu perfil para ajustar tus apoyos de vida y preferencias de accesibilidad.',
    }
  }

  // 6. Asistente IA / orientación personalizada
  if (
    texto.includes('asistente') ||
    texto.includes('orientaci') ||
    texto.includes('ia') ||
    texto.includes('pregunta') ||
    texto.includes('duda')
  ) {
    return {
      tipo: 'asistente',
      etiqueta: 'Abrir Asistente de Orientación',
      destino: 'chat',
      icono: 'messageSquare',
      ayuda: 'Abriremos el Asistente IA para orientarte paso a paso y resolver tus preguntas.',
    }
  }

  // Fallback según área de interés de la ruta
  if (areaInteres === 'empleo') {
    return {
      tipo: 'empleo',
      etiqueta: 'Ir a Oportunidades laborales',
      destino: '/jobs',
      icono: 'briefcase',
      ayuda: 'Te guiaremos a explorar ofertas laborales inclusivas para este paso.',
    }
  }
  if (areaInteres === 'comunidad') {
    return {
      tipo: 'comunidad',
      etiqueta: 'Participar en Conectemos',
      destino: '/social',
      icono: 'users',
      ayuda: 'Te guiaremos a la comunidad para conectar y avanzar juntos.',
    }
  }
  if (areaInteres === 'salud' || areaInteres === 'educacion') {
    return {
      tipo: 'instituciones',
      etiqueta: 'Explorar Instituciones',
      destino: '/instituciones',
      icono: 'building',
      ayuda: 'Te guiaremos a instituciones especializadas para este objetivo.',
    }
  }

  return {
    tipo: 'otro',
    etiqueta: 'Iniciar actividad en el sistema',
    destino: '/feed',
    icono: 'compass',
    ayuda: 'Te guiaremos al centro de la plataforma para poner en marcha esta actividad.',
  }
}

// ─── Estado de generación automática (motor de recomendación) ─────────────

function GenerandoRutaState() {
  return (
    <div
      style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 14, padding: 48, textAlign: 'center', boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 18px' }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)',
          borderRadius: '50%', animation: 'spin 0.9s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
        }}>
          {Icons.compass({ s: 24 })}
        </div>
      </div>

      <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
        Preparando tu camino de desarrollo
      </h3>
      <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.6 }}>
        Analizando tu perfil e integrando especialistas reales para tu ruta ideal...
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26, textAlign: 'left' }}>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              height: 54, borderRadius: 10,
              background: 'var(--bg-warm)', border: '1px solid var(--border-color)',
              animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function RutasPage() {
  const navigate = useNavigate()
  const { addToast, setFloatingChatOpen } = useUiStore()
  const { data: catalogos } = useCatalogos()
  const { data: onboardingStatus } = useOnboardingStatus()
  const isIncomplete = Boolean(onboardingStatus && !(onboardingStatus as { onboardingCompleto?: boolean }).onboardingCompleto)

  // Filters
  const [filterEstado, setFilterEstado] = useState<string>('')
  const [filterArea, setFilterArea] = useState<string>('')
  const [filtroActividad, setFiltroActividad] = useState<'todas' | 'pendientes' | 'completadas'>('todas')

  // Queries
  const { data: routes = [], isLoading: loadingRoutes } = useRutas({
    estado: filterEstado || undefined,
    areaInteres: filterArea || undefined,
  })
  const { data: summary } = useRutasSummary()
  const { data: miRuta } = useMiRuta()

  // Detectar si el usuario SÍ contestó el formulario o escalas de vida
  const { user } = useAuthStore()
  const { data: profile } = useProfile()

  const tieneEscalasRespondidas = Boolean(
    hasValidScales((profile as any)?.escalasVida) ||
    hasValidScales(getStoredScales()) ||
    Boolean((profile as any)?.profiling?.disability_types?.length) ||
    Boolean((profile as any)?.profiling?.goals?.length)
  )

  const isExplorarSolo = !tieneEscalasRespondidas && Boolean(
    (profile as any)?.preferenciasAcompanamiento === 'explorar_solo' ||
    (profile as any)?.preferencias_acompanamiento === 'explorar_solo' ||
    (profile as any)?.profiling?.preferenciasAcompanamiento === 'explorar_solo' ||
    (user as any)?.preferenciasAcompanamiento === 'explorar_solo' ||
    (user as any)?.preferencias_acompanamiento === 'explorar_solo' ||
    localStorage.getItem('raices_acompanamiento') === 'explorar_solo' ||
    localStorage.getItem('raices_onboarding_progress_tutor')?.includes('explorar_solo') ||
    localStorage.getItem('raices_onboarding_progress_pcd')?.includes('explorar_solo')
  )

  // Selected route state (inline, without modals)
  const [selectedRouteId, setSelectedRouteId] = useState<string | number | null>(null)
  const [mostrarAgregarHito, setMostrarAgregarHito] = useState(false)
  const [mostrarOpcionesAvanzadas, setMostrarOpcionesAvanzadas] = useState(false)
  const [generandoSugerencias, setGenerandoSugerencias] = useState(false)
  const [newStepTitle, setNewStepTitle] = useState('')
  const [newStepDescription, setNewStepDescription] = useState('')

  // Determine active route
  const activeRoute = routes.find(r => r.id === selectedRouteId) ?? routes.find(r => r.estado === 'activa') ?? routes[0] ?? null
  const activeRouteId = activeRoute?.id ?? null

  // Route details with steps
  const { data: rutaDetail, isLoading: loadingDetail } = useRutaDetail(activeRouteId)

  // CRUD hooks
  const updateRuta = useUpdateRuta(activeRouteId)
  const deleteRuta = useDeleteRuta(activeRouteId)
  const addPaso = useAddPaso(activeRouteId ?? '')
  const completarPaso = useCompletarPaso(activeRouteId ?? '')
  const descompletarPaso = useDescompletarPaso(activeRouteId ?? '')
  const createRuta = useCreateRuta()
  const [creandoCaminoGeneral, setCreandoCaminoGeneral] = useState(false)

  // Crear camino base no personalizado para explorar la plataforma
  const handleCrearCaminoGeneral = async () => {
    setCreandoCaminoGeneral(true)
    try {
      const nueva = await createRuta.mutateAsync({
        nombre: 'Guía de exploración de la plataforma',
        descripcion: 'Camino base no personalizado para conocer y usar las herramientas del sistema a tu ritmo.',
        areaInteres: 'comunidad',
        prioridad: 'media',
        metaFinal: 'Familiarizarme con las opciones y servicios de Raíces',
      })
      if (nueva?.id) {
        setSelectedRouteId(nueva.id)
        const pasosBase = [
          { titulo: 'Explorar instituciones y centros en tu zona', descripcion: 'Conoce los servicios y especialistas registrados en el directorio local.' },
          { titulo: 'Revisar oportunidades en la bolsa de trabajo', descripcion: 'Descubre las ofertas de empleo inclusivo disponibles.' },
          { titulo: 'Conectar con la comunidad en Conectemos', descripcion: 'Participa en foros y comparte vivencias con otros usuarios.' },
          { titulo: 'Configurar notas o preferencias en tu perfil', descripcion: 'Guarda tus datos de accesibilidad o notas personales.' },
        ]
        for (const p of pasosBase) {
          try {
            await api.post(`/rutas-desarrollo/${nueva.id}/pasos`, p)
          } catch {
            // omitir error si el paso no se pudo registrar en mock
          }
        }
        addToast('¡Camino base de exploración creado!', 'success')
      }
    } catch {
      addToast('Error al crear el camino base', 'error')
    } finally {
      setCreandoCaminoGeneral(false)
    }
  }

  // Motor de recomendación automatizado
  const generar = useGenerarRutaPersonalizada()
  const rutasActivas = routes.filter(r => r.estado === 'activa').length
  const generacionDisparada = useRef(false)

  const dispararGeneracion = () => {
    if (isExplorarSolo) return
    generar.mutate(undefined, {
      onSuccess: () => addToast('Tu camino personalizado está listo', 'success'),
      onError: () => addToast('No pudimos generar tu ruta automáticamente', 'error'),
    })
  }

  // Auto-Fetch: sin rutas activas → si NO es modo explorar por su cuenta, el motor genera la ruta
  useEffect(() => {
    if (isExplorarSolo) return
    if (generacionDisparada.current || loadingRoutes || isIncomplete) return
    if (rutasActivas > 0) return

    generacionDisparada.current = true
    generar.mutate(undefined, {
      onSuccess: () => addToast('Tu camino personalizado está listo', 'success'),
      onError: () => addToast('No pudimos generar tu ruta automáticamente', 'error'),
    })
  }, [isExplorarSolo, loadingRoutes, rutasActivas, isIncomplete, generar, addToast])

  // Handle route deletion
  const handleDelete = async () => {
    if (!activeRouteId) return
    if (!window.confirm('¿Estás seguro de que deseas eliminar este camino de desarrollo?')) return
    try {
      await deleteRuta.mutateAsync()
      addToast('Camino de desarrollo eliminado', 'success')
      setSelectedRouteId(null)
    } catch {
      addToast('Error al eliminar el camino', 'error')
    }
  }

  // Handle status update
  const handleStatusChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    if (!activeRouteId) return
    try {
      await updateRuta.mutateAsync({ estado: e.target.value as RutaEstado })
      addToast('Estado actualizado', 'success')
    } catch {
      addToast('Error al actualizar el estado', 'error')
    }
  }

  // Handle priority update
  const handlePriorityChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    if (!activeRouteId) return
    try {
      await updateRuta.mutateAsync({ prioridad: e.target.value as RutaPrioridad })
      addToast('Prioridad actualizada', 'success')
    } catch {
      addToast('Error al actualizar la prioridad', 'error')
    }
  }

  // Handle add step
  const handleAddStep = async (e: FormEvent) => {
    e.preventDefault()
    if (!newStepTitle.trim() || !activeRouteId) return
    try {
      await addPaso.mutateAsync({
        titulo: newStepTitle.trim(),
        descripcion: newStepDescription.trim() || undefined,
      })
      addToast('Actividad agregada a tu camino', 'success')
      setNewStepTitle('')
      setNewStepDescription('')
      setMostrarAgregarHito(false)
    } catch {
      addToast('Error al agregar la actividad', 'error')
    }
  }

  // Handle auto-generating suggested steps when a route has 0 steps (e.g. "Terapia", "empezar terapia")
  const handleGenerarPasosSugeridos = async () => {
    if (!activeRouteId || !activeRoute) return
    setGenerandoSugerencias(true)
    try {
      const sugerencias = obtenerPasosSugeridosParaRuta(activeRoute)
      for (const item of sugerencias) {
        await addPaso.mutateAsync({
          titulo: item.titulo,
          descripcion: item.descripcion,
        })
      }
      addToast('¡Actividades guiadas agregadas a tu camino!', 'success')
    } catch {
      addToast('No se pudieron agregar algunas actividades sugeridas', 'error')
    } finally {
      setGenerandoSugerencias(false)
    }
  }

  // Handle toggle step completion
  const handleTogglePaso = async (paso: PasoRuta) => {
    if (String(paso.id).startsWith('paso-vida-')) {
      const nuevoEstado = !Boolean(pasosCompletadosLocal[paso.id])
      const updated = { ...pasosCompletadosLocal, [paso.id]: nuevoEstado }
      setPasosCompletadosLocal(updated)
      try {
        localStorage.setItem('raices_pasos_vida_completados', JSON.stringify(updated))
      } catch {
        // storage disabled or full
      }
      if (nuevoEstado) {
        addToast('¡Excelente avance! Actividad completada.', 'success')
      } else {
        addToast('Actividad marcada como pendiente', 'info')
      }
      return
    }

    if (!activeRouteId) return
    try {
      if (paso.completado) {
        await descompletarPaso.mutateAsync(paso.id)
        addToast('Actividad marcada como pendiente', 'info')
      } else {
        await completarPaso.mutateAsync(paso.id)
        addToast('¡Excelente avance! Actividad completada.', 'success')
      }
    } catch {
      addToast('Error al actualizar la actividad', 'error')
    }
  }

  // Action guidance execution: guides the user directly within the platform
  const handleGuiarActividad = (paso: PasoRuta, guia: GuiaAccion) => {
    if (guia.destino === 'chat') {
      setFloatingChatOpen?.(true)
      addToast('Abriendo Asistente de Orientación...', 'info')
      return
    }

    addToast(`Guiándote a ${guia.etiqueta.replace(/^Ir a |^Explorar |^Participar en |^Revisar /, '')}...`, 'info')
    navigate(guia.destino)
  }

  // Interest areas list
  const listAreas: AreaItem[] = catalogos?.areasInteres ?? [
    { id: 'salud', label: 'Salud y Terapia' },
    { id: 'educacion', label: 'Educación' },
    { id: 'empleo', label: 'Empleo' },
    { id: 'comunidad', label: 'Comunidad y Recreación' },
  ]

  const generandoRutaInicial = !isExplorarSolo && generar.isPending

  // Pasos base de acompañamiento en la vida (cuando el camino aún no tiene pasos o se explora la app)
  const PASOS_VIDA_BASE: PasoRuta[] = [
    {
      id: 'paso-vida-1',
      titulo: 'Explorar instituciones y servicios verificados en tu zona',
      descripcion: 'Conoce los centros de apoyo, asociaciones y especialistas verificados en Raíces para recibir orientación o asistencia cuando lo requieras.',
      completado: false,
      orden: 1,
      tipo: 'institucion',
    },
    {
      id: 'paso-vida-2',
      titulo: 'Descubrir oportunidades inclusivas en la bolsa de empleo',
      descripcion: 'Explora ofertas de trabajo adaptadas con accesibilidad y programas de desarrollo laboral para talentos diversos.',
      completado: false,
      orden: 2,
      tipo: 'empleo',
    },
    {
      id: 'paso-vida-3',
      titulo: 'Conectar y compartir vivencias en la comunidad Conectemos',
      descripcion: 'Participa en foros, intercambia experiencias con otras personas y familias, y encuentra redes de apoyo solidarias.',
      completado: false,
      orden: 3,
      tipo: 'comunidad',
    },
    {
      id: 'paso-vida-4',
      titulo: 'Registrar tus requerimientos y notas en tu perfil',
      descripcion: 'Personaliza tus necesidades de accesibilidad y mantén organizadas tus notas personales para que la plataforma te acompañe mejor.',
      completado: false,
      orden: 4,
      tipo: 'perfil',
    },
  ]

  const [pasosCompletadosLocal, setPasosCompletadosLocal] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('raices_pasos_vida_completados') || '{}')
    } catch {
      return {}
    }
  })

  // Resolve steps for the current view
  const rawPasos: PasoRuta[] = rutaDetail?.pasos ?? (activeRoute?.pasos as PasoRuta[] | undefined) ?? (activeRouteId === miRuta?.ruta?.id ? miRuta?.pasos : []) ?? []
  
  // Raíces siempre provee el camino que acompaña en la vida: si no hay pasos en el servidor, mostramos los pasos base
  const pasos: PasoRuta[] = rawPasos.length > 0
    ? rawPasos
    : PASOS_VIDA_BASE.map(p => ({
        ...p,
        completado: Boolean(pasosCompletadosLocal[p.id]),
      }))

  const totalPasos = pasos.length
  const pasosCompletados = pasos.filter(p => p.completado).length
  const porcentaje = totalPasos > 0 ? Math.round((pasosCompletados / totalPasos) * 100) : (activeRoute ? Math.round(activeRoute.porcentajeProgreso ?? 0) : 0)

  // Filtered steps
  const pasosFiltrados = pasos.filter(p => {
    if (filtroActividad === 'pendientes') return !p.completado
    if (filtroActividad === 'completadas') return p.completado
    return true
  })

  // Next suggested step
  const siguientePasoIncompleto = pasos.find(p => !p.completado)

  // Local entities tailored to the user and their path
  const institucionesRecomendadas = miRuta?.entidadesLocales?.instituciones ?? []
  const vacantesRecomendadas = miRuta?.entidadesLocales?.vacantes ?? []

  return (
    <main className="responsive-main" style={{ '--main-max-width': '1100px' } as CSSProperties}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 20px 48px' }}>
        
        {/* Header Principal */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <FriendlyIcons.compass size={30} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
              Mi Camino
            </h1>
          </div>
          <p style={{ fontSize: 14.5, color: 'var(--fg3)', margin: '4px 0 0', lineHeight: 1.5 }}>
            Tu guía interactiva paso a paso para orientarte en el sistema, realizar cada acción y cumplir tus metas.
          </p>
        </div>

        {isIncomplete ? (
          <RestrictedBlock
            title="Rutas restringidas"
            message="Completa tu perfil desde el panel principal (dashboard) para comenzar a planificar tus metas y rutas de desarrollo."
            height={360}
          />
        ) : (
          <>
            {/* Banner de Orientación PCD y Transparencia */}
            <div
              style={{
                background: isExplorarSolo
                  ? 'linear-gradient(135deg, rgba(148, 163, 184, 0.12) 0%, rgba(1, 173, 255, 0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(1, 173, 255, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
                border: isExplorarSolo ? '1px solid rgba(148, 163, 184, 0.35)' : '1px solid rgba(1, 173, 255, 0.25)',
                borderRadius: 14,
                padding: '18px 20px',
                marginBottom: 28,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: isExplorarSolo ? 'var(--bg-warm)' : 'var(--primary)',
                  color: isExplorarSolo ? 'var(--fg1)' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                  fontSize: isExplorarSolo ? 18 : 16,
                }}
              >
                {FriendlyIcons.compass({ size: 22 })}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--fg1)' }}>
                    El camino que te acompaña en la vida
                  </div>
                  {tieneEscalasRespondidas ? (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                      Orientado según tus respuestas
                    </span>
                  ) : isExplorarSolo ? (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-warm)', color: 'var(--fg2)' }}>
                      Acompañamiento a tu propio ritmo
                    </span>
                  ) : null}
                </div>
                <div style={{ fontSize: 13, color: 'var(--fg2)', lineHeight: 1.55 }}>
                  {tieneEscalasRespondidas
                    ? 'Tu camino refleja tus respuestas y preferencias guardadas para conectarte con las opciones de accesibilidad, empleo y comunidad que mejor se adaptan a ti.'
                    : 'Raíces es tu guía continua: dentro de la plataforma te acompañamos para orientarte, descubrir instituciones y servicios verificados, explorar opciones de empleo inclusivo y conectar en comunidad. Al pulsar en cada actividad, te guiamos directo para realizar cada acción a tu ritmo.'}
                </div>
              </div>
            </div>

            {/* Contenido principal de la página */}
            {loadingRoutes ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 24, height: 160, animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : generandoRutaInicial ? (
              <GenerandoRutaState />
            ) : routes.length === 0 ? (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 36, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
                  {Icons.compass({ s: 26 })}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 10px' }}>
                  {isExplorarSolo ? 'No tienes un camino asignado' : 'Aún no tienes rutas de desarrollo'}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--fg2)', maxWidth: 580, margin: '0 auto 24px', lineHeight: 1.6 }}>
                  {isExplorarSolo
                    ? 'No tienes un camino porque entraste en modo "Explorar por mi cuenta" y decidiste no realizar el cuestionario de orientación inicial. Como no tenemos información sobre ti, no te podemos inventar ni recomendar una ruta personalizada. Sin embargo, puedes activar una guía base de exploración (no personalizada) para aprender a usar el sistema a tu propio ritmo, o crear tu propia meta cuando lo desees.'
                    : 'Estamos preparando tu primer camino a partir de tu perfil. Si no aparece en unos segundos, puedes reintentar.'}
                </p>

                {isExplorarSolo ? (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, maxWidth: 820, margin: '0 auto 24px', textAlign: 'left' }}>
                      <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FriendlyIcons.compass size={18} /> Camino base de exploración
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
                            Una guía estándar (no personalizada) con 4 pasos prácticos para conocer y usar las áreas del sistema: instituciones, empleo, comunidad y perfil.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleCrearCaminoGeneral}
                          disabled={creandoCaminoGeneral}
                          className="btn-primary"
                          style={{ marginTop: 16, padding: '10px 16px', fontSize: 13, width: '100%', justifyContent: 'center' }}
                        >
                          {creandoCaminoGeneral ? 'Creando guía...' : 'Activar camino base (no personalizado)'}
                        </button>
                      </div>

                      <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
                            ✨ Personalizar con tu perfil
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
                            Si algún día deseas que el sistema te oriente con base en tus preferencias particulares, puedes completar tu información en tu perfil.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('/profile')}
                          className="btn-secondary"
                          style={{ marginTop: 16, padding: '10px 16px', fontSize: 13, width: '100%', justifyContent: 'center' }}
                        >
                          Ir a mi perfil
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={() => navigate('/instituciones')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12.5 }}>
                        Explorar instituciones
                      </button>
                      <button onClick={() => navigate('/jobs')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12.5 }}>
                        Explorar empleo
                      </button>
                      <button onClick={() => navigate('/social')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12.5 }}>
                        Comunidad Conectemos
                      </button>
                    </div>
                  </div>
                ) : (
                  generar.isError && (
                    <button onClick={dispararGeneracion} className="btn-primary" style={{ padding: '10px 24px' }}>
                      Reintentar generación
                    </button>
                  )
                )}
              </div>
            ) : (
              <div>
                {/* Selector de camino cuando el usuario tiene más de una ruta (sin abrir modales) */}
                {routes.length > 1 && (
                  <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Tus caminos:
                    </span>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {routes.map(r => {
                        const isSelected = r.id === activeRoute?.id
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedRouteId(r.id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 20,
                              fontSize: 13,
                              fontWeight: isSelected ? 700 : 500,
                              cursor: 'pointer',
                              border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                              background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                              color: isSelected ? '#fff' : 'var(--fg2)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <span>{r.nombre?.toLowerCase().includes('terapia') ? 'Camino de Autonomía y Bienestar' : r.nombre}</span>
                            <span style={{ fontSize: 11, opacity: isSelected ? 0.9 : 0.6 }}>({Math.round(r.porcentajeProgreso ?? 0)}%)</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Tarjeta del Camino Activo */}
                {activeRoute && (
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 16,
                      padding: 26,
                      marginBottom: 28,
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                      <div style={{ flex: 1, minWidth: 280 }}>
                        {/* Etiquetas */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '3px 10px',
                              borderRadius: 6,
                              color: STATUS_COLORS[activeRoute.estado] || '#01ADFF',
                              background: 'rgba(1, 173, 255, 0.1)',
                            }}
                          >
                            ● {STATUS_LABELS[activeRoute.estado] || activeRoute.estado}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 9px',
                              borderRadius: 6,
                              background: (PRIORITY_COLORS[activeRoute.prioridad] ?? PRIORITY_COLORS.media).bg,
                              color: (PRIORITY_COLORS[activeRoute.prioridad] ?? PRIORITY_COLORS.media).fg,
                            }}
                          >
                            Prioridad {activeRoute.prioridad}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--fg3)' }}>
                            {activeRoute.nombre?.toLowerCase().trim() === 'terapia'
                              ? 'Autonomía y Bienestar'
                              : listAreas.find(a => a.id === activeRoute.areaInteres)?.label || activeRoute.areaInteres}
                          </span>
                        </div>

                        {/* Título de la ruta */}
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
                          {activeRoute.nombre?.toLowerCase().trim() === 'terapia' || activeRoute.nombre?.toLowerCase().trim() === 'empezar terapia'
                            ? 'Camino de Autonomía y Bienestar'
                            : activeRoute.nombre}
                        </h2>
                        <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
                          {activeRoute.descripcion?.toLowerCase().includes('empezar terapia') || activeRoute.nombre?.toLowerCase().trim() === 'terapia'
                            ? 'Tu camino continuo en Raíces para acompañarte día a día, orientarte en el uso de la plataforma, fortalecer tu autonomía y conectarte con apoyos y oportunidades a tu propio ritmo.'
                            : activeRoute.descripcion || 'Tu guía continua en Raíces para acompañarte en la vida.'}
                        </p>
                      </div>

                      {/* Progreso y Contador de actividades */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase' }}>Avance</div>
                          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                            {porcentaje}%
                          </div>
                        </div>
                        <div style={{ width: 1, height: 42, background: 'var(--border-color)' }} />
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase' }}>Actividades</div>
                          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg1)', marginTop: 2 }}>
                            {pasosCompletados} / {totalPasos}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div style={{ height: 10, background: 'var(--bg-warm)', borderRadius: 5, overflow: 'hidden', marginBottom: 16 }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${porcentaje}%`,
                          background: STATUS_COLORS[activeRoute.estado] || 'var(--primary)',
                          borderRadius: 5,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>

                    {/* Meta final (sutil, sin pancartas invasivas) */}
                    {activeRoute.metaFinal && (
                      <div style={{ marginTop: 8, fontSize: 13, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>🎯</span>
                        <span>
                          <strong>Meta final del camino:</strong>{' '}
                          {activeRoute.metaFinal.toLowerCase().includes('lunes') || activeRoute.metaFinal.toLowerCase().includes('terapia')
                            ? 'Vivir con mayor autonomía, bienestar y participación plena en la comunidad a tu propio ritmo'
                            : activeRoute.metaFinal}
                        </span>
                      </div>
                    )}

                    {/* Acciones del camino inline */}
                    <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setMostrarOpcionesAvanzadas(!mostrarOpcionesAvanzadas)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--fg3)',
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: 0,
                        }}
                      >
                        {mostrarOpcionesAvanzadas ? 'Ocultar opciones' : 'Editar estado y prioridad'}
                      </button>
                    </div>

                    {/* Panel inline de opciones avanzadas (sin modal) */}
                    {mostrarOpcionesAvanzadas && (
                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 14,
                          borderTop: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg2)' }}>
                            <span>Estado:</span>
                            <select
                              value={activeRoute.estado}
                              onChange={handleStatusChange}
                              className="onboarding-input"
                              style={{ height: 32, padding: '0 8px', fontSize: 13 }}
                            >
                              <option value="activa">Activa</option>
                              <option value="completada">Completada</option>
                              <option value="pausada">Pausada</option>
                              <option value="cancelada">Cancelada</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg2)' }}>
                            <span>Prioridad:</span>
                            <select
                              value={activeRoute.prioridad}
                              onChange={handlePriorityChange}
                              className="onboarding-input"
                              style={{ height: 32, padding: '0 8px', fontSize: 13 }}
                            >
                              <option value="baja">Baja</option>
                              <option value="media">Media</option>
                              <option value="alta">Alta</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SECCIÓN DE ACTIVIDADES DEL CAMINO (NO MODAL) ── */}
                <div style={{ marginBottom: 36 }}>
                  {/* Encabezado de la lista de actividades */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                        Actividades de tu camino
                      </h2>
                      <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '4px 0 0' }}>
                        Selecciona cualquier actividad para guiarte en el sistema y realizar la acción necesaria.
                      </p>
                    </div>

                    {/* Filtros de actividades */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(['todas', 'pendientes', 'completadas'] as const).map(tipo => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setFiltroActividad(tipo)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: filtroActividad === tipo ? 700 : 500,
                            border: filtroActividad === tipo ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                            background: filtroActividad === tipo ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                            color: filtroActividad === tipo ? 'var(--primary)' : 'var(--fg2)',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                          }}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lista interactiva de actividades */}
                  {loadingDetail ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: 84, borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', animation: 'pulse 1.5s infinite' }} />
                      ))}
                    </div>
                  ) : pasosFiltrados.length === 0 ? (
                    <div
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px dashed var(--border-color)',
                        borderRadius: 14,
                        padding: 36,
                        textAlign: 'center',
                        color: 'var(--fg3)',
                      }}
                    >
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(1, 173, 255, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        {Icons.compass({ s: 22 })}
                      </div>

                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
                        {totalPasos === 0
                          ? isExplorarSolo
                            ? `Organiza tu meta "${activeRoute?.nombre ?? ''}" a tu propio ritmo`
                            : `Desglosa tu meta "${activeRoute?.nombre ?? ''}" en pasos prácticos`
                          : filtroActividad === 'completadas'
                            ? 'Aún no has completado actividades en este camino.'
                            : '¡Felicidades! No tienes actividades pendientes.'}
                      </h3>

                      <p style={{ fontSize: 13.5, color: 'var(--fg2)', margin: '0 auto 20px', maxWidth: 540, lineHeight: 1.5 }}>
                        {totalPasos === 0
                          ? isExplorarSolo
                            ? 'Como elegiste explorar por tu cuenta, puedes organizar tus propios pasos como prefieras, o cargar una estructura base con accesos al directorio, notas personales y comunidad.'
                            : 'Puedes cargar una plantilla organizativa con accesos al directorio, notas personales y comunidad, o agregar tus propios pasos libremente.'
                          : 'Puedes revisar todas las actividades del camino o agregar un paso nuevo.'}
                      </p>

                      {totalPasos === 0 && (
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={handleGenerarPasosSugeridos}
                            disabled={generandoSugerencias}
                            style={{ padding: '10px 22px', fontSize: 13.5, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                          >
                            <span>{generandoSugerencias ? 'Generando pasos...' : isExplorarSolo ? '✨ Cargar plantilla organizativa para esta meta' : '✨ Sugerir y generar actividades para esta meta'}</span>
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setMostrarAgregarHito(true)}
                            style={{ padding: '10px 18px', fontSize: 13.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            <span>+ Agregar un paso a mi manera</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Línea conectora del camino / roadmap visual */}
                      {pasosFiltrados.length > 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 38,
                            top: 30,
                            bottom: 30,
                            width: 3,
                            background: 'linear-gradient(to bottom, var(--primary) 0%, rgba(1, 173, 255, 0.25) 100%)',
                            borderRadius: 2,
                            zIndex: 0,
                          }}
                        />
                      )}
                      {pasosFiltrados.map((paso, idx) => {
                        const esSiguiente = paso === siguientePasoIncompleto
                        const guia = resolverGuiaActividad(paso, activeRoute?.areaInteres)

                        return (
                          <div
                            key={paso.id}
                            style={{
                              position: 'relative',
                              zIndex: 1,
                              background: paso.completado
                                ? 'color-mix(in oklch, var(--primary) 3%, var(--bg-surface))'
                                : esSiguiente
                                  ? 'var(--bg-surface)'
                                  : 'var(--bg-surface)',
                              border: paso.completado
                                ? '1px solid #10B981'
                                : esSiguiente
                                  ? '2px solid var(--primary)'
                                  : '1px solid var(--border-color)',
                              borderRadius: 14,
                              padding: 20,
                              boxShadow: esSiguiente ? '0 4px 14px rgba(1, 173, 255, 0.12)' : 'var(--shadow-sm)',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              gap: 16,
                              alignItems: 'flex-start',
                            }}
                          >
                            {/* Nodo / Indicador numérico o de check */}
                            <div
                              onClick={() => handleTogglePaso(paso)}
                              title={paso.completado ? 'Haz clic para desmarcar' : 'Haz clic para marcar como completada'}
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                background: paso.completado ? '#10B981' : esSiguiente ? 'var(--primary)' : 'var(--bg-warm)',
                                color: paso.completado || esSiguiente ? '#fff' : 'var(--fg2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: 'pointer',
                                boxShadow: esSiguiente ? '0 0 0 4px rgba(1, 173, 255, 0.2)' : 'none',
                                marginTop: 2,
                              }}
                            >
                              {paso.completado ? Icons.check({ s: 20 }) : idx + 1}
                            </div>

                            {/* Contenido de la actividad */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                                <div>
                                  <h3
                                    style={{
                                      fontSize: 16,
                                      fontWeight: 700,
                                      color: paso.completado ? 'var(--fg2)' : 'var(--fg1)',
                                      textDecoration: paso.completado ? 'line-through' : 'none',
                                      margin: 0,
                                      lineHeight: 1.35,
                                    }}
                                  >
                                    {paso.titulo}
                                  </h3>
                                </div>

                                {/* Badge de estado */}
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  {esSiguiente && (
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(1, 173, 255, 0.15)', color: '#01ADFF' }}>
                                      Sugerido ahora
                                    </span>
                                  )}
                                  {paso.completado && (
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                                      Realizada ✓
                                    </span>
                                  )}
                                </div>
                              </div>

                              {paso.descripcion && (
                                <p style={{ fontSize: 13.5, color: 'var(--fg2)', margin: '4px 0 12px', lineHeight: 1.5 }}>
                                  {paso.descripcion}
                                </p>
                              )}

                              {/* Orientación del sistema para esta actividad */}
                              <div
                                style={{
                                  background: 'var(--bg-warm)',
                                  borderRadius: 10,
                                  padding: '10px 14px',
                                  marginTop: 10,
                                  marginBottom: 14,
                                  fontSize: 12.5,
                                  color: 'var(--fg2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <span style={{ color: 'var(--primary)', flexShrink: 0 }}>
                                  {guia.tipo === 'casa' ? '🏠' : Icons.compass({ s: 16 })}
                                </span>
                                <div>
                                  <strong style={{ color: 'var(--fg1)' }}>Orientación:</strong> {guia.ayuda}
                                </div>
                              </div>

                              {/* Fila de Acciones: Guiar en el sistema + Toggle Completada */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                {/* Botón principal: Guiar a la acción en el sistema */}
                                <button
                                  type="button"
                                  className="btn-primary"
                                  onClick={() => handleGuiarActividad(paso, guia)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 16px',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    borderRadius: 8,
                                  }}
                                >
                                  <span>{guia.etiqueta}</span>
                                  {guia.tipo === 'casa' ? '💡' : Icons.arrowRight({ s: 15 })}
                                </button>

                                {/* Botón secundario: Alternar estado completado */}
                                <button
                                  type="button"
                                  onClick={() => handleTogglePaso(paso)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '8px 14px',
                                    borderRadius: 8,
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    border: paso.completado ? '1px solid #10B981' : '1px solid var(--border-color)',
                                    background: paso.completado ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface)',
                                    color: paso.completado ? '#10B981' : 'var(--fg2)',
                                  }}
                                >
                                  {paso.completado ? (
                                    <>
                                      {Icons.check({ s: 14 })}
                                      <span>Completada (desmarcar)</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Marcar como realizada</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Formulario Inline para agregar una actividad personalizada */}
                  <div style={{ marginTop: 20 }}>
                    {!mostrarAgregarHito ? (
                      <button
                        type="button"
                        onClick={() => setMostrarAgregarHito(true)}
                        style={{
                          background: 'transparent',
                          border: '1px dashed var(--border-color)',
                          borderRadius: 10,
                          padding: '12px 18px',
                          width: '100%',
                          color: 'var(--primary)',
                          fontSize: 13.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        {Icons.plus({ s: 16 })}
                        <span>Agregar una actividad personalizada a este camino</span>
                      </button>
                    ) : (
                      <form
                        onSubmit={handleAddStep}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 12,
                          padding: 18,
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', marginBottom: 12 }}>
                          Nueva actividad para tu camino
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                          <input
                            className="onboarding-input"
                            value={newStepTitle}
                            onChange={e => setNewStepTitle(e.target.value)}
                            placeholder="Título de la actividad (ej. Solicitar cita en centro de terapia...)"
                            style={{ height: 38, padding: '0 12px', fontSize: 13.5 }}
                            required
                          />
                          <input
                            className="onboarding-input"
                            value={newStepDescription}
                            onChange={e => setNewStepDescription(e.target.value)}
                            placeholder="Descripción opcional (ej. Consultar horario disponible para evaluación)"
                            style={{ height: 38, padding: '0 12px', fontSize: 13.5 }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setMostrarAgregarHito(false)}
                            style={{ padding: '8px 16px', fontSize: 13 }}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="btn-primary"
                            style={{ padding: '8px 18px', fontSize: 13 }}
                          >
                            Guardar actividad
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* ── SECCIÓN DE HERRAMIENTAS Y AVISO DE NO ASESORÍA CLÍNICA ── */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: 'var(--shadow-sm)',
                    marginBottom: 24,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <FriendlyIcons.compass size={24} />
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                        Herramientas de Raíces para acompañar tu camino
                      </h2>
                      <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '2px 0 0' }}>
                        Raíces es tu facilitador digital: te ayudamos a encontrar recursos y organizar tus propias metas en la plataforma.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                    <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>🏥</span>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Directorio de Instituciones</h3>
                      </div>
                      <p style={{ fontSize: 12.5, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
                        Consulta centros verificados, servicios accesibles y especialistas en tu zona para contactarlos directamente por tu cuenta.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/instituciones')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 12, cursor: 'pointer', padding: '8px 0 0', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <span>Explorar directorio</span>
                        {Icons.arrowRight({ s: 13 })}
                      </button>
                    </div>

                    <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>💬</span>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Comunidad Conectemos</h3>
                      </div>
                      <p style={{ fontSize: 12.5, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
                        Intercambia vivencias con personas y familias en situaciones similares, o abre un tema nuevo si aún no encuentras publicaciones afines.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/social')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 12, cursor: 'pointer', padding: '8px 0 0', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <span>Ir a Conectemos</span>
                        {Icons.arrowRight({ s: 13 })}
                      </button>
                    </div>

                    <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>📝</span>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Organizador y Notas Personales</h3>
                      </div>
                      <p style={{ fontSize: 12.5, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
                        Apunta tus fechas importantes, dudas o preguntas para cuando acudas a consultas con tus profesionales de salud de confianza.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 12, cursor: 'pointer', padding: '8px 0 0', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <span>Ver mi perfil</span>
                        {Icons.arrowRight({ s: 13 })}
                      </button>
                    </div>
                  </div>

                  {/* Disclaimer médico explícito */}
                  <div style={{ marginTop: 18, padding: '12px 16px', borderRadius: 10, background: 'rgba(251, 133, 0, 0.08)', border: '1px solid rgba(251, 133, 0, 0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>ℹ️</span>
                    <div style={{ fontSize: 12, color: 'var(--fg2)', lineHeight: 1.5 }}>
                      <strong>Aviso importante:</strong> Raíces es un facilitador digital y social, no un centro médico ni terapeuta. No emitimos diagnósticos, prescripciones clínicas ni instrucciones médicas. Cualquier decisión o tratamiento de salud debe consultarse directamente con especialistas médicos certificados.
                    </div>
                  </div>
                </div>

                {/* ── SECCIÓN DE APOYOS Y RECURSOS REALES DEL SISTEMA ── */}
                {(institucionesRecomendadas.length > 0 || vacantesRecomendadas.length > 0) && (
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 16,
                      padding: 24,
                      boxShadow: 'var(--shadow-sm)',
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>🤝</span>
                        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                          {isExplorarSolo ? 'Directorio Abierto de Instituciones y Empleo' : 'Apoyos y Oportunidades Reales en tu Zona'}
                        </h2>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '4px 0 0' }}>
                        {isExplorarSolo
                          ? 'Explora el catálogo libremente según tu propio criterio, sin filtros automáticos impuestos por el sistema.'
                          : 'Centros, especialistas y vacantes registradas en el sistema para ayudarte a cumplir tu camino.'}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                      {/* Instituciones */}
                      {institucionesRecomendadas.slice(0, 3).map(inst => (
                        <div
                          key={`inst-${inst.id}`}
                          onClick={() => {
                            addToast(`Abriendo ${inst.nombre}`, 'info')
                            navigate(`/instituciones/${inst.id}`)
                          }}
                          style={{
                            background: 'var(--bg-warm)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 12,
                            padding: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            transition: 'all 0.2s',
                          }}
                          className="card-hover"
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              background: 'rgba(1, 173, 255, 0.12)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {Icons.compass({ s: 20 })}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fg1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {inst.nombre}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--fg3)', display: 'flex', gap: 6, marginTop: 2 }}>
                              <span>{inst.categoria}</span>
                              {inst.distancia && <span>· {inst.distancia}</span>}
                            </div>
                          </div>
                          {Icons.arrowRight({ s: 15 })}
                        </div>
                      ))}

                      {/* Vacantes */}
                      {vacantesRecomendadas.slice(0, 3).map(vac => (
                        <div
                          key={`vac-${vac.id}`}
                          onClick={() => {
                            addToast(`Explorando vacante: ${vac.titulo}`, 'info')
                            navigate('/jobs')
                          }}
                          style={{
                            background: 'var(--bg-warm)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 12,
                            padding: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            transition: 'all 0.2s',
                          }}
                          className="card-hover"
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              background: 'rgba(251, 133, 0, 0.12)',
                              color: '#FB8500',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {Icons.briefcase({ s: 20 })}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fg1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {vac.titulo}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--fg3)', display: 'flex', gap: 6, marginTop: 2 }}>
                              <span>{vac.modalidad}</span>
                              {vac.ciudad && <span>· {vac.ciudad}</span>}
                            </div>
                          </div>
                          {Icons.arrowRight({ s: 15 })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
