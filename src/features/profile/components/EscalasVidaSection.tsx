import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSaveEscalasVida, useProfile } from '@features/profile/hooks/useProfile'
import { useOnboardingStatus } from '@features/institutions/hooks/useRecommendations'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, labelStyle } from '@shared/components/shared'
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

export const SCALES: EscalaVidaItem[] = [
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

export const LEVEL_LABELS: Record<number, { title: string; color: string; bg: string }> = {
  1: { title: 'Apoyo constante', color: 'var(--color-coral)', bg: 'color-mix(in oklch, var(--color-coral) 12%, transparent)' },
  2: { title: 'Apoyo frecuente', color: 'var(--color-amarillo)', bg: 'color-mix(in oklch, var(--color-amarillo) 16%, transparent)' },
  3: { title: 'Apoyo puntual', color: 'var(--primary)', bg: 'var(--primary-subtle)' },
  4: { title: 'Autónomo', color: 'var(--secondary)', bg: 'var(--secondary-subtle)' },
}

export function hasValidScales(data?: Partial<EscalasVidaValues> | Record<string, unknown> | null): boolean {
  if (!data || typeof data !== 'object') return false
  const keys = [
    ['nivelAutonomia', 'autonomia'],
    ['nivelIndependencia', 'independencia'],
    ['nivelComunicacion', 'comunicacion'],
    ['nivelComprension', 'comprension'],
    ['nivelEnergia', 'energia'],
    ['nivelMovilidad', 'movilidad'],
    ['nivelSocial', 'social'],
    ['nivelEmocional', 'emocional'],
  ]
  const answered = keys.filter(([k1, k2]) => {
    const v = (data as Record<string, unknown>)[k1] ?? (data as Record<string, unknown>)[k2]
    return typeof v === 'number' && Number(v) >= 1
  }).length
  return answered >= 4
}

export function isAutoGeneratedDummyScales(data?: Partial<EscalasVidaValues> | Record<string, unknown> | null): boolean {
  if (!data || typeof data !== 'object') return false
  const getVal = (k1: string, k2: string) => {
    const v = (data as Record<string, unknown>)[k1] ?? (data as Record<string, unknown>)[k2]
    return typeof v === 'number' ? v : Number(v)
  }
  return (
    getVal('nivelAutonomia', 'autonomia') === 3 &&
    getVal('nivelIndependencia', 'independencia') === 3 &&
    (getVal('nivelComunicacion', 'comunicacion') === 4 || getVal('nivelComunicacion', 'comunicacion') === 3) &&
    getVal('nivelComprension', 'comprension') === 3 &&
    getVal('nivelEnergia', 'energia') === 3 &&
    getVal('nivelMovilidad', 'movilidad') === 3 &&
    getVal('nivelSocial', 'social') === 3 &&
    getVal('nivelEmocional', 'emocional') === 3
  )
}

export function getStoredScales(): EscalasVidaValues | null {
  try {
    const raw = localStorage.getItem('raices_user_scales')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && hasValidScales(parsed)) {
        return {
          nivelAutonomia: typeof parsed.nivelAutonomia === 'number' ? parsed.nivelAutonomia : typeof parsed.autonomia === 'number' ? parsed.autonomia : undefined,
          nivelIndependencia: typeof parsed.nivelIndependencia === 'number' ? parsed.nivelIndependencia : typeof parsed.independencia === 'number' ? parsed.independencia : undefined,
          nivelComunicacion: typeof parsed.nivelComunicacion === 'number' ? parsed.nivelComunicacion : typeof parsed.comunicacion === 'number' ? parsed.comunicacion : undefined,
          nivelComprension: typeof parsed.nivelComprension === 'number' ? parsed.nivelComprension : typeof parsed.comprension === 'number' ? parsed.comprension : undefined,
          nivelEnergia: typeof parsed.nivelEnergia === 'number' ? parsed.nivelEnergia : typeof parsed.energia === 'number' ? parsed.energia : undefined,
          nivelMovilidad: typeof parsed.nivelMovilidad === 'number' ? parsed.nivelMovilidad : typeof parsed.movilidad === 'number' ? parsed.movilidad : undefined,
          nivelSocial: typeof parsed.nivelSocial === 'number' ? parsed.nivelSocial : typeof parsed.social === 'number' ? parsed.social : undefined,
          nivelEmocional: typeof parsed.nivelEmocional === 'number' ? parsed.nivelEmocional : typeof parsed.emocional === 'number' ? parsed.emocional : undefined,
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

export default function EscalasVidaSection() {
  const navigate = useNavigate()
  const { addToast } = useUiStore()
  const saveEscalas = useSaveEscalasVida()
  const { data: catalogos } = useCatalogos()
  const { data: profile, isLoading: isProfileLoading } = useProfile()
  const { isLoading: isOnboardingLoading } = useOnboardingStatus()

  // Detectar si el usuario eligió "explorar por mi cuenta"
  const isExplorarSolo = useMemo(() => {
    const rawProfile = profile as unknown as Record<string, unknown> | undefined
    const profiling = rawProfile?.profiling as Record<string, unknown> | undefined
    return Boolean(
      rawProfile?.preferenciasAcompanamiento === 'explorar_solo' ||
      rawProfile?.preferencias_acompanamiento === 'explorar_solo' ||
      profiling?.preferenciasAcompanamiento === 'explorar_solo' ||
      localStorage.getItem('raices_acompanamiento') === 'explorar_solo' ||
      localStorage.getItem('raices_onboarding_progress_tutor')?.includes('explorar_solo') ||
      localStorage.getItem('raices_onboarding_progress_pcd')?.includes('explorar_solo')
    )
  }, [profile])

  // Resolver escalas guardadas (de localStorage o de perfil)
  // Resolver escalas guardadas (de perfil en backend o de localStorage)
  const initialData = useMemo(() => {
    // 1. Prioridad: escalas guardadas en el perfil de la base de datos
    const rawProfile = profile as unknown as Record<string, unknown> | undefined
    const backendScales = (rawProfile?.escalasVida || (rawProfile?.perfilesExtendidos as Record<string, unknown> | undefined)?.escalasVida) as Record<string, unknown> | undefined

    if (backendScales && typeof backendScales === 'object' && hasValidScales(backendScales as Partial<EscalasVidaValues>)) {
      return {
        data: {
          nivelAutonomia: (backendScales.nivelAutonomia ?? backendScales.autonomia) as number | undefined,
          nivelIndependencia: (backendScales.nivelIndependencia ?? backendScales.independencia) as number | undefined,
          nivelComunicacion: (backendScales.nivelComunicacion ?? backendScales.comunicacion) as number | undefined,
          nivelComprension: (backendScales.nivelComprension ?? backendScales.comprension) as number | undefined,
          nivelEnergia: (backendScales.nivelEnergia ?? backendScales.energia) as number | undefined,
          nivelMovilidad: (backendScales.nivelMovilidad ?? backendScales.movilidad) as number | undefined,
          nivelSocial: (backendScales.nivelSocial ?? backendScales.social) as number | undefined,
          nivelEmocional: (backendScales.nivelEmocional ?? backendScales.emocional) as number | undefined,
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

    // 2. Respaldo: escalas guardadas localmente
    const stored = getStoredScales()
    if (stored && hasValidScales(stored)) {
      return { data: stored, hasExisting: true }
    }

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

    let userTemporalidad = 'nacimiento'
    let userFormato = 'texto'
    let userViabilidad = 'sin_restricciones'
    try {
      const rawProg = localStorage.getItem('raices_onboarding_progress_pcd') || localStorage.getItem('raices_onboarding_progress_tutor')
      if (rawProg) {
        const prog = JSON.parse(rawProg)
        const d = prog?.data
        if (d?.conditionData?.temporalidad) userTemporalidad = d.conditionData.temporalidad
        if (Array.isArray(d?.formatos) && d.formatos[0]) {
          userFormato = d.formatos[0] === 'persona' ? 'presencial' : d.formatos[0]
        }
        if (d?.viabilidad) userViabilidad = d.viabilidad
      }
    } catch {}

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
        temporalidadOrigen: userTemporalidad,
        preferenciaFormato: userFormato,
        areasInteres: goals,
        viabilidadEconomica: userViabilidad,
      },
      hasExisting: false,
    }
  }, [profile, isExplorarSolo])

  const isDataLoading = (isProfileLoading || isOnboardingLoading) && !getStoredScales()

  const [form, setForm] = useState<EscalasVidaValues>(initialData.data)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [userToggledEdit, setUserToggledEdit] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<number>(1) // 1: Scales, 2: Metadata

  useEffect(() => {
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
        addToast(`Faltan ${missing.length} área(s) de tu camino por completar.`, 'info')
        setActiveStep(1)
        return
      }

      const validTemporalidades = ['nacimiento', 'infancia', 'adolescencia', 'vida_adulta', 'progresiva', 'en_evaluacion']
      const validFormatos = ['texto', 'imagenes', 'audio', 'video', 'presencial']

      let temporalidad = String(form.temporalidadOrigen || '').trim()
      if (!validTemporalidades.includes(temporalidad)) {
        temporalidad = 'nacimiento'
      }

      let formato = String(form.preferenciaFormato || '').trim()
      if (formato === 'persona') {
        formato = 'presencial'
      }
      if (!validFormatos.includes(formato)) {
        formato = 'texto'
      }

      const payload: EscalasVidaPayload = {
        ...form,
        temporalidadOrigen: temporalidad,
        preferenciaFormato: formato,
        viabilidadEconomica: form.viabilidadEconomica || 'sin_restricciones',
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
      localStorage.setItem('raices_escalas_evaluadas_manualmente', 'true')
      localStorage.setItem('raices_user_scales_manual', 'true')
      addToast('¡Tu camino de vida se guardó con éxito!', 'success')
      setUserToggledEdit(true)
      setIsEditing(false)
    } catch (err: unknown) {
      const apiErr = err as ApiError
      addToast(apiErr?.response?.data?.message || 'No se pudieron guardar los cambios. Intenta de nuevo.', 'error')
    }
  }

  // Get catalogs options
  const listTemporalidad: CatalogOption[] = catalogos?.temporalidadOrigen ?? [
    { id: 'nacimiento', label: 'Desde nacimiento' },
    { id: 'infancia', label: 'Infancia' },
    { id: 'adolescencia', label: 'Adolescencia' },
    { id: 'vida_adulta', label: 'Vida adulta' },
    { id: 'progresiva', label: 'Progresiva' },
    { id: 'en_evaluacion', label: 'En proceso' },
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
    if (avgLevel >= 3.5) return { label: 'Autonomía alta / Fluida', desc: 'Te desenvuelves con gran independencia en la mayoría de tus actividades cotidianas.', color: 'var(--secondary)', bg: 'var(--secondary-subtle)' }
    if (avgLevel >= 2.5) return { label: 'Autonomía con apoyos puntuales', desc: 'Realizas tus actividades cotidianas con apoyos o adaptaciones sencillas.', color: 'var(--primary)', bg: 'var(--primary-subtle)' }
    if (avgLevel >= 1.8) return { label: 'Acompañamiento regular', desc: 'Cuentas con apoyo y orientación en varias actividades de tu día a día.', color: 'var(--color-amarillo)', bg: 'color-mix(in oklch, var(--color-amarillo) 16%, transparent)' }
    if (avgLevel > 0) return { label: 'Acompañamiento continuo', desc: 'Cuentas con asistencia cercana y acompañamiento en tus actividades cotidianas.', color: 'var(--color-coral)', bg: 'color-mix(in oklch, var(--color-coral) 12%, transparent)' }
    return { label: 'Por definir', desc: 'Comparte cómo recorres tu camino de vida para sugerirte los apoyos ideales para ti.', color: 'var(--fg3)', bg: 'var(--bg-cool)' }
  }, [avgLevel])

  const hasAnswered = hasValidScales(form)

  if (isDataLoading) {
    return (
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '36px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🌱</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
          Cargando tu Camino de Vida...
        </div>
        <p style={{ fontSize: 13, color: 'var(--fg2)', fontFamily: 'var(--font-body)', margin: 0 }}>
          Recuperando tu camino de vida y preferencias.
        </p>
      </div>
    )
  }

  return (
    <div id="escalas-de-vida" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {!isEditing ? (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {/* Header de Tu Camino de Vida */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: '24px 28px',
              marginBottom: 20,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
                flexWrap: 'wrap',
                marginBottom: 20,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 22,
                      fontWeight: 800,
                      color: 'var(--fg1)',
                      margin: 0,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    🌱 Tu Camino de Vida
                  </h3>
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
                    {hasAnswered ? '✓ Camino registrado' : 'ℹ️ Por trazar'}
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--fg2)', margin: 0, lineHeight: 1.5, maxWidth: 540, fontFamily: 'var(--font-body)' }}>
                  Estas áreas reflejan cómo recorres tu camino cada día y permiten que el Asistente IA, las rutas y las instituciones se adapten mejor a ti.
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
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-btn)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--fg1)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: 13.5,
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
                {hasAnswered ? 'Actualizar mi camino' : 'Trazar mi camino'}
              </button>
            </div>

            {/* Aviso cuando aún no se han registrado las áreas del camino */}
            {!hasAnswered && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(34,155,88,0.08) 0%, rgba(7,59,76,0.05) 100%)',
                  border: '1px solid rgba(34,155,88,0.22)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 240 }}>
                  <span style={{ fontSize: 24, background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    🧭
                  </span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--fg1)', fontFamily: 'var(--font-display)', marginBottom: 2 }}>
                      {isExplorarSolo
                        ? 'Estás en modo "Explorar por mi cuenta"'
                        : 'Tu camino aún está por trazarse'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--fg2)', fontFamily: 'var(--font-body)', lineHeight: 1.45 }}>
                      {isExplorarSolo
                        ? 'Como elegiste explorar por tu cuenta, no asumimos nada por ti. Las 8 áreas de tu camino están listas para cuando decidas compartirlas.'
                        : 'Aún no has registrado las áreas de tu camino. Permanecerán abiertas para que las completes a tu propio ritmo cuando lo desees.'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserToggledEdit(true)
                    setIsEditing(true)
                    setActiveStep(1)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-btn)',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-body)',
                    boxShadow: '0 2px 8px rgba(34,155,88,0.25)',
                  }}
                >
                  <span>📝</span>
                  Trazar mi camino
                </button>
              </div>
            )}

            {/* Panorama de Autonomía */}
            <div
              style={{
                background: 'var(--bg-cool)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 220 }}>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: hasAnswered ? 'var(--secondary)' : 'var(--fg3)',
                    marginBottom: 4,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  Tu panorama de autonomía
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: 'var(--fg1)',
                    marginBottom: 3,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {hasAnswered ? globalStatus.label : 'Por definir'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--fg2)', lineHeight: 1.4, fontFamily: 'var(--font-body)' }}>
                  {globalStatus.desc}
                </div>
              </div>

              {/* Indicador visual de acompañamiento a autonomía */}
              <div style={{ width: 180, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, color: 'var(--fg3)', fontFamily: 'var(--font-body)' }}>
                  <span>{hasAnswered ? 'Mayor apoyo' : 'Apoyo'}</span>
                  <span>{hasAnswered ? 'Mayor autonomía' : 'Autonomía'}</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: hasAnswered ? `${Math.max(0, Math.min(100, ((avgLevel - 1) / 3) * 100))}%` : '0%',
                      background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Grid de las 8 Áreas de tu Camino */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 14px', fontFamily: 'var(--font-display)' }}>
              Las 8 áreas de tu camino de vida
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 14,
              }}
            >
              {SCALES.map(scale => {
                const rawVal = form[scale.key]
                const isAnswered = typeof rawVal === 'number' && Number(rawVal) >= 1
                const val = isAnswered ? Number(rawVal) : null
                const lvl = val !== null ? (LEVEL_LABELS[val] ?? LEVEL_LABELS[3]) : null
                const selectedOption = val !== null ? scale.options.find(o => o.val === val) : null

                return (
                  <div
                    key={scale.key}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 12,
                      padding: 18,
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 20, background: 'var(--bg-cool)', padding: 5, borderRadius: 'var(--radius-sm)' }}>
                            {scale.icon}
                          </span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--fg1)', fontFamily: 'var(--font-display)' }}>{scale.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--fg3)', fontFamily: 'var(--font-body)' }}>{scale.desc}</div>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: lvl ? lvl.color : 'var(--fg3)',
                            background: lvl ? lvl.bg : 'var(--bg-cool)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            flexShrink: 0,
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          {lvl ? lvl.title : 'Por definir'}
                        </span>
                      </div>

                      {/* Indicador visual de 4 segmentos */}
                      <div style={{ display: 'flex', gap: 4, margin: '8px 0 10px' }}>
                        {[1, 2, 3, 4].map(seg => {
                          const isActive = val !== null && seg <= val
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
                                height: 6,
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
                          fontSize: 12.5,
                          color: val !== null ? 'var(--fg1)' : 'var(--fg3)',
                          background: 'var(--bg-cool)',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          lineHeight: 1.4,
                          fontWeight: val !== null ? 500 : 400,
                          fontStyle: val !== null ? 'normal' : 'italic',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {selectedOption ? `"${selectedOption.label}"` : 'Aún no has registrado esta área de tu camino — Haz clic en "Trazar mi camino" para compartirla cuando gustes.'}
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
              borderRadius: 14,
              padding: 22,
              marginBottom: 20,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 14px', fontFamily: 'var(--font-display)' }}>
              Condición y Preferencias Registradas
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--fg3)', fontWeight: 600, marginBottom: 3, fontFamily: 'var(--font-body)' }}>CONDICIÓN / DIAGNÓSTICO</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fg1)', fontFamily: 'var(--font-body)' }}>
                  {form.diagnosticoEspecifico || (form.tieneDiagnostico ? 'Condición registrada' : 'Sin diagnóstico formal')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, color: 'var(--fg3)', fontWeight: 600, marginBottom: 3, fontFamily: 'var(--font-body)' }}>TEMPORALIDAD / ORIGEN</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg1)', fontFamily: 'var(--font-body)' }}>
                  {listTemporalidad.find(t => t.id === form.temporalidadOrigen)?.label || form.temporalidadOrigen || 'No especificado'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, color: 'var(--fg3)', fontWeight: 600, marginBottom: 3, fontFamily: 'var(--font-body)' }}>FORMATO PREFERIDO</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg1)', fontFamily: 'var(--font-body)' }}>
                  {listFormatos.find(f => f.id === form.preferenciaFormato)?.label || form.preferenciaFormato || 'Texto'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, color: 'var(--fg3)', fontWeight: 600, marginBottom: 3, fontFamily: 'var(--font-body)' }}>PRESUPUESTO / COSTO</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg1)', fontFamily: 'var(--font-body)' }}>
                  {listViabilidad.find(v => v.id === form.viabilidadEconomica)?.label || form.viabilidadEconomica || 'No especificado'}
                </div>
              </div>
            </div>

            {form.areasInteres && form.areasInteres.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11.5, color: 'var(--fg3)', fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-body)' }}>ÁREAS DE INTERÉS SELECCIONADAS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.areasInteres.map(areaId => {
                    const label = listAreas.find(a => a.id === areaId)?.label || areaId
                    return (
                      <span
                        key={areaId}
                        style={{
                          background: 'var(--primary-subtle)',
                          color: 'var(--primary)',
                          border: '1px solid var(--border-color)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 12,
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

          {/* Acciones directas a Rutas e Instituciones */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/instituciones')}
              style={{
                flex: 1,
                minWidth: 200,
                padding: '11px 18px',
                borderRadius: 'var(--radius-btn)',
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                color: '#fff',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 13.5,
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
                minWidth: 200,
                padding: '11px 18px',
                borderRadius: 'var(--radius-btn)',
                background: 'var(--bg-surface)',
                color: 'var(--fg1)',
                border: '1px solid var(--border-color)',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 13.5,
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
              Ver Mi Camino
            </button>
          </div>
        </div>
      ) : (
        /* Formulario para registrar / actualizar el camino */
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 24, boxShadow: 'var(--shadow-sm)', animation: 'fadeIn 0.3s ease-out' }}>
          {/* Header de Configuración */}
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 800,
                  color: 'var(--fg1)',
                  margin: '0 0 4px',
                  letterSpacing: '-0.02em',
                }}
              >
                Tu Camino de Vida
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--fg2)', margin: 0 }}>
                Elige la opción que mejor describa cómo vives tu día a día en cada área de tu camino.
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
                width: 34,
                height: 34,
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
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.color = 'var(--fg2)'
                e.currentTarget.style.background = 'var(--bg-surface)'
              }}
            >
              {Icons.x({ s: 16 })}
            </button>
          </div>

          {/* Stepper Tabs */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: 'var(--radius-btn)',
                border: activeStep === 1 ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: activeStep === 1 ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                color: activeStep === 1 ? 'var(--primary)' : 'var(--fg2)',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span>1</span> Áreas de tu camino
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: 'var(--radius-btn)',
                border: activeStep === 2 ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: activeStep === 2 ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                color: activeStep === 2 ? 'var(--primary)' : 'var(--fg2)',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span>2</span> Preferencias y Metadatos
            </button>
          </div>

          {/* Step 1: 8 Scales */}
          {activeStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {SCALES.map(scale => {
                const rawVal = form[scale.key]
                const currentLevel = rawVal !== undefined && rawVal !== null ? Number(rawVal) : null
                return (
                  <div
                    key={scale.key}
                    style={{
                      background: 'var(--bg-cool)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 10,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 20, padding: 6, background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                        {scale.icon}
                      </span>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 2px', fontFamily: 'var(--font-display)' }}>
                          {scale.label}
                        </h4>
                        <p style={{ fontSize: 12.5, color: 'var(--fg2)', margin: 0, fontFamily: 'var(--font-body)' }}>{scale.desc}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {scale.options.map(opt => {
                        const isSelected = currentLevel !== null && currentLevel === opt.val
                        const supportLabel = LEVEL_LABELS[opt.val]?.title ?? ''
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, [scale.key]: opt.val }))}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-sm)',
                              border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                              background: isSelected ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                              color: isSelected ? 'var(--primary)' : 'var(--fg1)',
                              fontFamily: 'var(--font-body)',
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: 13,
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
                                fontSize: 11,
                                fontWeight: 700,
                                color: isSelected ? 'var(--secondary)' : 'var(--fg3)',
                                background: isSelected ? 'var(--secondary-subtle)' : 'var(--bg-cool)',
                                padding: '2px 7px',
                                borderRadius: 'var(--radius-sm)',
                                fontFamily: 'var(--font-body)',
                              }}
                            >
                              {supportLabel}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--fg3)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  {SCALES.filter(s => form[s.key] !== undefined && form[s.key] !== null).length} de {SCALES.length} áreas de tu camino completadas
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const missing = SCALES.filter(s => form[s.key] === undefined || form[s.key] === null)
                    if (missing.length > 0) {
                      addToast(`Faltan ${missing.length} área(s) de tu camino por completar antes de continuar.`, 'info')
                      return
                    }
                    setActiveStep(2)
                  }}
                  style={{
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-btn)',
                    padding: '11px 22px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  Siguiente: Preferencias {Icons.arrowRight({ s: 15 })}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Metadata */}
          {activeStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Diagnóstico */}
              <div
                style={{
                  background: 'var(--bg-cool)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div>
                  <span style={{ ...labelStyle, display: 'block', marginBottom: 6, fontFamily: 'var(--font-body)' }}>
                    ¿Cuentas con un diagnóstico formal?
                  </span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { val: true, label: 'Sí, cuento con diagnóstico' },
                      { val: false, label: 'No / En proceso' },
                    ].map(opt => {
                      const isSelected = form.tieneDiagnostico === opt.val
                      return (
                        <button
                          key={String(opt.val)}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, tieneDiagnostico: opt.val }))}
                          style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: 'var(--radius-btn)',
                            border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                            background: isSelected ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                            color: isSelected ? 'var(--primary)' : 'var(--fg2)',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 700,
                            fontSize: 13,
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
                    <label style={{ ...labelStyle, display: 'block', marginBottom: 4, fontFamily: 'var(--font-body)' }}>
                      Diagnóstico o condición específica
                    </label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Ej. Autismo (TEA), TDAH, Parálisis cerebral, etc."
                      value={form.diagnosticoEspecifico || ''}
                      onChange={e => setForm(f => ({ ...f, diagnosticoEspecifico: e.target.value }))}
                      style={{ fontSize: 13 }}
                    />
                  </div>
                )}
              </div>

              {/* Temporalidad y Formato */}
              <div
                style={{
                  background: 'var(--bg-cool)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  padding: 16,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 14,
                }}
              >
                <div>
                  <label style={{ ...labelStyle, display: 'block', marginBottom: 6, fontFamily: 'var(--font-body)' }}>
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
                  <label style={{ ...labelStyle, display: 'block', marginBottom: 6, fontFamily: 'var(--font-body)' }}>
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
                  background: 'var(--bg-cool)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <span style={{ ...labelStyle, display: 'block', marginBottom: 10, fontFamily: 'var(--font-body)' }}>
                  Presupuesto / Viabilidad económica
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                  {listViabilidad.map(v => {
                    const isChecked = form.viabilidadEconomica === v.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, viabilidadEconomica: v.id }))}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${isChecked ? 'var(--primary)' : 'var(--border-color)'}`,
                          background: isChecked ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                          color: isChecked ? 'var(--primary)' : 'var(--fg2)',
                          fontFamily: 'var(--font-body)',
                          fontWeight: 600,
                          fontSize: 12.5,
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            background: isChecked ? 'var(--primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                          }}
                        >
                          {isChecked && Icons.check({ s: 11 })}
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
                  background: 'var(--bg-cool)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <label style={{ ...labelStyle, display: 'block', marginBottom: 10, fontFamily: 'var(--font-body)' }}>
                  Áreas de interés principales
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                  {listAreas.map(area => {
                    const isChecked = form.areasInteres?.includes(area.id)
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => handleToggleArea(area.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${isChecked ? 'var(--primary)' : 'var(--border-color)'}`,
                          background: isChecked ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                          color: isChecked ? 'var(--primary)' : 'var(--fg2)',
                          fontFamily: 'var(--font-body)',
                          fontWeight: 600,
                          fontSize: 12.5,
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            background: isChecked ? 'var(--primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                          }}
                        >
                          {isChecked && Icons.check({ s: 11 })}
                        </div>
                        {area.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Acciones de Edición */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  style={{
                    padding: '11px 20px',
                    borderRadius: 'var(--radius-btn)',
                    background: 'var(--bg-surface)',
                    border: '1.5px solid var(--border-color)',
                    color: 'var(--fg1)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {Icons.arrowLeft({ s: 15 })} Volver a las áreas de tu camino
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveEscalas.isPending}
                  style={{
                    padding: '11px 24px',
                    borderRadius: 'var(--radius-btn)',
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: saveEscalas.isPending ? 'not-allowed' : 'pointer',
                    opacity: saveEscalas.isPending ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {saveEscalas.isPending ? 'Guardando...' : 'Guardar mi camino'} {Icons.check({ s: 15 })}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
