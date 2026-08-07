import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJobs, useAppliedJobIds, useApplyJob, useMyApplications, useCreateJob } from '../hooks/useJobs'
import { useMiInstitucion } from '@features/institutions/hooks/useInstitutions'
import { useMessages, useSendMessage } from '@features/social/hooks/useMessages'
import { useAuthStore } from '@features/auth'
import { useDependientes, useUpdateDependent } from '@features/tutor'
import { useUiStore } from '@shared/stores/uiStore'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { Icons } from '@shared/components/shared'
import { AppSidebar, TopNav, useMe, useUpdateProfile, useProfile } from '@features/auth'
import { JOBS_TOAST, JOBS_UI, STATUS_COLORS } from '../constants/jobsMessages'
import BackendFallback from '@shared/components/BackendFallback'
import { JOB_ENDPOINTS } from '@shared/constants/backendEndpoints'

const STATUS_LABELS = {
  pending: JOBS_UI.STATUS_PENDING,
  reviewed: JOBS_UI.STATUS_REVIEWED,
  accepted: JOBS_UI.STATUS_ACCEPTED,
  rejected: JOBS_UI.STATUS_REJECTED,
}

function CreateJobModal({ onClose }) {
  const [form, setForm] = useState({ titulo: '', descripcion: '', requisitos: '', modalidad: 'presencial', horario: '', rangoSalario: '', ciudad: '', estado: '', inclusivaDiscapacidad: true })
  const createJob = useCreateJob()
  const { addToast } = useUiStore()

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createJob.mutateAsync(form)
      addToast(JOBS_TOAST.JOB_CREATED, 'success')
      onClose()
    } catch (err) {
      addToast(err?.response?.data?.message ?? JOBS_TOAST.JOB_CREATE_FAILED, 'error')
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, boxSizing: 'border-box', fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none' }
  const labelStyle = { fontSize: 14, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 6 }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="animate-scale-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 28, maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px' }}>{JOBS_UI.CREATE_JOB_TITLE}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={labelStyle}>{JOBS_UI.JOB_TITLE_LABEL}</label><input required value={form.titulo} onChange={e => update('titulo', e.target.value)} placeholder={JOBS_UI.JOB_TITLE_PLACEHOLDER} style={inputStyle} /></div>
          <div><label style={labelStyle}>{JOBS_UI.JOB_DESC_LABEL}</label><textarea rows={3} value={form.descripcion} onChange={e => update('descripcion', e.target.value)} placeholder={JOBS_UI.JOB_DESC_PLACEHOLDER} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          <div><label style={labelStyle}>{JOBS_UI.JOB_REQUIREMENTS_LABEL}</label><textarea rows={2} value={form.requisitos} onChange={e => update('requisitos', e.target.value)} placeholder={JOBS_UI.JOB_REQUIREMENTS_PLACEHOLDER} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>{JOBS_UI.MODALITY_LABEL}</label>
              <select value={form.modalidad} onChange={e => update('modalidad', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="presencial">{JOBS_UI.MODALITY_PRESENCIAL}</option><option value="remoto">{JOBS_UI.MODALITY_REMOTO}</option><option value="híbrido">{JOBS_UI.MODALITY_HYBRID}</option>
              </select></div>
            <div><label style={labelStyle}>{JOBS_UI.SCHEDULE_LABEL}</label><input value={form.horario} onChange={e => update('horario', e.target.value)} placeholder={JOBS_UI.SCHEDULE_PLACEHOLDER} style={inputStyle} /></div>
          </div>
          <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>{JOBS_UI.CITY_LABEL}</label><input value={form.ciudad} onChange={e => update('ciudad', e.target.value)} placeholder={JOBS_UI.CITY_PLACEHOLDER} style={inputStyle} /></div>
            <div><label style={labelStyle}>{JOBS_UI.STATE_LABEL}</label><input value={form.estado} onChange={e => update('estado', e.target.value)} placeholder={JOBS_UI.STATE_PLACEHOLDER} style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>{JOBS_UI.SALARY_LABEL}</label><input value={form.rangoSalario} onChange={e => update('rangoSalario', e.target.value)} placeholder={JOBS_UI.SALARY_PLACEHOLDER} style={inputStyle} /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--fg2)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.inclusivaDiscapacidad} onChange={e => update('inclusivaDiscapacidad', e.target.checked)} style={{ width: 18, height: 18 }} />
            {JOBS_UI.INCLUSIVE_CHECKBOX}
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>{JOBS_UI.CANCEL_BUTTON}</button>
            <button type="submit" className="btn-primary" disabled={!form.titulo.trim() || createJob.isPending} style={{ padding: '10px 24px', fontSize: 14 }}>{createJob.isPending ? JOBS_UI.CREATE_JOB_LOADING : JOBS_UI.CREATE_JOB}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── CandidateOption (tarjeta de selección de candidato) ─── */
function CandidateOption({ label, description, icon, selected, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: '14px 12px',
        borderRadius: 'var(--radius-md)',
        border: `2px solid ${selected ? 'var(--primary)' : 'var(--border-color)'}`,
        background: selected ? 'var(--primary-subtle)' : 'var(--bg-surface)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        textAlign: 'center',
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: selected ? 'var(--primary)' : 'var(--primary-subtle)', color: selected ? '#fff' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
        {icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--fg3)', lineHeight: 1.3 }}>{description}</span>
    </button>
  )
}

/* ─── Custom Icons for Wizard ─────────────────────────────────── */
const flagIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
)

const filePdfIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

/* ─── CvDocumentPreview (Vista previa interactiva del CV) ────── */
function CvDocumentPreview({ name, email, phone, location, jobTitle }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.03)',
      fontFamily: 'var(--font-body)',
      color: '#334155',
      fontSize: '11px',
      lineHeight: '1.6',
      maxHeight: '400px',
      overflowY: 'auto',
      textAlign: 'left'
    }}>
      {/* Resume Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
        
        {/* Left Column (Sidebar) */}
        <div style={{
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '6px',
          borderRight: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Avatar / Photo */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              fontWeight: 'bold',
              margin: '0 auto 8px',
              fontFamily: 'var(--font-display)'
            }}>
              {(name?.[0] || 'C').toUpperCase()}
            </div>
            <span style={{ fontSize: '9px', color: 'var(--fg3)', fontWeight: 600 }}>CANDIDATO VERIFICADO</span>
          </div>
          
          {/* Contact details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
              <span style={{ color: 'var(--primary)' }}>{Icons.phone({ s: 12 })}</span>
              <span>{phone || '999 338 6267'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
              <span style={{ color: 'var(--primary)' }}>{Icons.mail({ s: 12 })}</span>
              <span>{email || 'candidato@correo.com'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
              <span style={{ color: 'var(--primary)' }}>{Icons.mapPin({ s: 12 })}</span>
              <span>{location || 'Mérida, Yucatán'}</span>
            </div>
          </div>

          {/* Habilidades */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              Habilidades
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Proactividad', 'Trabajo en equipo', 'Organización', 'Puntualidad', 'Adaptabilidad', 'Comunicación'].map(skill => (
                <span key={skill} style={{ background: 'var(--primary-subtle)', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 600, color: 'var(--primary)' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Idiomas */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
              Idiomas
            </span>
            <span style={{ fontSize: '10px', color: '#475569' }}>Español (Nativo)<br />Inglés (Básico)</span>
          </div>
        </div>

        {/* Right Column (Main Content) */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--fg1)', margin: '0 0 2px', fontFamily: 'var(--font-display)' }}>
            {name || 'Nombre Candidato'}
          </h3>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '16px', letterSpacing: '0.05em' }}>
            {jobTitle ? `${jobTitle.toUpperCase()}` : 'CANDIDATO'}
          </span>

          {/* Perfil */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontWeight: 700, fontSize: '11px', color: 'var(--fg1)', textTransform: 'uppercase', display: 'block', borderBottom: '2px solid var(--primary-subtle)', paddingBottom: '4px', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              Perfil Profesional
            </span>
            <p style={{ margin: '0', fontSize: '10.5px', color: 'var(--fg2)', textAlign: 'justify' }}>
              Persona comprometida, entusiasta y con gran disposición para aprender y colaborar en equipo. Busco aportar mis habilidades y actitud positiva a la vacante para contribuir al logro de metas y crecer profesionalmente.
            </p>
          </div>

          {/* Experiencia */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontWeight: 700, fontSize: '11px', color: 'var(--fg1)', textTransform: 'uppercase', display: 'block', borderBottom: '2px solid var(--primary-subtle)', paddingBottom: '4px', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              Experiencia Laboral
            </span>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--fg1)', fontSize: '10.5px' }}>
                <span>Auxiliar Operativo</span>
                <span style={{ color: 'var(--fg3)', fontWeight: 500 }}>2024 - Presente</span>
              </div>
              <span style={{ fontStyle: 'italic', display: 'block', marginBottom: '4px', color: 'var(--primary)', fontWeight: 600 }}>Servicios Comerciales de Yucatán</span>
              <p style={{ margin: '0', fontSize: '10px', color: 'var(--fg2)' }}>
                Apoyo en tareas organizativas, control de material en almacén y servicio directo. Enfoque constante en el orden y eficiencia en equipo.
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--fg1)', fontSize: '10.5px' }}>
                <span>Atención al Cliente</span>
                <span style={{ color: 'var(--fg3)', fontWeight: 500 }}>2022 - 2024</span>
              </div>
              <span style={{ fontStyle: 'italic', display: 'block', marginBottom: '4px', color: 'var(--primary)', fontWeight: 600 }}>Establecimiento Local</span>
              <p style={{ margin: '0', fontSize: '10px', color: 'var(--fg2)' }}>
                Atención directa al público, recepción y registro de solicitudes de clientes, garantizando una excelente experiencia y cuidado.
              </p>
            </div>
          </div>

          {/* Educación */}
          <div>
            <span style={{ fontWeight: 700, fontSize: '11px', color: 'var(--fg1)', textTransform: 'uppercase', display: 'block', borderBottom: '2px solid var(--primary-subtle)', paddingBottom: '4px', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              Educación
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--fg1)', fontSize: '10.5px' }}>
              <span>Educación Media Superior / Bachillerato</span>
              <span style={{ color: 'var(--fg3)', fontWeight: 500 }}>Graduado</span>
            </div>
            <span style={{ fontStyle: 'italic', color: 'var(--fg3)' }}>Institución Educativa del Estado de Yucatán</span>
          </div>

        </div>

      </div>
    </div>
  )
}

/* ─── ApplicationModal ─────────────────────────────────── */
function ApplicationModal({ job, onClose }) {
  const { user: authUser } = useAuthStore()
  const { data: meData } = useMe()
  const { data: dependents = [], isLoading: loadingDependents } = useDependientes()
  const updateProfile = useUpdateProfile()
  const updateDependent = useUpdateDependent()
  const apply = useApplyJob()
  const { addToast } = useUiStore()

  const isTutor = authUser?.role === 'tutor'

  // Pasos: 0 (Candidato - solo tutor), 1 (Ubicación), 2 (CV), 3 (Revisión)
  const [step, setStep] = useState(isTutor ? 0 : 1)

  // Tipo de candidato (tutor)
  const [candidateType, setCandidateType] = useState('me') // 'me' | 'managed' | 'linked'
  const [selectedCandidateId, setSelectedCandidateId] = useState(null)

  // Información de contacto del candidato
  const [contactInfo, setContactInfo] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    ciudadEstado: ''
  })

  // Edición rápida en paso de revisión
  const [editingContact, setEditingContact] = useState(false)
  const [tempContactInfo, setTempContactInfo] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    ciudadEstado: ''
  })

  // Ubicación
  const [location, setLocation] = useState({
    pais: 'México',
    codigoPostal: '',
    ciudadEstado: '',
    direccion: ''
  })
  const [isEditingCountry, setIsEditingCountry] = useState(false)

  // Archivo CV
  const [cvFile, setCvFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Carta de presentación
  const [letter, setLetter] = useState('')

  // Clasificar dependientes (misma lógica que TutorPage)
  const { managedProfiles, linkedAccounts } = useMemo(() => {
    if (!isTutor) return { managedProfiles: [], linkedAccounts: [] }
    const managed = []
    const linked = []
    dependents.forEach(dep => {
      if (dep.esCuentaVinculada) {
        linked.push(dep)
      } else {
        managed.push(dep)
      }
    })
    return { managedProfiles: managed, linkedAccounts: linked }
  }, [dependents, isTutor])

  // Determinar candidateId actual
  const getCandidateId = () => {
    if (!isTutor || candidateType === 'me') return undefined
    return selectedCandidateId
  }

  // Prellenar datos al entrar al paso 1
  const initializeCandidateData = () => {
    let name = ''
    let email = ''
    let phone = ''
    let cityState = ''

    const currentCandidateId = getCandidateId()

    if (!isTutor || candidateType === 'me') {
      name = meData?.full_name || authUser?.full_name || ''
      email = meData?.email || authUser?.email || ''
      phone = localStorage.getItem('raices_user_phone_' + (meData?.id || 'me')) || ''
      const c = meData?.city || authUser?.city || ''
      const s = meData?.state || authUser?.state || ''
      cityState = c && s ? `${c}, ${s}` : c || s || ''
    } else {
      const dep = dependents.find(d => d.id === selectedCandidateId)
      name = dep?.nombreCompleto || ''
      email = dep?.email || meData?.email || authUser?.email || ''
      phone = localStorage.getItem('raices_user_phone_' + selectedCandidateId) || ''
      // Fallback a ubicación del tutor si el dependiente no la tiene
      const c = meData?.city || authUser?.city || ''
      const s = meData?.state || authUser?.state || ''
      cityState = c && s ? `${c}, ${s}` : c || s || ''
    }

    const info = {
      nombreCompleto: name,
      email,
      telefono: phone,
      ciudadEstado: cityState
    }

    setContactInfo(info)
    setTempContactInfo(info)

    setLocation({
      pais: 'México',
      codigoPostal: localStorage.getItem('raices_user_cp_' + (currentCandidateId || 'me')) || '',
      ciudadEstado: cityState,
      direccion: localStorage.getItem('raices_user_address_' + (currentCandidateId || 'me')) || ''
    })

    // Cargar CV guardado si existe
    const savedCv = localStorage.getItem('raices_user_cv_' + (currentCandidateId || 'me'))
    if (savedCv) {
      try {
        setCvFile(JSON.parse(savedCv))
      } catch (e) {
        setCvFile(null)
      }
    } else {
      setCvFile(null)
    }
  }

  // Inicializar si no es tutor
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isTutor && meData) {
      initializeCandidateData()
    }
  }, [meData, isTutor])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Cambiar tipo de candidato
  const handleCandidateTypeChange = (type) => {
    setCandidateType(type)
    setSelectedCandidateId(null)
  }

  // Manejar archivo cargado
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      addToast('El formato del archivo debe ser PDF', 'error')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('El archivo supera el límite de 10MB', 'error')
      return
    }

    setIsUploading(true)

    // Simular carga de archivo premium
    setTimeout(() => {
      const fileData = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadDate: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
      }
      setCvFile(fileData)
      setIsUploading(false)

      const currentCandidateId = getCandidateId()
      localStorage.setItem('raices_user_cv_' + (currentCandidateId || 'me'), JSON.stringify(fileData))
      addToast('CV cargado con éxito', 'success')
    }, 1000)
  }

  const handleLocationSubmit = async () => {
    if (!location.codigoPostal.trim() || !location.ciudadEstado.trim()) {
      addToast('Por favor completa los campos requeridos (*)', 'error')
      return
    }

    const currentCandidateId = getCandidateId()
    localStorage.setItem('raices_user_cp_' + (currentCandidateId || 'me'), location.codigoPostal)
    localStorage.setItem('raices_user_address_' + (currentCandidateId || 'me'), location.direccion)

    setContactInfo(prev => ({
      ...prev,
      ciudadEstado: location.ciudadEstado
    }))
    setTempContactInfo(prev => ({
      ...prev,
      ciudadEstado: location.ciudadEstado
    }))

    // Guardar en el perfil si es para sí mismo
    if (!isTutor || candidateType === 'me') {
      const parts = location.ciudadEstado.split(',')
      const city = parts[0]?.trim() || ''
      const state = parts[1]?.trim() || ''
      try {
        await updateProfile.mutateAsync({
          full_name: contactInfo.nombreCompleto || meData?.full_name || authUser?.full_name,
          city,
          state
        })
      } catch (err) {
        console.warn('Could not update profile location:', err)
      }
    }

    setStep(2)
  }

  const saveEditedContact = () => {
    setContactInfo(tempContactInfo)
    setEditingContact(false)
    addToast('Información de contacto guardada', 'success')
  }

  const submit = async (e) => {
    e.preventDefault()

    const currentCandidateId = getCandidateId()
    localStorage.setItem('raices_user_phone_' + (currentCandidateId || 'me'), contactInfo.telefono)

    try {
      await apply.mutateAsync({
        jobId: job.id,
        cover_letter: letter,
        candidateId: currentCandidateId
      })
      addToast(JOBS_TOAST.APPLICATION_SENT, 'success')
      onClose()
    } catch (err) {
      addToast(err?.response?.data?.message ?? JOBS_TOAST.APPLICATION_FAILED, 'error')
    }
  }

  // Estilos reutilizables
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    fontSize: 14,
    boxSizing: 'border-box',
    fontFamily: 'var(--font-body)',
    color: 'var(--fg1)',
    background: 'var(--bg-warm)',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  }

  const labelStyle = {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--fg2)',
    display: 'block',
    marginBottom: 8,
  }

  // Renderizar indicador de progreso
  const renderProgress = (percent) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, width: '100%' }}>
      <div style={{ flex: 1, height: 4, background: 'var(--border-color)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${percent}%`, background: 'var(--primary)', borderRadius: 2, transition: 'width 0.3s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', fontFamily: 'var(--font-bold)' }}>{percent}%</span>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="animate-scale-in" style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        padding: '24px 28px 28px',
        maxWidth: 580,
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        
        {/* Header Superior del Wizard */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
          {step > (isTutor ? 0 : 1) ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg2)', display: 'flex', alignItems: 'center', padding: 4 }}
            >
              {Icons.arrowLeft({ s: 20 })}
            </button>
          ) : <div style={{ width: 28 }} />}

          {/* Título de la Vacante context */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Postulando a
            </span>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
              {job.title}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}
          >
            {step === 2 && cvFile ? 'Guardar y cerrar' : 'Cancelar'}
          </button>
        </div>

        {/* ─── PASO 0: SELECCIÓN DE CANDIDATO (Tutores) ─── */}
        {step === 0 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
              ¿Quién se va a postular?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '0 0 20px' }}>{job.institution_name}</p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <CandidateOption
                label={JOBS_UI.CANDIDATE_ME}
                description={JOBS_UI.CANDIDATE_ME_DESCRIPTION}
                icon={Icons.user({ s: 16 })}
                selected={candidateType === 'me'}
                onClick={() => handleCandidateTypeChange('me')}
              />
              <CandidateOption
                label={JOBS_UI.CANDIDATE_MANAGED}
                description={JOBS_UI.CANDIDATE_MANAGED_DESCRIPTION}
                icon={Icons.users({ s: 16 })}
                selected={candidateType === 'managed'}
                onClick={() => handleCandidateTypeChange('managed')}
                disabled={loadingDependents}
              />
              <CandidateOption
                label={JOBS_UI.CANDIDATE_LINKED}
                description={JOBS_UI.CANDIDATE_LINKED_DESCRIPTION}
                icon={Icons.link({ s: 16 })}
                selected={candidateType === 'linked'}
                onClick={() => handleCandidateTypeChange('linked')}
                disabled={loadingDependents}
              />
            </div>

            {candidateType !== 'me' && (
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>{JOBS_UI.CANDIDATE_SELECT_PLACEHOLDER}</label>
                {loadingDependents ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', color: 'var(--fg3)', fontSize: 14 }}>
                    {Icons.loader({ s: 14 })} {JOBS_UI.CANDIDATE_LOADING}
                  </div>
                ) : (
                  <select
                    value={selectedCandidateId || ''}
                    onChange={(e) => setSelectedCandidateId(e.target.value || null)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Selecciona un dependiente...</option>
                    {candidateType === 'managed' ? (
                      managedProfiles.length > 0 ? (
                        managedProfiles.map(dep => (
                          <option key={dep.id} value={dep.id}>{dep.nombreCompleto} ({dep.parentesco})</option>
                        ))
                      ) : (
                        <option value="" disabled>{JOBS_UI.CANDIDATE_NO_MANAGED}</option>
                      )
                    ) : (
                      linkedAccounts.length > 0 ? (
                        linkedAccounts.map(dep => (
                          <option key={dep.id} value={dep.id}>{dep.nombreCompleto} ({dep.parentesco})</option>
                        ))
                      ) : (
                        <option value="" disabled>{JOBS_UI.CANDIDATE_NO_LINKED}</option>
                      )
                    )}
                  </select>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="button"
                className="btn-primary"
                disabled={candidateType !== 'me' && !selectedCandidateId}
                onClick={() => {
                  initializeCandidateData()
                  setStep(1)
                }}
                style={{ padding: '12px 32px', fontSize: 14, fontWeight: 700 }}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* ─── PASO 1: AGREGA TU UBICACIÓN ─── */}
        {step === 1 && (
          <div className="animate-fade-in">
            {renderProgress(33)}
            
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
              Agrega tu ubicación
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 24px', lineHeight: 1.5 }}>
              Guardaremos esta información en tu perfil. Los campos marcados con (*) son obligatorios.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* País */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-cool)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--fg3)', display: 'block', fontWeight: 600, marginBottom: 2 }}>País</span>
                  {isEditingCountry ? (
                    <input
                      type="text"
                      value={location.pais}
                      onChange={e => setLocation({ ...location, pais: e.target.value })}
                      style={{ ...inputStyle, padding: '4px 8px', marginTop: 4 }}
                      placeholder="Ingresa tu país"
                    />
                  ) : (
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)' }}>{location.pais}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingCountry(!isEditingCountry)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13.5, fontWeight: 700 }}
                >
                  {isEditingCountry ? 'Listo' : 'Cambiar'}
                </button>
              </div>

              {/* Código postal */}
              <div>
                <label style={labelStyle}>Código postal *</label>
                <input
                  type="text"
                  required
                  value={location.codigoPostal}
                  onChange={e => setLocation({ ...location, codigoPostal: e.target.value })}
                  style={inputStyle}
                  placeholder="Escribe tu código postal (ej: 97314)"
                />
              </div>

              {/* Ciudad, estado */}
              <div>
                <label style={labelStyle}>Ciudad, estado *</label>
                <input
                  type="text"
                  required
                  value={location.ciudadEstado}
                  onChange={e => setLocation({ ...location, ciudadEstado: e.target.value })}
                  style={inputStyle}
                  placeholder="Ciudad, Estado (ej: Mérida, Yucatán)"
                />
              </div>

              {/* Dirección */}
              <div>
                <label style={labelStyle}>Dirección</label>
                <span style={{ fontSize: 11, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  👁️ Oculta para las empresas hasta la contratación
                </span>
                <input
                  type="text"
                  value={location.direccion}
                  onChange={e => setLocation({ ...location, direccion: e.target.value })}
                  style={inputStyle}
                  placeholder="Dirección (calle, número, etc.)"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleLocationSubmit}
                style={{ padding: '12px 32px', fontSize: 14, fontWeight: 700 }}
              >
                Continuar
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 6, alignItems: 'center', color: 'var(--fg3)', fontSize: 12.5, cursor: 'pointer' }}>
              {flagIcon}
              <span style={{ textDecoration: 'underline' }}>Reportar un problema</span>
            </div>
          </div>
        )}

        {/* ─── PASO 2: AGREGA UN CV ─── */}
        {step === 2 && (
          <div className="animate-fade-in">
            {renderProgress(44)}
            
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
              Agrega un CV
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Sube tu currículum en formato PDF para que los reclutadores puedan conocer tu perfil completo.
            </p>

            {/* Drop / Upload Zone */}
            {!cvFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: 'var(--bg-cool)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
              >
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isUploading ? Icons.loader({ s: 22 }) : Icons.upload({ s: 20 })}
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', display: 'block' }}>
                    {isUploading ? 'Subiendo currículum...' : 'Sube tu currículum'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 4, display: 'block' }}>
                    Soporta formatos PDF de hasta 10MB
                  </span>
                </div>
                <button
                  type="button"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--primary)',
                    background: '#fff',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    marginTop: 4
                  }}
                >
                  Seleccionar archivo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Info Card del Archivo cargado */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  border: '2px solid var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  background: 'color-mix(in oklch, var(--primary) 3%, #fff)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {filePdfIcon}
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cvFile.name}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--fg3)' }}>
                        Subido el {cvFile.uploadDate} · {cvFile.size}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'green', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {Icons.check({ s: 12 })}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCvFile(null)
                        const currentCandidateId = getCandidateId()
                        localStorage.removeItem('raices_user_cv_' + (currentCandidateId || 'me'))
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 4 }}
                      title="Eliminar archivo"
                    >
                      {Icons.trash({ s: 16 })}
                    </button>
                  </div>
                </div>

                {/* PDF Interactive Preview Sheet */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg2)', textAlign: 'left' }}>
                    Vista previa de tu CV:
                  </span>
                  <CvDocumentPreview
                    name={contactInfo.nombreCompleto}
                    email={contactInfo.email}
                    phone={contactInfo.telefono}
                    location={location.ciudadEstado}
                    jobTitle={job.title}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                type="button"
                className="btn-primary"
                disabled={!cvFile}
                onClick={() => setStep(3)}
                style={{ padding: '12px 32px', fontSize: 14, fontWeight: 700 }}
              >
                Continuar
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, gap: 6, alignItems: 'center', color: 'var(--fg3)', fontSize: 12.5, cursor: 'pointer' }}>
              {flagIcon}
              <span style={{ textDecoration: 'underline' }}>Reportar un problema</span>
            </div>
          </div>
        )}

        {/* ─── PASO 3: REVISAR POSTULACIÓN ─── */}
        {step === 3 && (
          <form onSubmit={submit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
                Revisar postulación
              </h2>
              <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0 }}>
                Verifica tus datos. No podrás editar tu postulación después de enviarla.
              </p>
            </div>

            {/* SECCIÓN 1: INFORMACIÓN DE CONTACTO */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 18, background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', fontFamily: 'var(--font-bold)' }}>
                  Información de contacto
                </span>
                {editingContact ? (
                  <button
                    type="button"
                    onClick={saveEditedContact}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                  >
                    Guardar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTempContactInfo({ ...contactInfo })
                      setEditingContact(true)
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                  >
                    Editar
                  </button>
                )}
              </div>

              {editingContact ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)' }}>Nombre completo</label>
                    <input
                      type="text"
                      value={tempContactInfo.nombreCompleto}
                      onChange={e => setTempContactInfo({ ...tempContactInfo, nombreCompleto: e.target.value })}
                      style={{ ...inputStyle, padding: '8px 12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)' }}>Email</label>
                    <input
                      type="email"
                      value={tempContactInfo.email}
                      onChange={e => setTempContactInfo({ ...tempContactInfo, email: e.target.value })}
                      style={{ ...inputStyle, padding: '8px 12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)' }}>Número de teléfono</label>
                    <input
                      type="tel"
                      value={tempContactInfo.telefono}
                      onChange={e => setTempContactInfo({ ...tempContactInfo, telefono: e.target.value })}
                      style={{ ...inputStyle, padding: '8px 12px' }}
                      placeholder="Ej: +52 999 338 6267"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)' }}>Ciudad, estado</label>
                    <input
                      type="text"
                      value={tempContactInfo.ciudadEstado}
                      onChange={e => setTempContactInfo({ ...tempContactInfo, ciudadEstado: e.target.value })}
                      style={{ ...inputStyle, padding: '8px 12px' }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                  <div>
                    <span style={{ fontSize: 12, color: 'var(--fg3)', display: 'block' }}>Nombre completo</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{contactInfo.nombreCompleto}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: 'var(--fg3)', display: 'block' }}>Email</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{contactInfo.email}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--fg3)', display: 'block', marginTop: 2, fontStyle: 'italic' }}>
                      Para tu seguridad, protegemos tus datos de contacto frente a correos spam.
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: 'var(--fg3)', display: 'block' }}>Número de teléfono</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{contactInfo.telefono || 'No proporcionado'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: 'var(--fg3)', display: 'block' }}>Ciudad, estado</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{contactInfo.ciudadEstado}</span>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 2: CV CARGADO */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 18, background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', fontFamily: 'var(--font-bold)' }}>
                  Currículum Vitae (CV)
                </span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => addToast('Descargando archivo...', 'info')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                  >
                    Descargar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                  >
                    Editar
                  </button>
                </div>
              </div>

              {cvFile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {filePdfIcon}
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fg1)', display: 'block' }}>{cvFile.name}</span>
                      <span style={{ fontSize: 11.5, color: 'var(--fg3)' }}>Se acaba de subir</span>
                    </div>
                  </div>
                  
                  {/* Miniature Preview Frame */}
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 6, padding: 8, background: 'var(--bg-cool)', overflow: 'hidden' }}>
                    <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', maxHeight: 180, overflow: 'hidden' }}>
                      <CvDocumentPreview
                        name={contactInfo.nombreCompleto}
                        email={contactInfo.email}
                        phone={contactInfo.telefono}
                        location={location.ciudadEstado}
                        jobTitle={job.title}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 3: CARTA DE PRESENTACIÓN / MENSAJE */}
            <div>
              <label style={labelStyle}>Carta de presentación / Mensaje (opcional)</label>
              <textarea
                rows={4}
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                placeholder="Escribe un mensaje breve al reclutador contándole por qué eres el candidato ideal..."
                style={inputStyle}
              />
            </div>

            {/* Acciones del Review */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={apply.isPending || editingContact || !contactInfo.nombreCompleto.trim()}
                style={{
                  padding: '12px 32px',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {apply.isPending ? (
                  <>{Icons.loader({ s: 16 })} {JOBS_UI.APPLY_BUTTON_LOADING}</>
                ) : (
                  <>{Icons.check({ s: 16 })} {JOBS_UI.APPLY_BUTTON}</>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}

/* ─── MessageModal (chat en tiempo real) ────────────────────── */
function MessageModal({ job, onClose }) {
  const [text, setText] = useState('')
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)
  const sendMessage = useSendMessage()
  const { user } = useAuthStore()
  const { addToast } = useUiStore()

  const ownerUserId = job.institution_owner_id
  const { data: messages = [], isLoading: msgsLoading } = useMessages(ownerUserId)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sendMessage.isPending])

  useEffect(() => {
    chatInputRef.current?.focus()
  }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || sendMessage.isPending || !ownerUserId) return
    const msg = text.trim()
    setText('')
    try {
      await sendMessage.mutateAsync({ toId: ownerUserId, content: msg })
    } catch {
      setText(msg) // restaurar si falla
      addToast(JOBS_UI.MESSAGE_FAILED, 'error')
    }
  }

  if (!ownerUserId) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="animate-scale-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 28, maxWidth: 440, width: '100%', boxShadow: 'var(--shadow-xl)', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'color-mix(in oklch, #D4944C 15%, transparent)', color: '#D4944C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {Icons.message({ s: 22 })}
          </div>
          <p style={{ fontSize: 15, color: 'var(--fg2)', margin: '0 0 20px', lineHeight: 1.6 }}>{JOBS_UI.MESSAGE_NO_OWNER}</p>
          <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>{JOBS_UI.CANCEL_BUTTON}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="animate-scale-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 0, maxWidth: 520, width: '100%', maxHeight: '80vh', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50% 50% 50% 14%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
              {(job.institution_name?.[0] ?? '?').toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--fg1)' }}>
                {job.institution_name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg3)' }}>💬 {JOBS_UI.MESSAGE_MODAL_HINT}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4, display: 'flex' }}>{Icons.x({ s: 18 })}</button>
        </div>

        {/* Job context card */}
        <div style={{ padding: '10px 20px', background: 'color-mix(in oklch, var(--primary) 5%, var(--bg-warm))', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>💼 {job.title}</div>
          {job.salary_range && <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{job.salary_range}</div>}
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200, maxHeight: 'calc(80vh - 180px)', background: 'var(--bg-warm)' }}>
          {msgsLoading && messages.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--fg3)', fontSize: 13, gap: 6 }}>
              {Icons.loader({ s: 14 })} Cargando conversación...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {Icons.message({ s: 20 })}
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg3)', textAlign: 'center', lineHeight: 1.5 }}>
                Inicia la conversación con {job.institution_name}<br />sobre la vacante de <strong>{job.title}</strong>
              </div>
            </div>
          ) : (
            messages.map(msg => {
              const mine = msg.from_id === user?.id
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                  <span style={{
                    background: mine ? 'var(--primary)' : 'var(--bg-surface)',
                    color: mine ? '#fff' : 'var(--fg1)',
                    borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '10px 14px',
                    fontSize: 14,
                    maxWidth: '75%',
                    border: mine ? 'none' : '1px solid var(--border-color)',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                    <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3, textAlign: mine ? 'right' : 'left' }}>
                      {new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </span>
                </div>
              )
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8, flexShrink: 0, background: 'var(--bg-surface)' }}>
          <input
            ref={chatInputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={JOBS_UI.MESSAGE_PLACEHOLDER}
            style={{ flex: 1, height: 42, padding: '0 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-pill)', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none' }}
          />
          <button type="submit" disabled={!text.trim() || sendMessage.isPending}
            style={{ width: 42, height: 42, borderRadius: '50%', background: text.trim() ? 'var(--primary)' : 'var(--border-color)', border: 'none', color: '#fff', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
            {sendMessage.isPending ? Icons.loader({ s: 18 }) : Icons.send({ s: 18 })}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─── JobCard (Apple-style minimal) ─────────────────────── */
function JobCard({ job, applied, onApply, onMessage, userRole, institutionId, onNavigateToPortal, onEditJob }) {
  const [expanded, setExpanded] = useState(false)

  // Build single-line info string
  const infoParts = []
  if (job.city) infoParts.push(`${job.city}${job.state ? `, ${job.state}` : ''}`)
  if (job.modality) infoParts.push(job.modality)
  if (job.schedule) infoParts.push(job.schedule)

  return (
    <div 
      onClick={() => setExpanded(v => !v)}
      style={{ 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 14, 
        padding: '20px 24px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'var(--primary)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
    >
      {/* Top row: Title + Salary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--fg1)', margin: 0, lineHeight: 1.3 }}>
              {job.title}
            </h3>
            {job.institution_verified && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6, background: 'color-mix(in oklch, #1F8049 12%, transparent)', color: '#1F8049', whiteSpace: 'nowrap' }}>
                {Icons.check({ s: 9 })} {JOBS_UI.VERIFIED_BADGE}
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: 'var(--fg2)', fontWeight: 500, margin: '0 0 6px' }}>
            {job.institution_name}
          </p>
        </div>
        {job.salary_range && (
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', whiteSpace: 'nowrap', fontFamily: 'var(--font-display)' }}>
            {job.salary_range}
          </span>
        )}
      </div>

      {/* Info line: City · Modality · Schedule */}
      {infoParts.length > 0 && (
        <div style={{ fontSize: 13, color: 'var(--fg3)', marginBottom: 12, lineHeight: 1.4 }}>
          {infoParts.map((part, i) => (
            <span key={i}>
              {i > 0 && <span style={{ margin: '0 6px', color: 'var(--border-color)' }}>·</span>}
              {part}
            </span>
          ))}
        </div>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Role-based action buttons */}
          {userRole === 'institution' ? (
            /* Institution role: show edit/applicants buttons for own jobs */
            (job.institution_id && String(job.institution_id) === String(institutionId)) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onEditJob?.(job) }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: 'color-mix(in oklch, var(--primary) 10%, transparent)',
                    color: 'var(--primary)', border: '1px solid color-mix(in oklch, var(--primary) 20%, transparent)',
                    cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in oklch, var(--primary) 18%, transparent)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'color-mix(in oklch, var(--primary) 10%, transparent)' }}
                >
                  {Icons.edit({ s: 13 })} Editar vacante
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigateToPortal?.('candidatos') }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: 'color-mix(in oklch, #D4944C 10%, transparent)',
                    color: '#D4944C', border: '1px solid color-mix(in oklch, #D4944C 20%, transparent)',
                    cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in oklch, #D4944C 18%, transparent)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'color-mix(in oklch, #D4944C 10%, transparent)' }}
                >
                  {Icons.users({ s: 13 })} Ver postulantes
                </button>
              </div>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 8, background: 'var(--bg-cool)', color: 'var(--fg3)', fontSize: 13, fontWeight: 500 }}>
                {Icons.building({ s: 13 })} Vacante de otra institución
              </span>
            )
          ) : (
            /* User / Tutor / other roles: show apply button */
            applied ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 8, background: 'color-mix(in oklch, #1F8049 10%, transparent)', color: '#1F8049', fontSize: 13, fontWeight: 600 }}>
                {Icons.check({ s: 13 })} {JOBS_UI.POSTULATED_BADGE}
              </span>
            ) : (
              <button 
                className="btn-primary" 
                onClick={(e) => { e.stopPropagation(); onApply() }} 
                style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, borderRadius: 8, whiteSpace: 'nowrap' }}
              >
                {JOBS_UI.POSTULATE_BUTTON}
              </button>
            )
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {job.institution_owner_id && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMessage(job) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--fg3)'}
              title="Enviar mensaje"
            >
              {Icons.message({ s: 16 })}
            </button>
          )}
          <span style={{ color: 'var(--fg3)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}>
            {Icons.arrowRight({ s: 14 })}
          </span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
          {job.description && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{JOBS_UI.DESCRIPTION_LABEL}</div>
              <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: 0 }}>{job.description}</p>
            </div>
          )}
          {job.requirements && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{JOBS_UI.REQUIREMENTS_LABEL}</div>
              <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: 0 }}>{job.requirements}</p>
            </div>
          )}
          {job.disability_types?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{JOBS_UI.DISABILITY_WELCOME_LABEL}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {job.disability_types.map(t => (
                  <span key={t} style={{ padding: '3px 10px', borderRadius: 8, background: 'var(--bg-cool)', color: 'var(--fg2)', fontSize: 12, fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ApplicationCard({ app, onMessage }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div 
      onClick={() => setExpanded(v => !v)}
      style={{ 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 14, 
        padding: '18px 22px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg1)', marginBottom: 2, fontFamily: 'var(--font-display)' }}>{app.title}</div>
          <div style={{ fontSize: 13, color: 'var(--fg3)' }}>{app.institution_name} · {app.modality}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ padding: '5px 12px', borderRadius: 8, background: `color-mix(in oklch, ${STATUS_COLORS[app.status] ?? '#888'} 10%, transparent)`, color: STATUS_COLORS[app.status] ?? '#888', fontSize: 12, fontWeight: 600 }}>
            {STATUS_LABELS[app.status] ?? app.status}
          </span>
          {app.institution_owner_id && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMessage(app) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--fg3)'}
              title="Enviar mensaje"
            >
              {Icons.message({ s: 16 })}
            </button>
          )}
          <span style={{ color: 'var(--fg3)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}>
            {Icons.arrowRight({ s: 14 })}
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 14 }} onClick={e => e.stopPropagation()}>
          {app.description && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{JOBS_UI.DESCRIPTION_LABEL}</div>
              <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: 0 }}>{app.description}</p>
            </div>
          )}
          {app.requirements && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{JOBS_UI.REQUIREMENTS_LABEL}</div>
              <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: 0 }}>{app.requirements}</p>
            </div>
          )}
          <div style={{ background: 'var(--bg-cool)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Mi carta de presentación</div>
            <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              {app.cover_letter || 'No adjuntaste carta de presentación.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function JobsPage() {
  const { logout } = useAuthStore()
  const { data: user } = useMe()
  const navigate = useNavigate()
  const { data: institution } = useMiInstitucion()
  const [modality, setModality] = useState('Todos')
  const [tab, setTab] = useState('board')
  const [applyTarget, setApplyTarget] = useState(null)
  const [showCreateJob, setShowCreateJob] = useState(false)
  const [messageTarget, setMessageTarget] = useState(null)
  const isInstitution = user?.role === 'institution' || user?.role === 'admin'
  const { data: catalogos } = useCatalogos()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const JOBS_PER_PAGE = 5

  const { data: jobs = [], isLoading, isError: jobsError, refetch: refetchJobs } = useJobs({})
  const { data: appliedIds = [] } = useAppliedJobIds()
  const { data: applications = [], isError: appsError } = useMyApplications()

  // Filter jobs based on search term and modality
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm ||
        (job.title ?? '').toLowerCase().includes(searchLower) ||
        (job.description ?? '').toLowerCase().includes(searchLower) ||
        (job.institution_name ?? '').toLowerCase().includes(searchLower) ||
        (job.city ?? '').toLowerCase().includes(searchLower) ||
        (job.state ?? '').toLowerCase().includes(searchLower)

      const matchesModality = modality === 'Todos' || job.modality === modality
      return matchesSearch && matchesModality
    })
  }, [jobs, searchTerm, modality])

  // Filter applications based on search term
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const searchLower = searchTerm.toLowerCase()
      const job = app.job || {}
      return !searchTerm ||
        (job.title ?? '').toLowerCase().includes(searchLower) ||
        (job.description ?? '').toLowerCase().includes(searchLower) ||
        (job.institution_name ?? '').toLowerCase().includes(searchLower) ||
        (job.city ?? '').toLowerCase().includes(searchLower) ||
        (job.state ?? '').toLowerCase().includes(searchLower)
    })
  }, [applications, searchTerm])

  const currentItems = tab === 'board' ? filteredJobs : filteredApps
  const totalPages = Math.ceil(currentItems.length / JOBS_PER_PAGE)

  // Reset page when filters change
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, modality, tab])
  /* eslint-enable react-hooks/set-state-in-effect */

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE
    return currentItems.slice(startIndex, startIndex + JOBS_PER_PAGE)
  }, [currentItems, currentPage])

  // Count for tabs
  const boardCount = jobs.length
  const appsCount = applications.length

  return (
    <>
      <main className="responsive-main" style={{ '--main-max-width': '900px' }}>
        {/* ── Header: Title Left, Actions Right ── */}
        <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 className="animate-title" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>
              {JOBS_UI.PAGE_TITLE}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>{JOBS_UI.PAGE_SUBTITLE}</p>
          </div>
          {isInstitution && (
            <button className="btn-primary" onClick={() => setShowCreateJob(true)} style={{ padding: '8px 16px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8 }}>
              {Icons.plus({ s: 14 })} {JOBS_UI.CREATE_JOB}
            </button>
          )}
        </div>

        {/* ── iOS-style Segmented Control ── */}
        <div className="animate-fade-in-up delay-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', background: 'var(--bg-cool)', borderRadius: 10, padding: 3, gap: 2 }}>
            {[['board', JOBS_UI.TAB_BOARD, boardCount], ['applications', JOBS_UI.TAB_APPLICATIONS, appsCount]].map(([key, label, count]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: tab === key ? 'var(--bg-surface)' : 'transparent',
                  boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  color: tab === key ? 'var(--fg1)' : 'var(--fg3)',
                  cursor: 'pointer',
                  fontWeight: tab === key ? 600 : 500,
                  fontSize: 13.5,
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {label}
                <span style={{ fontSize: 11, fontWeight: 600, color: tab === key ? 'var(--primary)' : 'var(--fg3)', background: tab === key ? 'var(--primary-subtle)' : 'transparent', padding: '1px 7px', borderRadius: 6 }}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="animate-fade-in-up delay-2" style={{
          display: 'flex',
          gap: 12,
          marginBottom: 20,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg3)', display: 'flex', alignItems: 'center' }}>
              {Icons.search({ s: 18 })}
            </span>
            <input
              type="text"
              placeholder={tab === 'board' ? "Buscar vacantes por título, empresa, ciudad..." : "Buscar en mis postulaciones..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                borderRadius: 10,
                border: '1.5px solid var(--border-color)',
                outline: 'none',
                fontSize: 14,
                fontFamily: 'var(--font-body)',
                background: 'var(--bg-warm)',
                color: 'var(--fg1)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--primary)'
                e.target.style.boxShadow = '0 0 0 3px var(--primary-subtle)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border-color)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Filter select for Modality */}
          {tab === 'board' && (
            <div style={{ position: 'relative', minWidth: 180 }}>
              <select
                value={modality}
                onChange={e => setModality(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 14px',
                  borderRadius: 10,
                  border: '1.5px solid var(--border-color)',
                  outline: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                  background: 'var(--bg-warm)',
                  color: 'var(--fg1)',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                }}
              >
                <option value="Todos">Modalidad: Todas</option>
                {catalogos?.modalidadesEmpleo?.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {tab === 'board' ? (
          <>
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: 120, borderRadius: 'var(--radius-md)', background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : jobsError ? (
              <BackendFallback method={JOB_ENDPOINTS.LIST.method} endpoint={JOB_ENDPOINTS.LIST.path} onRetry={() => refetchJobs()} />
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-color)' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'var(--primary)' }}>
                  {Icons.briefcase({ s: 22 })}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg1)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>{JOBS_UI.NO_JOBS}</h3>
                <p style={{ color: 'var(--fg3)', fontSize: 14, margin: 0 }}>{JOBS_UI.NO_JOBS_HINT}</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--fg3)', fontSize: 15, margin: 0 }}>No se encontraron vacantes para tu búsqueda. Intenta con otros términos o filtros.</p>
              </div>
            ) : (
              <>
                <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {paginatedItems.map(job => (
                    <div key={job.id} className="animate-fade-in-up"><JobCard job={job} applied={appliedIds.includes(job.id)} onApply={() => setApplyTarget(job)} onMessage={setMessageTarget} userRole={user?.role} institutionId={institution?.id} onNavigateToPortal={(targetTab) => navigate(targetTab ? `/institution-portal?tab=${targetTab}` : '/institution-portal')} onEditJob={(job) => navigate(`/institution-portal/editar?jobId=${job.id}`)} /></div>
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 12 }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-surface)',
                        color: currentPage === 1 ? 'var(--fg3)' : 'var(--fg1)',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: 13.5,
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {Icons.arrowLeft({ s: 14 })} Anterior
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1
                      const isCurrent = pageNum === currentPage
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            border: isCurrent ? '1.5px solid var(--primary)' : '1.5px solid var(--border-color)',
                            background: isCurrent ? 'var(--primary)' : 'var(--bg-surface)',
                            color: isCurrent ? '#fff' : 'var(--fg1)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 13.5,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-surface)',
                        color: currentPage === totalPages ? 'var(--fg3)' : 'var(--fg1)',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: 13.5,
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      Siguiente {Icons.arrowRight({ s: 14 })}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--fg3)', fontSize: 14 }}>{JOBS_UI.NO_APPLICATIONS}</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--fg3)', fontSize: 15, margin: 0 }}>No se encontraron postulaciones para tu búsqueda.</p>
              </div>
            ) : (
              <>
                <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {paginatedItems.map(app => (
                    <div key={app.id} className="animate-fade-in-up">
                      <ApplicationCard app={app} onMessage={setMessageTarget} />
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 12 }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-surface)',
                        color: currentPage === 1 ? 'var(--fg3)' : 'var(--fg1)',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: 13.5,
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {Icons.arrowLeft({ s: 14 })} Anterior
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1
                      const isCurrent = pageNum === currentPage
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            border: isCurrent ? '1.5px solid var(--primary)' : '1.5px solid var(--border-color)',
                            background: isCurrent ? 'var(--primary)' : 'var(--bg-surface)',
                            color: isCurrent ? '#fff' : 'var(--fg1)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 13.5,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-surface)',
                        color: currentPage === totalPages ? 'var(--fg3)' : 'var(--fg1)',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: 13.5,
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      Siguiente {Icons.arrowRight({ s: 14 })}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {applyTarget && <ApplicationModal job={applyTarget} onClose={() => setApplyTarget(null)} />}
      {showCreateJob && <CreateJobModal onClose={() => setShowCreateJob(false)} />}
      {messageTarget && <MessageModal job={messageTarget} onClose={() => setMessageTarget(null)} />}
    </>
  )
}
