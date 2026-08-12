import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, LeafIcon } from '@shared/components/shared'
import { useMyJobPostings, useCreateJobPosting, useDeleteJobPosting, useToggleJobStatus } from '../hooks/useInstitutionJobs'
import { PORTAL_UI, PORTAL_TOAST } from '../constants/institutionPortalMessages'
import BackendFallback from '@shared/components/BackendFallback'
import { JOB_ENDPOINTS } from '@shared/constants/backendEndpoints'
import { useMe } from '../../auth/hooks/useAuth'
import { useMiInstitucion } from '../hooks/useInstitutions'
import { useChat } from '../../tutor/hooks/useAI'

/* ─── CreateJobModal ──────────────────────────────────────── */
function CreateJobModal({ onClose }) {
  const { data: user } = useMe()
  const { data: myInstitution } = useMiInstitucion()
  const chatMutation = useChat()
  const createJob = useCreateJobPosting()
  const { addToast } = useUiStore()

  const [step, setStep] = useState(1)
  const [cargo, setCargo] = useState('')
  const [empresa, setEmpresa] = useState(() => myInstitution?.nombre || user?.full_name || '')
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiCardDismissed, setAiCardDismissed] = useState(false)
  const [locationInput, setLocationInput] = useState(() => {
    return `${myInstitution?.ciudad || ''}${myInstitution?.state || myInstitution?.estado ? `, ${myInstitution.state || myInstitution.estado}` : ''}`
  })

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    modalidad: 'presencial',
    horario: 'Jornada completa',
    rangoSalario: '',
    ciudad: myInstitution?.ciudad || '',
    estado: myInstitution?.state || myInstitution?.estado || '',
    inclusivaDiscapacidad: true
  })

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleAIWrite = async () => {
    if (!cargo.trim()) return
    setIsLoadingAI(true)
    try {
      const prompt = `Genera un anuncio de empleo completo para el cargo '${cargo}' en la empresa '${empresa}'.
Por favor, estructura la respuesta exactamente con las siguientes secciones:
1. DESCRIPCIÓN GENERAL (un párrafo introductorio atractivo)
2. RESPONSABILIDADES (una lista numerada de 4 tareas principales)
3. REQUISITOS (una lista con viñetas de requisitos de experiencia, aptitud y valores de inclusión).
Sé profesional, amigable y utiliza lenguaje inclusivo.`

      const res = await chatMutation.mutateAsync({ mensaje: prompt })
      const text = res?.respuesta ?? ''
      update('descripcion', text)
      setStep(2)
    } catch (err) {
      console.error(err)
      addToast('Error al generar con IA. Escribe por tu cuenta.', 'error')
      handleManualWrite()
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleManualWrite = () => {
    const template = `Consejos: Haz un resumen del puesto, explica qué se necesita para triunfar en él y el lugar que ocupa en la empresa.

Responsabilidades
[Describe con precisión todas las responsabilidades. Usa un lenguaje inclusivo.]
Ejemplo: Definir y desarrollar los requisitos para los sistemas en fase de producción para garantizar la máxima facilidad de uso.

Requisitos
[Algunos requisitos que podrías incluir: aptitudes, estudios, experiencia o certificados.]
Ejemplo: Excelentes dotes para la comunicación oral y escrita.`

    update('descripcion', template)
    setStep(2)
  }

  const handleLocationChange = (val) => {
    setLocationInput(val)
    const parts = val.split(',')
    update('ciudad', parts[0]?.trim() || '')
    update('estado', parts[1]?.trim() || '')
  }

  const insertText = (before, after) => {
    const textarea = document.getElementById('job-desc-textarea')
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selected = text.substring(start, end)
    const replacement = before + selected + after
    update('descripcion', text.substring(0, start) + replacement + text.substring(end))
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createJob.mutateAsync(form)
      addToast(PORTAL_TOAST.JOB_CREATED, 'success')
      onClose()
    } catch (err) {
      addToast(err?.response?.data?.message ?? PORTAL_TOAST.JOB_CREATE_FAILED, 'error')
    }
  }

  const inputStylePremium = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    fontSize: 14,
    boxSizing: 'border-box',
    fontFamily: 'var(--font-body)',
    color: 'var(--fg1)',
    background: 'var(--modal-input-bg)',
    outline: 'none',
    transition: 'all 0.2s ease',
  }

  const labelStylePremium = {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--fg2)',
    display: 'block',
    marginBottom: 8,
  }

  const toolbarBtnStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--fg2)',
    fontWeight: 700,
    fontSize: 13,
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.15s ease',
  }

  const userFirstName = user?.full_name?.split(' ')[0] ?? 'Lourdes'

  if (step === 1) {
    return createPortal(
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'var(--modal-backdrop)', backdropFilter: 'blur(10px) saturate(140%)', WebkitBackdropFilter: 'blur(10px) saturate(140%)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div onClick={e => e.stopPropagation()} className="animate-scale-in" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', borderRadius: '24px', padding: 36, maxWidth: 520, width: '100%', boxShadow: 'var(--glass-shadow)', border: '1px solid var(--glass-border)', position: 'relative' }}>
          <button onClick={onClose} aria-label="Cerrar modal" style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--fg3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, lineHeight: 1 }}>
            &times;
          </button>

          {/* Leaf icon centered */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <LeafIcon size={36} color="var(--primary)" />
          </div>

          <p style={{ textAlign: 'center', fontSize: 16, color: 'var(--primary)', fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.02em' }}>
            Hola, {userFirstName}:
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--fg1)', textAlign: 'center', margin: '0 0 10px', lineHeight: 1.25 }}>
            Encuentra a tu candidato ideal
          </h2>

          <p style={{ fontSize: 14.5, color: 'var(--fg3)', textAlign: 'center', margin: '0 0 28px', lineHeight: 1.5, padding: '0 10px' }}>
            El 86 % de las pequeñas empresas obtienen un candidato cualificado en solo un día
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
            <div>
              <label htmlFor="cargo-input" style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg2)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                Cargo <span style={{ cursor: 'help', color: 'var(--fg3)' }} title="Puesto o profesión que necesitas cubrir">❔</span>
              </label>
              <input 
                id="cargo-input" 
                value={cargo} 
                onChange={e => { setCargo(e.target.value); update('titulo', e.target.value) }} 
                placeholder="Añade el puesto que necesitas cubrir" 
                style={inputStylePremium} 
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="empresa-input" style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 8 }}>
                Empresa
              </label>
              <input 
                id="empresa-input" 
                value={empresa} 
                onChange={e => setEmpresa(e.target.value)} 
                placeholder="Nombre de la empresa o institución" 
                style={inputStylePremium} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <button 
              className="btn-primary" 
              onClick={handleAIWrite} 
              disabled={isLoadingAI || !cargo.trim()} 
              style={{ width: '100%', height: 48, borderRadius: '24px', fontSize: 15, fontWeight: 700, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', cursor: 'pointer', color: 'white', transition: 'all 0.2s' }}
            >
              {isLoadingAI ? Icons.loader({ s: 18 }) : Icons.sparkles({ s: 16 })} 
              {isLoadingAI ? 'Generando descripción...' : 'Escribir con IA'}
            </button>

            <button 
              onClick={handleManualWrite}
              disabled={isLoadingAI || !cargo.trim()}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, padding: '8px 16px' }}
            >
              Escribir por mi cuenta
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'var(--modal-backdrop)', backdropFilter: 'blur(10px) saturate(140%)', WebkitBackdropFilter: 'blur(10px) saturate(140%)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="animate-scale-in" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', borderRadius: '24px', padding: 36, maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--glass-shadow)', border: '1px solid var(--glass-border)', position: 'relative' }}>
        <button onClick={onClose} aria-label="Cerrar modal" style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--fg3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, lineHeight: 1 }}>
          &times;
        </button>

        {/* Step Indicator */}
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          1 de 2: Revisa la descripción del empleo
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 20px' }}>
          Detalles del empleo*
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Grid fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStylePremium}>Cargo <span style={{ cursor: 'help', color: 'var(--fg3)' }} title="Nombre del puesto">❔</span></label>
              <input required value={form.titulo} onChange={e => update('titulo', e.target.value)} style={inputStylePremium} />
            </div>
            <div>
              <label style={labelStylePremium}>Empresa</label>
              <input value={empresa} onChange={e => setEmpresa(e.target.value)} style={inputStylePremium} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStylePremium}>Tipo de lugar de trabajo</label>
              <select value={form.modalidad} onChange={e => update('modalidad', e.target.value)} style={{ ...inputStylePremium, cursor: 'pointer' }}>
                <option value="presencial">Presencial</option>
                <option value="remoto">Remoto</option>
                <option value="híbrido">Híbrido</option>
              </select>
            </div>
            <div>
              <label style={labelStylePremium}>Ubicación del empleo <span style={{ cursor: 'help', color: 'var(--fg3)' }} title="Ciudad, Estado">❔</span></label>
              <input value={locationInput} onChange={e => handleLocationChange(e.target.value)} placeholder="Ej. Mérida, Yucatán" style={inputStylePremium} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStylePremium}>Tipo de empleo</label>
              <select value={form.horario} onChange={e => update('horario', e.target.value)} style={{ ...inputStylePremium, cursor: 'pointer' }}>
                <option value="Jornada completa">Jornada completa</option>
                <option value="Medio tiempo">Medio tiempo</option>
                <option value="Por contrato">Por contrato</option>
                <option value="Prácticas">Prácticas</option>
              </select>
            </div>
            <div>
              <label style={labelStylePremium}>Rango de salario (opcional)</label>
              <input value={form.rangoSalario} onChange={e => update('rangoSalario', e.target.value)} placeholder="Ej. $15,000 - $18,000" style={inputStylePremium} />
            </div>
          </div>

          {/* AI rewrite action button */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              type="button" 
              onClick={handleAIWrite} 
              disabled={isLoadingAI}
              style={{ padding: '8px 16px', borderRadius: '18px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg2)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {isLoadingAI ? Icons.loader({ s: 14 }) : Icons.sparkles({ s: 13 })}
              {isLoadingAI ? 'Reescribiendo con IA...' : 'Reescribir con IA'}
            </button>
          </div>

          {/* Description area */}
          <div>
            <label style={labelStylePremium}>Descripción*</label>

            {/* Warning suggestion card */}
            {!aiCardDismissed && (
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: 12, fontSize: 13, color: 'var(--fg2)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span>💡</span>
                  <span>Crea un gran anuncio de empleo con las sugerencias a continuación. <a href="#" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }} onClick={e => e.preventDefault()}>Más información</a></span>
                </div>
                <button type="button" onClick={() => setAiCardDismissed(true)} aria-label="Cerrar sugerencia" style={{ background: 'none', border: 'none', color: 'var(--fg3)', cursor: 'pointer', padding: 0 }}>
                  &times;
                </button>
              </div>
            )}

            {/* Textarea editor container */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-surface)' }}>
              {/* Toolbar */}
              <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                <button type="button" onClick={() => insertText('**', '**')} style={toolbarBtnStyle} title="Negrita"><b>B</b></button>
                <button type="button" onClick={() => insertText('*', '*')} style={{ ...toolbarBtnStyle, fontStyle: 'italic' }} title="Cursiva">I</button>
                <button type="button" onClick={() => insertText('\n- ', '')} style={toolbarBtnStyle} title="Lista con viñetas">• List</button>
                <button type="button" onClick={() => insertText('\n1. ', '')} style={toolbarBtnStyle} title="Lista numerada">1. List</button>
              </div>

              {/* Textarea itself */}
              <textarea 
                id="job-desc-textarea"
                rows={10} 
                required 
                value={form.descripcion} 
                onChange={e => update('descripcion', e.target.value)} 
                placeholder="Describe los detalles del puesto..." 
                style={{ width: '100%', padding: '16px', border: 'none', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
              />
            </div>
          </div>

          {/* Disability inclusive check */}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--fg2)', cursor: 'pointer', marginTop: 4 }}>
            <input type="checkbox" checked={form.inclusivaDiscapacidad} onChange={e => update('inclusivaDiscapacidad', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
            {PORTAL_UI.INCLUSIVE_CHECKBOX}
          </label>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
            <button type="button" onClick={() => setStep(1)} style={{ padding: '12px 24px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)' }}>Atrás</button>
            <button type="submit" className="btn-primary" disabled={!form.titulo.trim() || !form.descripcion.trim() || createJob.isPending} style={{ padding: '12px 28px', fontSize: 14, fontWeight: 700, borderRadius: '24px', background: 'var(--primary)', border: 'none', cursor: 'pointer', color: 'white' }}>
              {createJob.isPending ? 'Publicando...' : 'Publicar vacante'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

/* ─── DeleteConfirmModal ─────────────────────────────────── */
function DeleteConfirmModal({ job, onClose, onConfirm }) {
  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'var(--modal-backdrop)', backdropFilter: 'blur(10px) saturate(140%)', WebkitBackdropFilter: 'blur(10px) saturate(140%)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="animate-scale-in" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', borderRadius: 'var(--radius-md)', padding: 28, maxWidth: 420, width: '100%', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'color-mix(in oklch, var(--color-error) 14%, transparent)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {Icons.shieldAlert({ s: 20 })}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{PORTAL_UI.DELETE_CONFIRM_TITLE}</h3>
        </div>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5, margin: '0 0 20px' }}>
          {PORTAL_UI.DELETE_CONFIRM_MESSAGE}
        </p>
        <p style={{ fontSize: 14, color: 'var(--fg1)', fontWeight: 600, margin: '0 0 20px' }}>
          "{job.title}"
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={onClose}>{PORTAL_UI.CANCEL_BUTTON}</button>
          <button onClick={onConfirm} style={{ fontSize: 14, padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-error)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{PORTAL_UI.CONFIRM_DELETE}</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ─── PostulacionesTab ───────────────────────────────────── */
export default function PostulacionesTab({ onViewCandidates }) {
  const { addToast } = useUiStore()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: myInstitution, isLoading: loadingInst } = useMiInstitucion()
  const { data: jobs = [], isLoading, isError, refetch } = useMyJobPostings()
  const toggleStatus = useToggleJobStatus()
  const deleteJob = useDeleteJobPosting()
  const hasInstitution = !loadingInst && !!myInstitution

  const filteredJobs = search.trim()
    ? jobs.filter(j => {
        const q = search.toLowerCase()
        return (j.title ?? '').toLowerCase().includes(q) ||
               (j.city ?? '').toLowerCase().includes(q) ||
               (j.modality ?? '').toLowerCase().includes(q)
      })
    : jobs

  const handleToggleStatus = (job) => {
    toggleStatus.mutate(
      { id: job.id, is_active: !job.is_active },
      {
        onSuccess: () => addToast(PORTAL_TOAST.STATUS_CHANGED, 'success'),
        onError: () => addToast(PORTAL_TOAST.STATUS_CHANGE_FAILED, 'error'),
      }
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteJob.mutate(deleteTarget.id, {
      onSuccess: () => {
        addToast(PORTAL_TOAST.JOB_DELETED, 'success')
        setDeleteTarget(null)
      },
      onError: () => addToast(PORTAL_TOAST.JOB_DELETE_FAILED, 'error'),
    })
  }

  const inputStyle = { height: 40, padding: '0 12px 0 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)', width: '100%' }

  const handleCreateJob = () => {
    if (!hasInstitution) {
      addToast('Primero debes completar el registro de tu institución.', 'error')
      navigate('/institution-portal/registro')
      return
    }
    setShowCreate(true)
  }

  if (isError) {
    return <BackendFallback method={JOB_ENDPOINTS.LIST.method} endpoint={JOB_ENDPOINTS.LIST.path} onRetry={() => refetch()} />
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn-primary" onClick={handleCreateJob} style={{ padding: '10px 18px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.plus({ s: 16 })} {PORTAL_UI.CREATE_JOB}
        </button>
        <div style={{ position: 'relative', flex: 1, minWidth: 220, marginLeft: 'auto' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg3)' }}>{Icons.search({ s: 16 })}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={PORTAL_UI.SEARCH_PLACEHOLDER}
            style={inputStyle} />
        </div>
      </div>

      {/* Job Cards */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 140, borderRadius: 'var(--radius-md)', background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
            {Icons.briefcase({ s: 24 })}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>{PORTAL_UI.NO_POSTULACIONES}</h3>
          <p style={{ color: 'var(--fg3)', fontSize: 14, margin: 0 }}>{PORTAL_UI.NO_POSTULACIONES_HINT}</p>
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredJobs.map(job => (
            <div key={job.id} className="animate-fade-in-up" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                      {job.title}
                    </h3>
                    <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: job.is_active ? 'color-mix(in oklch, var(--color-artes) 14%, transparent)' : 'color-mix(in oklch, var(--color-empleo) 14%, transparent)',
                      color: job.is_active ? 'var(--color-artes)' : 'var(--color-empleo)' }}>
                      {job.is_active ? PORTAL_UI.STATUS_ACTIVE : PORTAL_UI.STATUS_PAUSED}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, color: 'var(--fg3)' }}>
                    {job.city && <span>{Icons.mapPin({ s: 13 })} {job.city}{job.state ? `, ${job.state}` : ''}</span>}
                    <span style={{ textTransform: 'capitalize', background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '2px 10px', borderRadius: 10, fontWeight: 600 }}>
                      {job.modality}
                    </span>
                    {job.salary_range && <span style={{ fontWeight: 600, color: 'var(--fg2)' }}>{job.salary_range}</span>}
                  </div>
                  {job.disability_inclusive && (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#4BA3A3', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {Icons.users({ s: 13 })} Inclusiva
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
                    {Icons.users({ s: 16 })}
                    <span>{job.applicants_count}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg3)' }}>candidatos</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
                    {job.created_at ? new Date(job.created_at).toLocaleDateString('es-MX') : '—'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <button onClick={() => onViewCandidates(job.id)}
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--primary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-subtle)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)' }}>
                      {Icons.users({ s: 12 })} {PORTAL_UI.VIEW_APPLICANTS}
                    </button>
                    <button onClick={() => handleToggleStatus(job)}
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-cool)'; e.currentTarget.style.color = 'var(--fg1)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--fg2)' }}>
                      {job.is_active ? (
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      ) : (
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      )} {PORTAL_UI.TOGGLE_STATUS}
                    </button>
                    <button onClick={() => setDeleteTarget(job)}
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--color-error)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in oklch, var(--color-error) 8%, var(--bg-surface))' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)' }}>
                      {Icons.trash({ s: 12 })} {PORTAL_UI.DELETE_JOB}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && <CreateJobModal onClose={() => setShowCreate(false)} />}
      {deleteTarget && <DeleteConfirmModal job={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </div>
  )
}
