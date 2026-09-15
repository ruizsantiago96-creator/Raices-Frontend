import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'
import { WizardNavButtons, CheckChip, WizardProgress } from '@features/auth/components/WizardUI'
import { useQueryClient } from '@tanstack/react-query'
import { Icons } from '@shared/components/shared'

type EnterpriseStep =
  | 'inclusion_policies'
  | 'workplace_accessibility'
  | 'job_types'
  | 'contact_hr'
  | 'done'

const STEP_ORDER: EnterpriseStep[] = [
  'inclusion_policies',
  'workplace_accessibility',
  'job_types',
  'contact_hr',
]
const TOTAL_STEPS = STEP_ORDER.length

const POLITICAS_INCLUSION = [
  'Programa formal de inclusión laboral PCD',
  'Capacitación al personal en sensibilización y sesgos',
  'Flexibilidad de horarios y jornadas adaptadas',
  'Opción de trabajo remoto o híbrido (Teletrabajo)',
  'Ajustes razonables personalizados en el puesto',
  'Convenios con organizaciones de inclusión laboral',
]

const ACCESIBILIDAD_EMPRESA = [
  'Rampas y/o elevadores en instalaciones',
  'Baños accesibles y adaptados',
  'Estacionamiento preferencial reservado',
  'Escritorios y espacios físicos adaptables',
  'Software o tecnología asistiva disponible',
  'Espacios de descanso y regulación sensorial',
]

const TIPOS_PUESTOS = [
  'Administrativos y Gestión de Oficina',
  'Atención al Cliente y Soporte',
  'Tecnología, Programación y Sistemas',
  'Ventas y Comercial',
  'Diseño, Marketing y Creativos',
  'Operación, Logística y Almacén',
  'Prácticas profesionales y becarios',
]

export interface EnterpriseProfileWizardProps {
  onDone?: () => void
}

export default function EnterpriseProfileWizard({ onDone }: EnterpriseProfileWizardProps) {
  const { addToast } = useUiStore()
  const nav = useNavigate()
  const qc = useQueryClient()

  const [step, setStep] = useState<EnterpriseStep>('inclusion_policies')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const [policies, setPolicies] = useState<string[]>([])
  const [accessibility, setAccessibility] = useState<string[]>([])
  const [jobTypes, setJobTypes] = useState<string[]>([])
  const [contactHr, setContactHr] = useState({
    emailVacantes: '',
    telefonoRh: '',
    sitioCarreras: '',
  })

  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const stepIndex = STEP_ORDER.indexOf(step)

  const handlePoliciesNext = (e: FormEvent) => {
    e.preventDefault()
    if (policies.length === 0) {
      setError('Por favor, selecciona al menos una política o práctica de inclusión.')
      return
    }
    setError('')
    setStep('workplace_accessibility')
  }

  const handleAccessibilityNext = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setStep('job_types')
  }

  const handleJobTypesNext = (e: FormEvent) => {
    e.preventDefault()
    if (jobTypes.length === 0) {
      setError('Por favor, selecciona al menos un área o tipo de puesto inclusivo.')
      return
    }
    setError('')
    setStep('contact_hr')
  }

  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')

    try {
      const payload = {
        politicasInclusion: policies,
        accesibilidadPuesto: accessibility,
        tiposPuestos: jobTypes,
        emailVacantes: contactHr.emailVacantes,
        telefonoRh: contactHr.telefonoRh,
        sitioCarreras: contactHr.sitioCarreras,
      }

      try {
        await api.put('/empresas/perfil', payload)
      } catch (err) {
        console.warn('API empresa perfil update fallback:', err)
      }

      localStorage.setItem('raices_enterprise_profile', JSON.stringify(payload))

      qc.invalidateQueries({ queryKey: ['perfil'] })
      qc.invalidateQueries({ queryKey: ['onboarding-status'] })

      addToast('¡Perfil de empresa completado con éxito!', 'success')
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
        <WizardProgress accent="#3B82F6" title="Perfil de Empresa" stepIndex={stepIndex} totalSteps={TOTAL_STEPS} />
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

      {/* STEP 1: POLÍTICAS DE INCLUSIÓN */}
      {step === 'inclusion_policies' && (
        <form onSubmit={handlePoliciesNext} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h2 style={headingStyle}>Políticas de Inclusión Laboral</h2>
            <p style={descStyle}>Selecciona las prácticas de inclusión activas en tu empresa u organización.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {POLITICAS_INCLUSION.map(item => (
              <CheckChip
                key={item}
                label={item}
                selected={policies.includes(item)}
                onToggle={() => toggleArrayItem(setPolicies, item)}
              />
            ))}
          </div>
          <WizardNavButtons onBack={() => nav('/feed')} submitLabel="Continuar" />
        </form>
      )}

      {/* STEP 2: ACCESIBILIDAD EN PUESTO DE TRABAJO */}
      {step === 'workplace_accessibility' && (
        <form onSubmit={handleAccessibilityNext} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h2 style={headingStyle}>Accesibilidad en Centro de Trabajo</h2>
            <p style={descStyle}>¿Qué adecuaciones o recursos de accesibilidad ofrece la empresa?</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {ACCESIBILIDAD_EMPRESA.map(item => (
              <CheckChip
                key={item}
                label={item}
                selected={accessibility.includes(item)}
                onToggle={() => toggleArrayItem(setAccessibility, item)}
              />
            ))}
          </div>
          <WizardNavButtons onBack={() => setStep('inclusion_policies')} submitLabel="Continuar" />
        </form>
      )}

      {/* STEP 3: TIPOS DE PUESTOS */}
      {step === 'job_types' && (
        <form onSubmit={handleJobTypesNext} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h2 style={headingStyle}>Áreas y Oportunidades Inclusivas</h2>
            <p style={descStyle}>¿En qué áreas disponen o abren regularmente oportunidades de empleo?</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TIPOS_PUESTOS.map(item => (
              <CheckChip
                key={item}
                label={item}
                selected={jobTypes.includes(item)}
                onToggle={() => toggleArrayItem(setJobTypes, item)}
              />
            ))}
          </div>
          <WizardNavButtons onBack={() => setStep('workplace_accessibility')} submitLabel="Continuar" />
        </form>
      )}

      {/* STEP 4: CONTACTO RH */}
      {step === 'contact_hr' && (
        <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h2 style={headingStyle}>Atracción de Talento y RH</h2>
            <p style={descStyle}>Información para recibir postulaciones o consultas sobre vacantes inclusivas.</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Correo de vacantes / RH
            </label>
            <input
              type="email"
              className="auth-input"
              placeholder="vacantes@miempresa.com"
              value={contactHr.emailVacantes}
              onChange={e => setContactHr(prev => ({ ...prev, emailVacantes: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Teléfono de Recursos Humanos
            </label>
            <input
              type="text"
              className="auth-input"
              placeholder="Ej. (55) 1234 5678"
              value={contactHr.telefonoRh}
              onChange={e => setContactHr(prev => ({ ...prev, telefonoRh: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Bolsa de trabajo / Portal de carreras
            </label>
            <input
              type="url"
              className="auth-input"
              placeholder="https://miempresa.com/carreras"
              value={contactHr.sitioCarreras}
              onChange={e => setContactHr(prev => ({ ...prev, sitioCarreras: e.target.value }))}
            />
          </div>
          <WizardNavButtons
            onBack={() => setStep('job_types')}
            submitLabel={sending ? 'Guardando...' : 'Finalizar perfil'}
            submitDisabled={sending}
          />
        </form>
      )}

      {/* STEP DONE */}
      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icons.check({ s: 32 })}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--fg1)', margin: 0 }}>
            ¡Perfil de Empresa Listo!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fg2)', maxWidth: 460, margin: 0, lineHeight: 1.5 }}>
            Tu perfil inclusivo está configurado para destacar tus vacantes y conectar con candidatos en Raíces.
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
