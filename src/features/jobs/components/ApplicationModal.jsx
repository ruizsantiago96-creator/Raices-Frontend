import { useState, useRef, useEffect, useMemo } from 'react'
import { useAuthStore, useMe, useUpdateProfile } from '@features/auth'
import { useDependientes } from '@features/tutor'
import { useApplyJob } from '../hooks/useJobs'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import { JOBS_TOAST, JOBS_UI } from '../constants/jobsMessages'
import CandidateOption from './CandidateOption'
import CvDocumentPreview from './CvDocumentPreview'
import { flagIcon, filePdfIcon } from './jobsIcons'

const inputStyle = {
  width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)', fontSize: 14, boxSizing: 'border-box',
  fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)',
  outline: 'none', transition: 'border-color 0.15s ease',
}

const labelStyle = {
  fontSize: 14, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 8,
}

const renderProgress = (percent) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, width: '100%' }}>
    <div style={{ flex: 1, height: 4, background: 'var(--border-color)', borderRadius: 2 }}>
      <div style={{ height: '100%', width: `${percent}%`, background: 'var(--primary)', borderRadius: 2, transition: 'width 0.3s ease' }} />
    </div>
    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', fontFamily: 'var(--font-bold)' }}>{percent}%</span>
  </div>
)

export default function ApplicationModal({ job, onClose }) {
  const { user: authUser } = useAuthStore()
  const { data: meData } = useMe()
  const { data: dependents = [], isLoading: loadingDependents } = useDependientes()
  const updateProfile = useUpdateProfile()
  const apply = useApplyJob()
  const { addToast } = useUiStore()

  const isTutor = authUser?.role === 'tutor'

  // Pasos: 0 (Candidato - solo tutor), 1 (Ubicación), 2 (CV), 3 (Revisión)
  const [step, setStep] = useState(isTutor ? 0 : 1)

  // Tipo de candidato (tutor)
  const [candidateType, setCandidateType] = useState('me')
  const [selectedCandidateId, setSelectedCandidateId] = useState(null)

  // Información de contacto del candidato
  const [contactInfo, setContactInfo] = useState({ nombreCompleto: '', email: '', telefono: '', ciudadEstado: '' })
  const [editingContact, setEditingContact] = useState(false)
  const [tempContactInfo, setTempContactInfo] = useState({ nombreCompleto: '', email: '', telefono: '', ciudadEstado: '' })

  // Ubicación
  const [location, setLocation] = useState({ pais: 'México', codigoPostal: '', ciudadEstado: '', direccion: '' })
  const [isEditingCountry, setIsEditingCountry] = useState(false)

  // Archivo CV
  const [cvFile, setCvFile] = useState(null)
  const [cvFileUrl, setCvFileUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => { if (cvFileUrl) URL.revokeObjectURL(cvFileUrl) }
  }, [cvFileUrl])

  // Carta de presentación
  const [letter, setLetter] = useState('')

  // Clasificar dependientes
  const { managedProfiles, linkedAccounts } = useMemo(() => {
    if (!isTutor) return { managedProfiles: [], linkedAccounts: [] }
    const managed = []
    const linked = []
    dependents.forEach(dep => {
      if (dep.esCuentaVinculada) linked.push(dep)
      else managed.push(dep)
    })
    return { managedProfiles: managed, linkedAccounts: linked }
  }, [dependents, isTutor])

  const getCandidateId = () => {
    if (!isTutor || candidateType === 'me') return undefined
    return selectedCandidateId
  }

  const initializeCandidateData = () => {
    let name = '', email = '', phone = '', cityState = ''
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
      const c = meData?.city || authUser?.city || ''
      const s = meData?.state || authUser?.state || ''
      cityState = c && s ? `${c}, ${s}` : c || s || ''
    }

    const info = { nombreCompleto: name, email, telefono: phone, ciudadEstado: cityState }
    setContactInfo(info)
    setTempContactInfo(info)
    setLocation({
      pais: 'México',
      codigoPostal: localStorage.getItem('raices_user_cp_' + (currentCandidateId || 'me')) || '',
      ciudadEstado: cityState,
      direccion: localStorage.getItem('raices_user_address_' + (currentCandidateId || 'me')) || ''
    })

    const savedCv = localStorage.getItem('raices_user_cv_' + (currentCandidateId || 'me'))
    if (savedCv) { try { setCvFile(JSON.parse(savedCv)) } catch { setCvFile(null) } }
    else { setCvFile(null) }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (!isTutor && meData) initializeCandidateData() }, [meData, isTutor])

  const handleCandidateTypeChange = (type) => { setCandidateType(type); setSelectedCandidateId(null) }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { addToast('El formato del archivo debe ser PDF', 'error'); return }
    if (file.size > 10 * 1024 * 1024) { addToast('El archivo supera el límite de 10MB', 'error'); return }
    setIsUploading(true)
    setTimeout(() => {
      const fileData = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadDate: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
      }
      setCvFile(fileData)
      if (cvFileUrl) URL.revokeObjectURL(cvFileUrl)
      setCvFileUrl(URL.createObjectURL(file))
      setIsUploading(false)
      const cid = getCandidateId()
      localStorage.setItem('raices_user_cv_' + (cid || 'me'), JSON.stringify(fileData))
      addToast('CV cargado con éxito', 'success')
    }, 1000)
  }

  const handleLocationSubmit = async () => {
    if (!location.codigoPostal.trim() || !location.ciudadEstado.trim()) {
      addToast('Por favor completa los campos requeridos (*)', 'error'); return
    }
    const cid = getCandidateId()
    localStorage.setItem('raices_user_cp_' + (cid || 'me'), location.codigoPostal)
    localStorage.setItem('raices_user_address_' + (cid || 'me'), location.direccion)
    setContactInfo(prev => ({ ...prev, ciudadEstado: location.ciudadEstado }))
    setTempContactInfo(prev => ({ ...prev, ciudadEstado: location.ciudadEstado }))
    if (!isTutor || candidateType === 'me') {
      const parts = location.ciudadEstado.split(',')
      const city = parts[0]?.trim() || ''
      const state = parts[1]?.trim() || ''
      try { await updateProfile.mutateAsync({ full_name: contactInfo.nombreCompleto || meData?.full_name || authUser?.full_name, city, state }) }
      catch { /* silent */ }
    }
    setStep(2)
  }

  const saveEditedContact = () => { setContactInfo(tempContactInfo); setEditingContact(false); addToast('Información de contacto guardada', 'success') }

  const submit = async (e) => {
    e.preventDefault()
    const cid = getCandidateId()
    localStorage.setItem('raices_user_phone_' + (cid || 'me'), contactInfo.telefono)
    try {
      await apply.mutateAsync({ jobId: job.id, cover_letter: letter, candidateId: cid })
      addToast(JOBS_TOAST.APPLICATION_SENT, 'success')
      onClose()
    } catch (err) {
      addToast(err?.response?.data?.message ?? JOBS_TOAST.APPLICATION_FAILED, 'error')
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="animate-scale-in glass-card" style={{ padding: '24px 28px 28px', maxWidth: 580, width: '100%', maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
          {step > (isTutor ? 0 : 1) ? (
            <button type="button" onClick={() => setStep(prev => prev - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg2)', display: 'flex', alignItems: 'center', padding: 4 }}>
              {Icons.arrowLeft({ s: 20 })}
            </button>
          ) : <div style={{ width: 28 }} />}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Postulando a</span>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>{job.title}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s ease, border-color 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-cool)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-surface)' }}>
            {Icons.x({ s: 18 })}
          </button>
        </div>

        {/* ─── PASO 0: SELECCIÓN DE CANDIDATO (Tutores) ─── */}
        {step === 0 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>¿Quién se va a postular?</h2>
            <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '0 0 20px' }}>{job.institution_name}</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <CandidateOption label={JOBS_UI.CANDIDATE_ME} description={JOBS_UI.CANDIDATE_ME_DESCRIPTION} icon={Icons.user({ s: 16 })} selected={candidateType === 'me'} onClick={() => handleCandidateTypeChange('me')} />
              <CandidateOption label={JOBS_UI.CANDIDATE_MANAGED} description={JOBS_UI.CANDIDATE_MANAGED_DESCRIPTION} icon={Icons.users({ s: 16 })} selected={candidateType === 'managed'} onClick={() => handleCandidateTypeChange('managed')} disabled={loadingDependents} />
              <CandidateOption label={JOBS_UI.CANDIDATE_LINKED} description={JOBS_UI.CANDIDATE_LINKED_DESCRIPTION} icon={Icons.link({ s: 16 })} selected={candidateType === 'linked'} onClick={() => handleCandidateTypeChange('linked')} disabled={loadingDependents} />
            </div>
            {candidateType !== 'me' && (
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>{JOBS_UI.CANDIDATE_SELECT_PLACEHOLDER}</label>
                {loadingDependents ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', color: 'var(--fg3)', fontSize: 14 }}>{Icons.loader({ s: 14 })} {JOBS_UI.CANDIDATE_LOADING}</div>
                ) : (
                  <select value={selectedCandidateId || ''} onChange={(e) => setSelectedCandidateId(e.target.value || null)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Selecciona un dependiente...</option>
                    {candidateType === 'managed' ? (
                      managedProfiles.length > 0 ? managedProfiles.map(dep => <option key={dep.id} value={dep.id}>{dep.nombreCompleto} ({dep.parentesco})</option>) : <option value="" disabled>{JOBS_UI.CANDIDATE_NO_MANAGED}</option>
                    ) : (
                      linkedAccounts.length > 0 ? linkedAccounts.map(dep => <option key={dep.id} value={dep.id}>{dep.nombreCompleto} ({dep.parentesco})</option>) : <option value="" disabled>{JOBS_UI.CANDIDATE_NO_LINKED}</option>
                    )}
                  </select>
                )}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="button" className="btn-primary" disabled={candidateType !== 'me' && !selectedCandidateId} onClick={() => { initializeCandidateData(); setStep(1) }} style={{ padding: '12px 32px', fontSize: 14, fontWeight: 700 }}>Continuar</button>
            </div>
          </div>
        )}

        {/* ─── PASO 1: AGREGA TU UBICACIÓN ─── */}
        {step === 1 && (
          <div className="animate-fade-in">
            {renderProgress(33)}
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>Agrega tu ubicación</h2>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 24px', lineHeight: 1.5 }}>Guardaremos esta información en tu perfil. Los campos marcados con (*) son obligatorios.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-cool)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--fg3)', display: 'block', fontWeight: 600, marginBottom: 2 }}>País</span>
                  {isEditingCountry ? <input type="text" value={location.pais} onChange={e => setLocation({ ...location, pais: e.target.value })} style={{ ...inputStyle, padding: '4px 8px', marginTop: 4 }} placeholder="Ingresa tu país" /> : <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)' }}>{location.pais}</span>}
                </div>
                <button type="button" onClick={() => setIsEditingCountry(!isEditingCountry)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13.5, fontWeight: 700 }}>{isEditingCountry ? 'Listo' : 'Cambiar'}</button>
              </div>
              <div><label style={labelStyle}>Código postal *</label><input type="text" required value={location.codigoPostal} onChange={e => setLocation({ ...location, codigoPostal: e.target.value })} style={inputStyle} placeholder="Escribe tu código postal (ej: 97314)" /></div>
              <div><label style={labelStyle}>Ciudad, estado *</label><input type="text" required value={location.ciudadEstado} onChange={e => setLocation({ ...location, ciudadEstado: e.target.value })} style={inputStyle} placeholder="Ciudad, Estado (ej: Mérida, Yucatán)" /></div>
              <div><label style={labelStyle}>Dirección</label><span style={{ fontSize: 11, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>👁️ Oculta para las empresas hasta la contratación</span><input type="text" value={location.direccion} onChange={e => setLocation({ ...location, direccion: e.target.value })} style={inputStyle} placeholder="Dirección (calle, número, etc.)" /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
              <button type="button" className="btn-primary" onClick={handleLocationSubmit} style={{ padding: '12px 32px', fontSize: 14, fontWeight: 700 }}>Continuar</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 6, alignItems: 'center', color: 'var(--fg3)', fontSize: 12.5, cursor: 'pointer' }}>{flagIcon}<span style={{ textDecoration: 'underline' }}>Reportar un problema</span></div>
          </div>
        )}

        {/* ─── PASO 2: AGREGA UN CV ─── */}
        {step === 2 && (
          <div className="animate-fade-in">
            {renderProgress(44)}
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>Agrega un CV</h2>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 20px', lineHeight: 1.5 }}>Sube tu currículum en formato PDF para que los reclutadores puedan conocer tu perfil completo.</p>
            {!cvFile ? (
              <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '36px 20px', textAlign: 'center', background: 'var(--bg-cool)', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isUploading ? Icons.loader({ s: 22 }) : Icons.upload({ s: 20 })}</div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', display: 'block' }}>{isUploading ? 'Subiendo currículum...' : 'Sube tu currículum'}</span>
                  <span style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 4, display: 'block' }}>Soporta formatos PDF de hasta 10MB</span>
                </div>
                <button type="button" style={{ padding: '8px 18px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--primary)', background: '#fff', color: 'var(--primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 4 }}>Seleccionar archivo</button>
                <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: '2px solid var(--primary)', borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, var(--primary) 3%, #fff)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {filePdfIcon}
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cvFile.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--fg3)' }}>Subido el {cvFile.uploadDate} · {cvFile.size}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'green', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.check({ s: 12 })}</div>
                    <button type="button" onClick={() => { setCvFile(null); if (cvFileUrl) { URL.revokeObjectURL(cvFileUrl); setCvFileUrl(null) }; const cid = getCandidateId(); localStorage.removeItem('raices_user_cv_' + (cid || 'me')) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 4 }} title="Eliminar archivo">{Icons.trash({ s: 16 })}</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg2)', textAlign: 'left' }}>Vista previa de tu CV:</span>
                  <CvDocumentPreview name={contactInfo.nombreCompleto} email={contactInfo.email} phone={contactInfo.telefono} location={location.ciudadEstado} jobTitle={job.title} fileUrl={cvFileUrl} />
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="btn-primary" disabled={!cvFile} onClick={() => setStep(3)} style={{ padding: '12px 32px', fontSize: 14, fontWeight: 700 }}>Continuar</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, gap: 6, alignItems: 'center', color: 'var(--fg3)', fontSize: 12.5, cursor: 'pointer' }}>{flagIcon}<span style={{ textDecoration: 'underline' }}>Reportar un problema</span></div>
          </div>
        )}

        {/* ─── PASO 3: REVISAR POSTULACIÓN ─── */}
        {step === 3 && (
          <form onSubmit={submit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>Revisar postulación</h2>
              <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0 }}>Verifica tus datos. No podrás editar tu postulación después de enviarla.</p>
            </div>

            {/* INFORMACIÓN DE CONTACTO */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 18, background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', fontFamily: 'var(--font-bold)' }}>Información de contacto</span>
                {editingContact ? (
                  <button type="button" onClick={saveEditedContact} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Guardar</button>
                ) : (
                  <button type="button" onClick={() => { setTempContactInfo({ ...contactInfo }); setEditingContact(true) }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Editar</button>
                )}
              </div>
              {editingContact ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)' }}>Nombre completo</label><input type="text" value={tempContactInfo.nombreCompleto} onChange={e => setTempContactInfo({ ...tempContactInfo, nombreCompleto: e.target.value })} style={{ ...inputStyle, padding: '8px 12px' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)' }}>Email</label><input type="email" value={tempContactInfo.email} onChange={e => setTempContactInfo({ ...tempContactInfo, email: e.target.value })} style={{ ...inputStyle, padding: '8px 12px' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)' }}>Número de teléfono</label><input type="tel" value={tempContactInfo.telefono} onChange={e => setTempContactInfo({ ...tempContactInfo, telefono: e.target.value })} style={{ ...inputStyle, padding: '8px 12px' }} placeholder="Ej: +52 999 338 6267" /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)' }}>Ciudad, estado</label><input type="text" value={tempContactInfo.ciudadEstado} onChange={e => setTempContactInfo({ ...tempContactInfo, ciudadEstado: e.target.value })} style={{ ...inputStyle, padding: '8px 12px' }} /></div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                  <div><span style={{ fontSize: 12, color: 'var(--fg3)', display: 'block' }}>Nombre completo</span><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{contactInfo.nombreCompleto}</span></div>
                  <div><span style={{ fontSize: 12, color: 'var(--fg3)', display: 'block' }}>Email</span><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{contactInfo.email}</span><span style={{ fontSize: 10.5, color: 'var(--fg3)', display: 'block', marginTop: 2, fontStyle: 'italic' }}>Para tu seguridad, protegemos tus datos de contacto frente a correos spam.</span></div>
                  <div><span style={{ fontSize: 12, color: 'var(--fg3)', display: 'block' }}>Número de teléfono</span><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{contactInfo.telefono || 'No proporcionado'}</span></div>
                  <div><span style={{ fontSize: 12, color: 'var(--fg3)', display: 'block' }}>Ciudad, estado</span><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{contactInfo.ciudadEstado}</span></div>
                </div>
              )}
            </div>

            {/* CV CARGADO */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 18, background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', fontFamily: 'var(--font-bold)' }}>Currículum Vitae (CV)</span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" onClick={() => addToast('Descargando archivo...', 'info')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Descargar</button>
                  <button type="button" onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Editar</button>
                </div>
              </div>
              {cvFile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{filePdfIcon}<div style={{ textAlign: 'left' }}><span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fg1)', display: 'block' }}>{cvFile.name}</span><span style={{ fontSize: 11.5, color: 'var(--fg3)' }}>Se acaba de subir</span></div></div>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 6, padding: 8, background: 'var(--bg-cool)', overflow: 'hidden' }}>
                    <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', maxHeight: 180, overflow: 'hidden' }}>
                      <CvDocumentPreview name={contactInfo.nombreCompleto} email={contactInfo.email} phone={contactInfo.telefono} location={location.ciudadEstado} jobTitle={job.title} fileUrl={cvFileUrl} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CARTA DE PRESENTACIÓN */}
            <div>
              <label style={labelStyle}>Carta de presentación / Mensaje (opcional)</label>
              <textarea rows={4} value={letter} onChange={(e) => setLetter(e.target.value)} placeholder="Escribe un mensaje breve al reclutador contándole por qué eres el candidato ideal..." style={inputStyle} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="submit" className="btn-primary" disabled={apply.isPending || editingContact || !contactInfo.nombreCompleto.trim()} style={{ padding: '12px 32px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                {apply.isPending ? <>{Icons.loader({ s: 16 })} {JOBS_UI.APPLY_BUTTON_LOADING}</> : <>{Icons.check({ s: 16 })} {JOBS_UI.APPLY_BUTTON}</>}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
