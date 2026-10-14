import { useState, useMemo, useEffect, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSaveEscalasVida, useProfile } from '@features/profile/hooks/useProfile'
import { useOnboardingStatus } from '@features/institutions/hooks/useRecommendations'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, labelStyle } from '@shared/components/shared'
import OnboardingStageCover from '@features/profile/components/OnboardingStageCover'
import type {
  EscalaVidaItem,
  EscalasVidaValues,
} from '@/types/rutas'
import type { EscalasVidaPayload } from '@/types/profile'
import { CustomSelect } from '@shared/components/CustomSelect'

interface CatalogOption {
  id: string
  label: string
  description?: string
}

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

const SCALES: EscalaVidaItem[] = [
  {
    key: 'nivelAutonomia',
    label: 'Autonomía',
    desc: 'Capacidad para realizar actividades básicas por cuenta propia.',
    icon: '👤',
    options: [
      { val: 4, label: 'Me desenvuelvo con autonomía' },
      { val: 3, label: 'Requiero apoyo en algunas decisiones' },
      { val: 2, label: 'Requiero apoyo frecuente para elegir y decidir' },
      { val: 1, label: 'Requiero acompañamiento constante en mis decisiones' },
    ],
  },
  {
    key: 'nivelIndependencia',
    label: 'Independencia',
    desc: 'Capacidad para tomar decisiones y valerse por sí mismo en el entorno.',
    icon: '🗺️',
    options: [
      { val: 4, label: 'Me desenvuelvo con autonomía' },
      { val: 3, label: 'Requiero apoyo en algunas actividades' },
      { val: 2, label: 'Requiero apoyo frecuente' },
      { val: 1, label: 'Requiero acompañamiento constante' },
    ],
  },
  {
    key: 'nivelComunicacion',
    label: 'Comunicación',
    desc: 'Habilidad para expresar ideas, deseos y necesidades.',
    icon: '💬',
    options: [
      { val: 4, label: 'Me comunico de manera verbal y/o no verbal autónoma' },
      { val: 3, label: 'Me comunico bien con apoyos o adaptaciones sencillas' },
      { val: 2, label: 'Requiero apoyo frecuente para expresarme y comprender' },
      { val: 1, label: 'Requiero acompañamiento constante / Sistemas aumentativos' },
    ],
  },
  {
    key: 'nivelComprension',
    label: 'Comprensión',
    desc: 'Habilidad para entender instrucciones, conceptos y contextos.',
    icon: '🧠',
    options: [
      { val: 4, label: 'Comprendo instrucciones de manera independiente' },
      { val: 3, label: 'Comprendo con explicaciones adicionales o apoyos visuales' },
      { val: 2, label: 'Requiero apoyo frecuente y repetición para comprender' },
      { val: 1, label: 'Requiero apoyo y acompañamiento constante para la comprensión' },
    ],
  },
  {
    key: 'nivelEnergia',
    label: 'Energía',
    desc: 'Nivel diario de vitalidad y resistencia física/mental.',
    icon: '⚡',
    options: [
      { val: 4, label: 'Alta resistencia y energía constante para mis actividades' },
      { val: 3, label: 'Energía moderada con pausas o apoyos puntuales' },
      { val: 2, label: 'Baja energía, requiero dosificar mucho mis actividades' },
      { val: 1, label: 'Fatiga o baja energía constante, requiero asistencia completa' },
    ],
  },
  {
    key: 'nivelMovilidad',
    label: 'Movilidad',
    desc: 'Capacidad física para trasladarse y realizar movimientos corporales.',
    icon: '🏃',
    options: [
      { val: 4, label: 'Movilidad completamente autónoma e independiente' },
      { val: 3, label: 'Movilidad con uso independiente de ayudas técnicas' },
      { val: 2, label: 'Requiero apoyo de otra persona para desplazarme a veces' },
      { val: 1, label: 'Requiero apoyo y asistencia constante para la movilidad' },
    ],
  },
  {
    key: 'nivelSocial',
    label: 'Socialización',
    desc: 'Habilidad para entablar relaciones, participar en grupos e interactuar.',
    icon: '🤝',
    options: [
      { val: 4, label: 'Me relaciono y participo socialmente de manera autónoma' },
      { val: 3, label: 'Participo socialmente con apoyo o mediación en algunos entornos' },
      { val: 2, label: 'Requiero apoyo frecuente para interactuar y socializar' },
      { val: 1, label: 'Requiero acompañamiento constante en interacciones sociales' },
    ],
  },
  {
    key: 'nivelEmocional',
    label: 'Emocional',
    desc: 'Capacidad para procesar emociones, tolerar la frustración y mantener bienestar mental.',
    icon: '❤️',
    options: [
      { val: 4, label: 'Estabilidad emocional autónoma y buen manejo de la frustración' },
      { val: 3, label: 'Estable la mayor parte del tiempo con apoyos emocionales breves' },
      { val: 2, label: 'Fluctuaciones frecuentes, requiero apoyo constante' },
      { val: 1, label: 'Crisis o desregulación frecuente, requiero acompañamiento constante' },
    ],
  },
]

const LEVEL_LABELS: Record<number, { title: string; color: string; bg: string }> = {
  1: { title: 'Nivel 1: Apoyo total', color: 'var(--color-coral)', bg: 'color-mix(in oklch, var(--color-coral) 12%, transparent)' },
  2: { title: 'Nivel 2: Apoyo sustancial', color: 'var(--color-amarillo)', bg: 'color-mix(in oklch, var(--color-amarillo) 16%, transparent)' },
  3: { title: 'Nivel 3: Apoyo moderado', color: 'var(--primary)', bg: 'var(--primary-subtle)' },
  4: { title: 'Nivel 4: Autónomo', color: 'var(--secondary)', bg: 'var(--secondary-subtle)' },
}

export function hasValidScales(data?: Partial<EscalasVidaValues> | null): boolean {
  if (!data || typeof data !== 'object') return false
  const keys: Array<keyof EscalasVidaValues> = [
    'nivelAutonomia',
    'nivelIndependencia',
    'nivelComunicacion',
    'nivelComprension',
    'nivelEnergia',
    'nivelMovilidad',
    'nivelSocial',
    'nivelEmocional',
  ]
  const answered = keys.filter(k => typeof data[k] === 'number' && Number(data[k]) >= 1).length
  return answered >= 4
}

function getStoredScales(): EscalasVidaValues | null {
  try {
    const raw = localStorage.getItem('raices_user_scales')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && hasValidScales(parsed)) {
        return {
          nivelAutonomia: typeof parsed.nivelAutonomia === 'number' ? parsed.nivelAutonomia : undefined,
          nivelIndependencia: typeof parsed.nivelIndependencia === 'number' ? parsed.nivelIndependencia : undefined,
          nivelComunicacion: typeof parsed.nivelComunicacion === 'number' ? parsed.nivelComunicacion : undefined,
          nivelComprension: typeof parsed.nivelComprension === 'number' ? parsed.nivelComprension : undefined,
          nivelEnergia: typeof parsed.nivelEnergia === 'number' ? parsed.nivelEnergia : undefined,
          nivelMovilidad: typeof parsed.nivelMovilidad === 'number' ? parsed.nivelMovilidad : undefined,
          nivelSocial: typeof parsed.nivelSocial === 'number' ? parsed.nivelSocial : undefined,
          nivelEmocional: typeof parsed.nivelEmocional === 'number' ? parsed.nivelEmocional : undefined,
          tieneDiagnostico: parsed.tieneDiagnostico ?? false,
          diagnosticoEspecifico: parsed.diagnosticoEspecifico ?? '',
          temporalidadOrigen: parsed.temporalidadOrigen ?? '',
          preferenciaFormato: parsed.preferenciaFormato ?? '',
          areasInteres: Array.isArray(parsed.areasInteres) ? parsed.areasInteres : [],
          viabilidadEconomica: parsed.viabilidadEconomica ?? '',
        }
      }
    }
  } catch {
    // Ignore invalid JSON
  }
  return null
}

export default function EscalasVidaPage() {
  const navigate = useNavigate()
  const { addToast } = useUiStore()
  const saveEscalas = useSaveEscalasVida()
  const { data: catalogos } = useCatalogos()
  const { data: profile, isLoading: isProfileLoading } = useProfile()
  const { data: onboardingStatus, isLoading: isOnboardingLoading } = useOnboardingStatus()

  // 1. Resolver escalas guardadas (de localStorage o de perfil)
  const initialData = useMemo(() => {
    const stored = getStoredScales()
    if (stored && hasValidScales(stored)) return { data: stored, hasExisting: true }

    const rawProfile = profile as unknown as Record<string, unknown> | undefined
    const backendScales = rawProfile?.escalasVida as Record<string, unknown> | undefined
    if (backendScales && typeof backendScales === 'object' && hasValidScales(backendScales as Partial<EscalasVidaValues>)) {
      return {
        data: {
          nivelAutonomia: typeof backendScales.nivelAutonomia === 'number' ? backendScales.nivelAutonomia : undefined,
          nivelIndependencia: typeof backendScales.nivelIndependencia === 'number' ? backendScales.nivelIndependencia : undefined,
          nivelComunicacion: typeof backendScales.nivelComunicacion === 'number' ? backendScales.nivelComunicacion : undefined,
          nivelComprension: typeof backendScales.nivelComprension === 'number' ? backendScales.nivelComprension : undefined,
          nivelEnergia: typeof backendScales.nivelEnergia === 'number' ? backendScales.nivelEnergia : undefined,
          nivelMovilidad: typeof backendScales.nivelMovilidad === 'number' ? backendScales.nivelMovilidad : undefined,
          nivelSocial: typeof backendScales.nivelSocial === 'number' ? backendScales.nivelSocial : undefined,
          nivelEmocional: typeof backendScales.nivelEmocional === 'number' ? backendScales.nivelEmocional : undefined,
          tieneDiagnostico: (backendScales.tieneDiagnostico as boolean) ?? false,
          diagnosticoEspecifico: (backendScales.diagnosticoEspecifico as string) ?? '',
          temporalidadOrigen: (backendScales.temporalidadOrigen as string) ?? '',
          preferenciaFormato: (backendScales.preferenciaFormato as string) ?? '',
          areasInteres: Array.isArray(backendScales.areasInteres) ? (backendScales.areasInteres as string[]) : [],
          viabilidadEconomica: (backendScales.viabilidadEconomica as string) ?? '',
        },
        hasExisting: true,
      }
    }

    // Si NO tiene escalas contestadas, extraer información previa del perfil si existe (diagnóstico, áreas) pero hasExisting = false
    const p = profile?.profiling as Record<string, unknown> | undefined
    const disabilityTypes = Array.isArray(p?.disability_types)
      ? (p.disability_types as string[])
      : Array.isArray(p?.disabilities)
      ? (p.disabilities as string[])
      : []
    const disability = disabilityTypes.join(', ')
    const goals = Array.isArray(p?.goals)
      ? (p.goals as string[])
      : Array.isArray(profile?.interests)
      ? (profile?.interests as string[])
      : []

    return {
      data: {
        nivelAutonomia: undefined,
        nivelIndependencia: undefined,
        nivelComunicacion: undefined,
        nivelComprension: undefined,
        nivelEnergia: undefined,
        nivelMovilidad: undefined,
        nivelSocial: undefined,
        nivelEmocional: undefined,
        tieneDiagnostico: Boolean(disability),
        diagnosticoEspecifico: disability,
        temporalidadOrigen: '',
        preferenciaFormato: '',
        areasInteres: goals,
        viabilidadEconomica: '',
      },
      hasExisting: false,
    }
  }, [profile])

  const isDataLoading = (isProfileLoading || isOnboardingLoading) && !getStoredScales()

  const [form, setForm] = useState<EscalasVidaValues>(initialData.data)
  // Si no ha contestado, se muestra la portada de conocerte (no el formulario). isEditing solo se activa cuando el usuario decide editar/evaluar directamente.
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [userToggledEdit, setUserToggledEdit] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<number>(1) // 1: Scales, 2: Metadata

  useEffect(() => {
    // Si el usuario no ha forzado el modo edición, sincronizar con el resultado real de la API
    if (!userToggledEdit && !isDataLoading) {
      setForm(initialData.data)
    }
  }, [initialData, userToggledEdit, isDataLoading])

  const handleToggleArea = (id: string) => {
    setForm(f => {
      const currentAreas = f.areasInteres ?? []
      return {
        ...f,
        areasInteres: currentAreas.includes(id)
          ? currentAreas.filter(a => a !== id)
          : [...currentAreas, id],
      }
    })
  }

  const handleSave = async () => {
    try {
      const missing = SCALES.filter(s => form[s.key] === undefined || form[s.key] === null)
      if (missing.length > 0) {
        addToast(`Faltan ${missing.length} dimensión(es) por responder.`, 'error')
        setActiveStep(1)
        return
      }

      const payload: EscalasVidaPayload = {
        ...form,
        nivelAutonomia: Number(form.nivelAutonomia),
        nivelIndependencia: Number(form.nivelIndependencia),
        nivelComunicacion: Number(form.nivelComunicacion),
        nivelComprension: Number(form.nivelComprension),
        nivelEnergia: Number(form.nivelEnergia),
        nivelMovilidad: Number(form.nivelMovilidad),
        nivelSocial: Number(form.nivelSocial),
        nivelEmocional: Number(form.nivelEmocional),
      }
      await saveEscalas.mutateAsync(payload)
      localStorage.setItem('raices_user_scales', JSON.stringify(payload))
      addToast('¡Evaluación de escalas actualizada con éxito!', 'success')
      setUserToggledEdit(true)
      setIsEditing(false)
    } catch (err: unknown) {
      const apiErr = err as ApiError
      addToast(apiErr?.response?.data?.message || 'No se pudo guardar la evaluación. Intenta de nuevo.', 'error')
    }
  }

  // Get catalogs options
  const listTemporalidad: CatalogOption[] = catalogos?.temporalidadOrigen ?? [
    { id: 'nacimiento', label: 'Desde nacimiento' },
    { id: 'infancia', label: 'Infancia' },
    { id: 'adolescencia', label: 'Adolescencia' },
    { id: 'vida_adulta', label: 'Vida adulta' },
    { id: 'progresiva', label: 'Progresiva' },
    { id: 'en_evaluacion', label: 'En evaluación' },
  ]
  const listFormatos: CatalogOption[] = catalogos?.preferenciaFormato ?? [
    { id: 'texto', label: 'Texto', description: 'Artículos, guías y documentos' },
    { id: 'imagenes', label: 'Imágenes', description: 'Infografías y fotos' },
    { id: 'audio', label: 'Audio', description: 'Podcasts y audiolibros' },
    { id: 'video', label: 'Video', description: 'Tutoriales y videos' },
    { id: 'presencial', label: 'Presencial', description: 'Actividades en persona' },
  ]
  const listViabilidad: CatalogOption[] = catalogos?.viabilidadEconomica ?? [
    { id: 'gratuita_becas', label: 'Gratuita o con becas' },
    { id: 'bajo_costo', label: 'Bajo costo' },
    { id: 'moderada', label: 'Costo moderado' },
    { id: 'sin_restricciones', label: 'Sin restricciones' },
  ]
  const listAreas: CatalogOption[] = catalogos?.areasInteres ?? [
    { id: 'salud', label: 'Salud y Terapia' },
    { id: 'educacion', label: 'Educación' },
    { id: 'empleo', label: 'Empleo' },
    { id: 'comunidad', label: 'Comunidad y Recreación' },
  ]

  // Cálculo de promedio general para el resumen
  const avgLevel = useMemo(() => {
    const values = [
      form.nivelAutonomia,
      form.nivelIndependencia,
      form.nivelComunicacion,
      form.nivelComprension,
      form.nivelEnergia,
      form.nivelMovilidad,
      form.nivelSocial,
      form.nivelEmocional,
    ].filter((v): v is number => typeof v === 'number' && !isNaN(v))

    if (values.length === 0) return 0
    const sum = values.reduce((acc, curr) => acc + curr, 0)
    return Math.round((sum / values.length) * 10) / 10
  }, [form])

  const globalStatus = useMemo(() => {
    if (avgLevel >= 3.5) return { label: 'Autonomía alta / Fluida', desc: 'Independencia mayoritaria en actividades cotidianas.', color: 'var(--secondary)', bg: 'var(--secondary-subtle)' }
    if (avgLevel >= 2.5) return { label: 'Autonomía moderada', desc: 'Desempeño con apoyos puntuales o adaptaciones sencillas.', color: 'var(--primary)', bg: 'var(--primary-subtle)' }
    if (avgLevel >= 1.8) return { label: 'Apoyo sustancial', desc: 'Requiere supervisión o asistencia en varias dimensiones.', color: 'var(--color-amarillo)', bg: 'color-mix(in oklch, var(--color-amarillo) 16%, transparent)' }
    if (avgLevel > 0) return { label: 'Acompañamiento integral', desc: 'Asistencia constante y apoyos especializados directos.', color: 'var(--color-coral)', bg: 'color-mix(in oklch, var(--color-coral) 12%, transparent)' }
    return { label: 'Sin evaluación', desc: 'Responde las 8 dimensiones para calibrar tu autonomía.', color: 'var(--fg3)', bg: 'var(--bg-cool)' }
  }, [avgLevel])

  const hasAnswered = hasValidScales(form)

  if (isDataLoading) {
    return (
      <main id="main" className="responsive-main" style={{ '--main-max-width': '960px' } as CSSProperties}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌱</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
            Cargando tus Escalas de Vida...
          </div>
          <p style={{ fontSize: 14, color: 'var(--fg2)', fontFamily: 'var(--font-body)' }}>
            Recuperando tu evaluación y configuración de autonomía.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main id="main" className="responsive-main" style={{ '--main-max-width': '960px' } as CSSProperties}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 0 64px' }}>
      {/* ─────────────────────────────────────────────────────────────
          VISTA 0: PORTADA DE CONOCERTE (Cuando no ha contestado)
          ───────────────────────────────────────────────────────────── */}
      {!hasAnswered && !isEditing ? (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {/* Header motivacional */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: 24,
              padding: '24px 20px',
              background: 'linear-gradient(135deg, rgba(34,155,88,0.08) 0%, rgba(7,59,76,0.05) 100%)',
              borderRadius: 16,
              border: '1px solid rgba(34,155,88,0.15)',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 24,
                fontWeight: 800,
                background: 'linear-gradient(90deg, #229B58 0%, #073B4C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: '0 0 6px',
              }}
            >
              Completa tu perfil
            </h1>
            <p
              style={{
                fontSize: 14,
                color: 'var(--fg2)',
                margin: 0,
                lineHeight: 1.5,
                fontFamily: 'var(--font-body)',
              }}
            >
              Mientras más sepamos sobre ti, mejores recomendaciones podremos darte.<br />
              <strong style={{ color: 'var(--fg1)' }}>Solo te tomará unos minutos.</strong>
            </p>
          </div>

          <OnboardingStageCover
            onStart={() => navigate('/completar-perfil')}
            stageNumber={1}
            stageTitle="1. Conocer quién eres."
            subtitle="Tres pasos para conocerte mejor"
          />

          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <button
              type="button"
              onClick={() => {
                setUserToggledEdit(true)
                setIsEditing(true)
                setActiveStep(1)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                textDecoration: 'underline',
              }}
            >
              O responder directamente la evaluación de las 8 dimensiones aquí
            </button>
          </div>
        </div>
      ) : !isEditing ? (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {/* Header del Dashboard */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 28,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 28,
                    fontWeight: 800,
                    color: 'var(--fg1)',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  🌱 Mis Escalas de Vida
                </h1>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: hasAnswered ? 'var(--secondary)' : 'var(--color-amarillo)',
                    background: hasAnswered ? 'var(--secondary-subtle)' : 'color-mix(in oklch, var(--color-amarillo) 16%, transparent)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {hasAnswered ? '✓ Evaluación guardada' : '⚠️ Pendiente de evaluación'}
                </span>
              </div>
              <p style={{ fontSize: 14.5, color: 'var(--fg2)', margin: 0, lineHeight: 1.5, maxWidth: 560, fontFamily: 'var(--font-body)' }}>
                Esta evaluación refleja tu situación actual y personaliza el Asistente IA, las rutas de desarrollo y las instituciones sugeridas.
              </p>
            </div>

            <button
              onClick={() => {
                setUserToggledEdit(true)
                setIsEditing(true)
                setActiveStep(1)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 'var(--radius-btn)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--fg1)',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.color = 'var(--primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.color = 'var(--fg1)'
              }}
            >
              <span>{hasAnswered ? '✏️' : '📝'}</span>
              {hasAnswered ? 'Actualizar respuestas' : 'Responder evaluación'}
            </button>
          </div>

          {/* Banner de Diagnóstico General */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px 28px',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--secondary)',
                  marginBottom: 6,
                  fontFamily: 'var(--font-display)',
                }}
              >
                Índice global de autonomía
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: 'var(--fg1)',
                  marginBottom: 4,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {globalStatus.label} ({avgLevel} / 4.0)
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--fg2)', lineHeight: 1.45, fontFamily: 'var(--font-body)' }}>
                {globalStatus.desc}
              </div>
            </div>

            {/* Barra de progreso global */}
            <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--fg3)', fontFamily: 'var(--font-body)' }}>
                <span>Nivel 1</span>
                <span>Nivel 4</span>
              </div>
              <div style={{ height: 10, background: 'var(--bg-cool)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${((avgLevel - 1) / 3) * 100}%`,
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Grid de las 8 Escalas de Vida */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 16px', fontFamily: 'var(--font-display)' }}>
              Las 8 Dimensiones de tu Perfil
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: 16,
              }}
            >
              {SCALES.map(scale => {
                const val = Number(form[scale.key] ?? 3)
                const lvl = LEVEL_LABELS[val] ?? LEVEL_LABELS[3]
                const selectedOption = scale.options.find(o => o.val === val)

                return (
                  <div
                    key={scale.key}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: 20,
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 22, background: 'var(--bg-cool)', padding: 6, borderRadius: 'var(--radius-sm)' }}>
                            {scale.icon}
                          </span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg1)', fontFamily: 'var(--font-display)' }}>{scale.label}</div>
                            <div style={{ fontSize: 12.5, color: 'var(--fg3)', fontFamily: 'var(--font-body)' }}>{scale.desc}</div>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: lvl.color,
                            background: lvl.bg,
                            padding: '4px 9px',
                            borderRadius: 'var(--radius-sm)',
                            flexShrink: 0,
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          {lvl.title.split(':')[1]?.trim() || `Nivel ${val}`}
                        </span>
                      </div>

                      {/* 4-segment visual indicator con degradado de azul a verde */}
                      <div style={{ display: 'flex', gap: 5, margin: '10px 0 12px' }}>
                        {[1, 2, 3, 4].map(seg => {
                          const isActive = seg <= val
                          const segmentGradients: Record<number, string> = {
                            1: 'linear-gradient(90deg, var(--primary) 0%, color-mix(in oklch, var(--primary) 70%, var(--secondary) 30%) 100%)',
                            2: 'linear-gradient(90deg, color-mix(in oklch, var(--primary) 70%, var(--secondary) 30%) 0%, color-mix(in oklch, var(--primary) 40%, var(--secondary) 60%) 100%)',
                            3: 'linear-gradient(90deg, color-mix(in oklch, var(--primary) 40%, var(--secondary) 60%) 0%, color-mix(in oklch, var(--primary) 15%, var(--secondary) 85%) 100%)',
                            4: 'linear-gradient(90deg, color-mix(in oklch, var(--primary) 15%, var(--secondary) 85%) 0%, var(--secondary) 100%)',
                          }

                          return (
                            <div
                              key={seg}
                              style={{
                                flex: 1,
                                height: 7,
                                borderRadius: 'var(--radius-sm)',
                                background: isActive
                                  ? segmentGradients[seg]
                                  : 'var(--border-color)',
                                opacity: isActive ? 1 : 0.35,
                                transition: 'all 0.3s ease',
                              }}
                            />
                          )
                        })}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: 'var(--fg1)',
                          background: 'var(--bg-cool)',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          lineHeight: 1.45,
                          fontWeight: 500,
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        "{selectedOption?.label}"
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Preferencias asociadas */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              marginBottom: 36,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 16px', fontFamily: 'var(--font-display)' }}>
              Condición y Preferencias Registradas
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-body)' }}>CONDICIÓN / DIAGNÓSTICO</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', fontFamily: 'var(--font-body)' }}>
                  {form.diagnosticoEspecifico || (form.tieneDiagnostico ? 'Condición registrada' : 'Sin diagnóstico formal')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-body)' }}>TEMPORALIDAD / ORIGEN</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)', fontFamily: 'var(--font-body)' }}>
                  {listTemporalidad.find(t => t.id === form.temporalidadOrigen)?.label || form.temporalidadOrigen || 'No especificado'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-body)' }}>FORMATO PREFERIDO</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)', fontFamily: 'var(--font-body)' }}>
                  {listFormatos.find(f => f.id === form.preferenciaFormato)?.label || form.preferenciaFormato || 'Texto'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-body)' }}>PRESUPUESTO / COSTO</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)', fontFamily: 'var(--font-body)' }}>
                  {listViabilidad.find(v => v.id === form.viabilidadEconomica)?.label || form.viabilidadEconomica || 'No especificado'}
                </div>
              </div>
            </div>

            {form.areasInteres && form.areasInteres.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-body)' }}>ÁREAS DE INTERÉS SELECCIONADAS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {form.areasInteres.map(areaId => {
                    const label = listAreas.find(a => a.id === areaId)?.label || areaId
                    return (
                      <span
                        key={areaId}
                        style={{
                          background: 'var(--primary-subtle)',
                          color: 'var(--primary)',
                          border: '1px solid var(--border-color)',
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 12.5,
                          fontWeight: 600,
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Acciones del pie */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/instituciones')}
              style={{
                flex: 1,
                minWidth: 220,
                padding: '13px 20px',
                borderRadius: 'var(--radius-btn)',
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                color: '#fff',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 14.5,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.92'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              <span>🏛️</span>
              Ver Instituciones Recomendadas
            </button>

            <button
              onClick={() => navigate('/rutas')}
              style={{
                flex: 1,
                minWidth: 220,
                padding: '13px 20px',
                borderRadius: 'var(--radius-btn)',
                background: 'var(--bg-surface)',
                color: 'var(--fg1)',
                border: '1px solid var(--border-color)',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 14.5,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'border-color 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.color = 'var(--primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.color = 'var(--fg1)'
              }}
            >
              <span>🗺️</span>
              Ver Rutas de Desarrollo
            </button>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            VISTA 2: FORMULARIO DE EDICIÓN / REEVALUACIÓN
            ───────────────────────────────────────────────────────────── */
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {/* Header de Edición */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'var(--fg1)',
                  margin: '0 0 6px',
                  letterSpacing: '-0.02em',
                }}
              >
                Actualizar Escalas de Vida
              </h1>
              <p style={{ fontSize: 14.5, color: 'var(--fg2)', margin: 0 }}>
                Selecciona el nivel que mejor represente tu situación actual en cada dimensión.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setUserToggledEdit(true)
                setIsEditing(false)
              }}
              title="Volver"
              aria-label="Volver"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--fg2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-strong)'
                e.currentTarget.style.color = 'var(--fg1)'
                e.currentTarget.style.background = 'var(--bg-cool)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.color = 'var(--fg2)'
                e.currentTarget.style.background = 'var(--bg-surface)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {Icons.x({ s: 18 })}
            </button>
          </div>

          {/* Stepper Tabs */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-btn)',
                border: activeStep === 1 ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: activeStep === 1 ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                color: activeStep === 1 ? 'var(--primary)' : 'var(--fg2)',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>1</span> Las 8 Dimensiones
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-btn)',
                border: activeStep === 2 ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: activeStep === 2 ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                color: activeStep === 2 ? 'var(--primary)' : 'var(--fg2)',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>2</span> Preferencias y Metadatos
            </button>
          </div>

          {/* Step 1: 8 Scales */}
          {activeStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {SCALES.map(scale => {
                const rawVal = form[scale.key]
                const currentLevel = rawVal !== undefined && rawVal !== null ? Number(rawVal) : null
                return (
                  <div
                    key={scale.key}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: 20,
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontSize: 24, padding: 8, background: 'var(--bg-cool)', borderRadius: 'var(--radius-sm)' }}>
                        {scale.icon}
                      </span>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 2px', fontFamily: 'var(--font-display)' }}>
                          {scale.label}
                        </h3>
                        <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, fontFamily: 'var(--font-body)' }}>{scale.desc}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {scale.options.map(opt => {
                        const isSelected = currentLevel !== null && currentLevel === opt.val
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, [scale.key]: opt.val }))}
                            style={{
                              padding: '12px 16px',
                              borderRadius: 'var(--radius-sm)',
                              border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                              background: isSelected ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                              color: isSelected ? 'var(--primary)' : 'var(--fg1)',
                              fontFamily: 'var(--font-body)',
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: 13.5,
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.15s',
                            }}
                          >
                            <span>{opt.label}</span>
                            <span
                              style={{
                                fontSize: 11.5,
                                fontWeight: 700,
                                color: isSelected ? 'var(--secondary)' : 'var(--fg3)',
                                background: isSelected ? 'var(--secondary-subtle)' : 'var(--bg-cool)',
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontFamily: 'var(--font-body)',
                              }}
                            >
                              Nivel {opt.val}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 12 }}>
                <span style={{ fontSize: 13.5, color: 'var(--fg3)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  {SCALES.filter(s => form[s.key] !== undefined && form[s.key] !== null).length} de {SCALES.length} dimensiones respondidas
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const missing = SCALES.filter(s => form[s.key] === undefined || form[s.key] === null)
                    if (missing.length > 0) {
                      addToast(`Por favor responde las ${missing.length} dimensión(es) pendientes antes de continuar.`, 'info')
                      return
                    }
                    setActiveStep(2)
                  }}
                  style={{
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-btn)',
                    padding: '13px 28px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: 14.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '0.92'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  }}
                >
                  Siguiente: Preferencias {Icons.arrowRight({ s: 16 })}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Metadata */}
          {activeStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Diagnóstico */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div>
                  <span style={{ ...labelStyle, display: 'block', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                    ¿Cuentas con un diagnóstico formal?
                  </span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[
                      { val: true, label: 'Sí, cuento con diagnóstico' },
                      { val: false, label: 'No / En proceso de evaluación' },
                    ].map(opt => {
                      const isSelected = form.tieneDiagnostico === opt.val
                      return (
                        <button
                          key={String(opt.val)}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, tieneDiagnostico: opt.val }))}
                          style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: 'var(--radius-btn)',
                            border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                            background: isSelected ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                            color: isSelected ? 'var(--primary)' : 'var(--fg2)',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 700,
                            fontSize: 13.5,
                            cursor: 'pointer',
                          }}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {form.tieneDiagnostico && (
                  <div>
                    <label style={{ ...labelStyle, display: 'block', marginBottom: 6, fontFamily: 'var(--font-body)' }}>
                      Diagnóstico o condición específica
                    </label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Ej. Autismo (TEA), TDAH, Parálisis cerebral, etc."
                      value={form.diagnosticoEspecifico || ''}
                      onChange={e => setForm(f => ({ ...f, diagnosticoEspecifico: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {/* Temporalidad y Formato */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                  boxShadow: 'var(--shadow-sm)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                <div>
                  <label style={{ ...labelStyle, display: 'block', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                    Origen / Temporalidad
                  </label>
                  <CustomSelect
                    options={listTemporalidad.map(t => ({ value: t.id, label: t.label }))}
                    value={form.temporalidadOrigen || ''}
                    onChange={val => setForm(f => ({ ...f, temporalidadOrigen: String(val) }))}
                    placeholder="Selecciona una opción..."
                    minWidth="100%"
                  />
                </div>

                <div>
                  <label style={{ ...labelStyle, display: 'block', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                    Formato de contenido preferido
                  </label>
                  <CustomSelect
                    options={listFormatos.map(f => ({ value: f.id, label: `${f.label}${f.description ? ` — ${f.description}` : ''}` }))}
                    value={form.preferenciaFormato || ''}
                    onChange={val => setForm(f => ({ ...f, preferenciaFormato: String(val) }))}
                    placeholder="Selecciona un formato..."
                    minWidth="100%"
                  />
                </div>
              </div>

              {/* Presupuesto */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span style={{ ...labelStyle, display: 'block', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
                  Presupuesto / Viabilidad económica
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {listViabilidad.map(v => {
                    const isChecked = form.viabilidadEconomica === v.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, viabilidadEconomica: v.id }))}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${isChecked ? 'var(--primary)' : 'var(--border-color)'}`,
                          background: isChecked ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                          color: isChecked ? 'var(--primary)' : 'var(--fg2)',
                          fontFamily: 'var(--font-body)',
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            background: isChecked ? 'var(--primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                          }}
                        >
                          {isChecked && Icons.check({ s: 12 })}
                        </div>
                        {v.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Áreas de Interés */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <label style={{ ...labelStyle, display: 'block', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
                  Áreas de interés principales
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {listAreas.map(area => {
                    const isChecked = form.areasInteres?.includes(area.id)
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => handleToggleArea(area.id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${isChecked ? 'var(--primary)' : 'var(--border-color)'}`,
                          background: isChecked ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                          color: isChecked ? 'var(--primary)' : 'var(--fg2)',
                          fontFamily: 'var(--font-body)',
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            background: isChecked ? 'var(--primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                          }}
                        >
                          {isChecked && Icons.check({ s: 12 })}
                        </div>
                        {area.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Acciones de Edición */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  style={{
                    padding: '13px 24px',
                    borderRadius: 'var(--radius-btn)',
                    background: 'var(--bg-surface)',
                    border: '1.5px solid var(--border-color)',
                    color: 'var(--fg1)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.color = 'var(--primary)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                    e.currentTarget.style.color = 'var(--fg1)'
                  }}
                >
                  {Icons.arrowLeft({ s: 16 })} Volver a dimensiones
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveEscalas.isPending}
                  style={{
                    padding: '13px 28px',
                    borderRadius: 'var(--radius-btn)',
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: 14.5,
                    cursor: saveEscalas.isPending ? 'not-allowed' : 'pointer',
                    opacity: saveEscalas.isPending ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    if (!saveEscalas.isPending) {
                      e.currentTarget.style.opacity = '0.92'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!saveEscalas.isPending) {
                      e.currentTarget.style.opacity = '1'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                    }
                  }}
                >
                  {saveEscalas.isPending ? 'Guardando...' : 'Guardar y Ver Resultados'} {Icons.check({ s: 16 })}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </main>
  )
}
