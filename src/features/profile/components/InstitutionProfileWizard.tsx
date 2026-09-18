import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'
import { WizardNavButtons, CheckChip, WizardProgress } from '@features/auth/components/WizardUI'
import { useQueryClient } from '@tanstack/react-query'
import { Icons } from '@shared/components/shared'

type InstitutionStep =
  | 'services'
  | 'disabilities'
  | 'accessibility'
  | 'target_ages'
  | 'contact_info'
  | 'done'

const STEP_ORDER: InstitutionStep[] = [
  'services',
  'disabilities',
  'accessibility',
  'target_ages',
  'contact_info',
]
const TOTAL_STEPS = STEP_ORDER.length

const SERVICIOS_OPCIONES = [
  'Rehabilitación física / Fisioterapia',
  'Educación especial y apoyo pedagógico',
  'Talleres ocupacionales y capacitación laboral',
  'Atención psicológica y salud mental',
  'Asesoría jurídica y derechos humanos',
  'Terapia de lenguaje y comunicación',
  'Actividades deportivas y recreativas adaptadas',
  'Grupos de apoyo para familias y cuidadores',
]

const DISCAPACIDADES_OPCIONES = [
  'Discapacidad Motriz',
  'Discapacidad Visual',
  'Discapacidad Auditiva',
  'Discapacidad Intelectual',
  'Trastorno del Espectro Autista (TEA)',
  'Discapacidad Psicosocial',
  'Discapacidad Múltiple',
  'Atención General / Todas',
]

const ACCESIBILIDAD_OPCIONES = [
  'Rampas de acceso',
  'Elevador o planta baja',
  'Baños adaptados',
  'Señalética en Braille / Relieve',
  'Intérprete de Lengua de Señas (LSM)',
  'Estacionamiento reservado',
  'Materiales en formato lectura fácil / macrotipo',
  'Personal capacitado en accesibilidad',
]

const EDADES_OPCIONES = [
  { id: 'infancia', label: 'Infancia (0 a 12 años)' },
  { id: 'adolescencia', label: 'Adolescencia (13 a 17 años)' },
  { id: 'adulto_joven', label: 'Adultos Jóvenes (18 a 29 años)' },
  { id: 'adultos', label: 'Adultos (30 a 59 años)' },
  { id: 'adultos_mayores', label: 'Adultos Mayores (60+ años)' },
]

export interface InstitutionProfileWizardProps {
  onDone?: () => void
}

export default function InstitutionProfileWizard({ onDone }: InstitutionProfileWizardProps) {
  const { addToast } = useUiStore()
  const nav = useNavigate()
  const qc = useQueryClient()

  const [step, setStep] = useState<InstitutionStep>('services')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const [services, setServices] = useState<string[]>([])
  const [disabilities, setDisabilities] = useState<string[]>([])
  const [accessibility, setAccessibility] = useState<string[]>([])
  const [targetAges, setTargetAges] = useState<string[]>([])
  const [contactInfo, setContactInfo] = useState({
    telefonoPublico: '',
    horarioAtencion: '',
    sitioWeb: '',
  })

  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const stepIndex = STEP_ORDER.indexOf(step)

  const handleServicesNext = (e: FormEvent) => {
    e.preventDefault()
    if (services.length === 0) {
      setError('Por favor, selecciona al menos un servicio que ofrece tu institución.')
      return
    }
    setError('')
    setStep('disabilities')
  }

  const handleDisabilitiesNext = (e: FormEvent) => {
    e.preventDefault()
    if (disabilities.length === 0) {
      setError('Por favor, selecciona al menos un tipo de discapacidad atendido.')
      return
    }
    setError('')
    setStep('accessibility')
  }

  const handleAccessibilityNext = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setStep('target_ages')
  }

  const handleTargetAgesNext = (e: FormEvent) => {
    e.preventDefault()
    if (targetAges.length === 0) {
      setError('Por favor, selecciona al menos un grupo de edad.')
      return
    }
    setError('')
    setStep('contact_info')
  }

  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')

    try {
      const payload = {
        servicios: services,
        tiposDiscapacidad: disabilities,
        accesibilidad: accessibility,
        edadesAtendidas: targetAges,
        telefonoContacto: contactInfo.telefonoPublico,
        horarioAtencion: contactInfo.horarioAtencion,
        sitioWeb: contactInfo.sitioWeb,
      }

      try {
        await api.put('/instituciones/perfil', payload)
      } catch (err) {
        console.warn('API institucion perfil update fallback:', err)
      }

      localStorage.setItem('raices_institution_profile', JSON.stringify(payload))

      qc.invalidateQueries({ queryKey: ['perfil'] })
      qc.invalidateQueries({ queryKey: ['onboarding-status'] })

      addToast('¡Perfil institucional completado con éxito!', 'success')
      setStep('done')
      if (onDone) onDone()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ocurrió un error al guardar el perfil.'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setSending(false)
    }
  }

  const headingStyle = { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }
  const descStyle = { fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {step !== 'done' && (
        <WizardProgress accent="#229B58" title="Perfil Institucional" stepIndex={stepIndex} totalSteps={TOTAL_STEPS} />
      )}

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.4)',
          color: '#ef4444', padding: '10px 14px', borderRadius: 10, fontSize: 13,
          fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {Icons.shieldAlert({ s: 16 })} {error}
        </div>
      )}

      {/* STEP 1: SERVICIOS */}
      {step === 'services' && (
        <form onSubmit={handleServicesNext} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h2 style={headingStyle}>Servicios e Instalaciones</h2>
            <p style={descStyle}>¿Qué tipo de atención y servicios brinda tu institución?</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SERVICIOS_OPCIONES.map(item => (
              <CheckChip
                key={item}
                label={item}
                selected={services.includes(item)}
                onToggle={() => toggleArrayItem(setServices, item)}
              />
            ))}
          </div>
          <WizardNavButtons onBack={() => nav('/feed')} submitLabel="Continuar" />
        </form>
      )}

      {/* STEP 2: DISCAPACIDADES ATENDIDAS */}
      {step === 'disabilities' && (
        <form onSubmit={handleDisabilitiesNext} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h2 style={headingStyle}>Tipos de Discapacidad</h2>
            <p style={descStyle}>¿A qué poblaciones enfoca sus programas e instalaciones tu institución?</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {DISCAPACIDADES_OPCIONES.map(item => (
              <CheckChip
                key={item}
                label={item}
                selected={disabilities.includes(item)}
                onToggle={() => toggleArrayItem(setDisabilities, item)}
              />
            ))}
          </div>
          <WizardNavButtons onBack={() => setStep('services')} submitLabel="Continuar" />
        </form>
      )}

      {/* STEP 3: ACCESIBILIDAD */}
      {step === 'accessibility' && (
        <form onSubmit={handleAccessibilityNext} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h2 style={headingStyle}>Características de Accesibilidad</h2>
            <p style={descStyle}>¿Con qué elementos de accesibilidad física o comunicativa cuentan?</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {ACCESIBILIDAD_OPCIONES.map(item => (
              <CheckChip
                key={item}
                label={item}
                selected={accessibility.includes(item)}
                onToggle={() => toggleArrayItem(setAccessibility, item)}
              />
            ))}
          </div>
          <WizardNavButtons onBack={() => setStep('disabilities')} submitLabel="Continuar" />
        </form>
      )}

      {/* STEP 4: EDADES ATENDIDAS */}
      {step === 'target_ages' && (
        <form onSubmit={handleTargetAgesNext} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h2 style={headingStyle}>Rangos de Edad Atendidos</h2>
            <p style={descStyle}>Selecciona las etapas de vida a las que van dirigidos sus servicios.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EDADES_OPCIONES.map(opt => (
              <CheckChip
                key={opt.id}
                label={opt.label}
                selected={targetAges.includes(opt.id)}
                onToggle={() => toggleArrayItem(setTargetAges, opt.id)}
              />
            ))}
          </div>
          <WizardNavButtons onBack={() => setStep('accessibility')} submitLabel="Continuar" />
        </form>
      )}

      {/* STEP 5: INFORMACIÓN DE CONTACTO */}
      {step === 'contact_info' && (
        <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h2 style={headingStyle}>Contacto Público</h2>
            <p style={descStyle}>Información visible en el directorio institucional para conectar con la comunidad.</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Teléfono de atención
            </label>
            <input
              type="text"
              className="auth-input"
              placeholder="Ej. (999) 123 4567"
              value={contactInfo.telefonoPublico}
              onChange={e => setContactInfo(prev => ({ ...prev, telefonoPublico: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Horario de atención
            </label>
            <input
              type="text"
              className="auth-input"
              placeholder="Ej. Lunes a Viernes de 8:00 AM a 4:00 PM"
              value={contactInfo.horarioAtencion}
              onChange={e => setContactInfo(prev => ({ ...prev, horarioAtencion: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Sitio web o Redes sociales
            </label>
            <input
              type="url"
              className="auth-input"
              placeholder="https://miinstitucion.org"
              value={contactInfo.sitioWeb}
              onChange={e => setContactInfo(prev => ({ ...prev, sitioWeb: e.target.value }))}
            />
          </div>
          <WizardNavButtons
            onBack={() => setStep('target_ages')}
            submitLabel={sending ? 'Guardando...' : 'Finalizar perfil'}
            submitDisabled={sending}
          />
        </form>
      )}

      {/* STEP DONE */}
      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,155,88,0.12)', color: '#229B58', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icons.check({ s: 32 })}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--fg1)', margin: 0 }}>
            ¡Perfil Institucional Listo!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fg2)', maxWidth: 460, margin: 0, lineHeight: 1.5 }}>
            La comunidad de Raíces ahora puede encontrar tus servicios, información de contacto y accesibilidad.
          </p>
          <button
            className="auth-btn-primary"
            onClick={() => nav('/feed', { replace: true })}
            style={{ marginTop: 12, padding: '12px 28px' }}
          >
            Ir al inicio {Icons.arrowRight({ s: 18 })}
          </button>
        </div>
      )}
    </div>
  )
}
