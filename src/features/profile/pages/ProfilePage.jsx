import { useState, useRef, useEffect } from 'react'
import { useProfile, useUpdateProfile, useActualizarAvatar, useEliminarAvatar } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { Icons, CATEGORY_COLORS, labelStyle, inputStyle, hashColor } from '@shared/components/shared'
import { AppSidebar, TopNav } from '@features/auth'
import { PROFILE_TOAST, PROFILE_UI, PROFILE_VALIDATION, ROLE_LABELS } from '../constants/profileMessages'
import { STATES, getMunicipalities } from '@shared/lib/mexicoLocations'

function normalizeText(text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function getNormalizedStateKey(stateName) {
  if (!stateName) return ''
  const normState = normalizeText(stateName)
  return STATES.find(st => normalizeText(st) === normState) || stateName
}

function SearchableSelect({ label, value, onChange, options, placeholder, disabled }) {
  const [isOpen, setIsOpen] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // When closed, show the selected value; when open, show user's search
  const displayValue = isOpen ? userSearch : (value || '')
  const normSearch = normalizeText(displayValue)
  const filteredOptions = options.filter(opt =>
    normalizeText(opt).includes(normSearch)
  )

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          style={{ ...inputStyle, paddingRight: 32 }}
          value={displayValue}
          onChange={e => {
            setUserSearch(e.target.value)
            setIsOpen(true)
            if (!e.target.value) onChange('')
          }}
          onFocus={() => {
            if (!disabled) {
              setUserSearch(value || '')
              setIsOpen(true)
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
        />
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--fg3)', display: 'flex', alignItems: 'center' }}>
          {Icons.chevronDown ? Icons.chevronDown({ s: 15 }) : '▼'}
        </div>
      </div>

      {isOpen && !disabled && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          maxHeight: 180,
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          boxShadow: 'var(--shadow-md)',
          zIndex: 1010,
        }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt)
                  setIsOpen(false)
                }}
                style={{
                  padding: '10px 12px',
                  fontSize: 13.5,
                  color: 'var(--fg1)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in oklch, var(--primary) 6%, var(--bg-surface))'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {opt}
              </div>
            ))
          ) : (
            <div style={{ padding: '12px', fontSize: 13, color: 'var(--fg3)', textAlign: 'center' }}>
              No se encontraron resultados
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const { data, isLoading, isError } = useProfile()
  const { data: catalogos } = useCatalogos()
  const LIFE_STAGES = catalogos?.etapasVida ?? []
  const update = useUpdateProfile()
  const uploadAvatar = useActualizarAvatar()
  const deleteAvatar = useEliminarAvatar()
  const { addToast } = useUiStore()

  const [editingMode, setEditingMode] = useState(null) // 'profile' | 'address' | null
  const [form, setForm] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  const startEdit = (mode) => {
    const fullNameVal = data?.full_name ?? ''
    const parts = fullNameVal.trim().split(' ')
    const fName = parts[0] || ''
    const lName = parts.slice(1).join(' ') || ''
    setForm({
      first_name: fName,
      last_name: lName,
      full_name: fullNameVal,
      city: data?.city ?? '',
      state: data?.state ?? '',
      avatar_url: avatarPreview || data?.avatar_url || '',
    })
    setEditingMode(mode)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowedTypes = PROFILE_VALIDATION.ALLOWED_AVATAR_TYPES
    if (!allowedTypes.includes(file.type)) {
      addToast(PROFILE_TOAST.AVATAR_INVALID_FORMAT, 'error')
      return
    }
    if (file.size > PROFILE_VALIDATION.MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      addToast(PROFILE_TOAST.AVATAR_TOO_LARGE, 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
    try {
      await uploadAvatar.mutateAsync(file)
      addToast(PROFILE_TOAST.AVATAR_UPDATED, 'success')
    } catch (err) {
      setAvatarPreview(null)
      addToast(err.response?.data?.mensaje ?? PROFILE_TOAST.AVATAR_UPDATE_ERROR, 'error')
    }
    e.target.value = ''
  }

  const handleSave = async () => {
    try {
      const mergedName = form.first_name !== undefined 
        ? `${form.first_name.trim()} ${form.last_name.trim()}`.trim()
        : form.full_name
      await update.mutateAsync({
        nombreCompleto: mergedName,
        ciudad: form.city,
        estado: form.state,
      })
      addToast(PROFILE_TOAST.PROFILE_UPDATED, 'success')
      setEditingMode(null)
    } catch {
      addToast(PROFILE_TOAST.PROFILE_UPDATE_ERROR, 'error')
    }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleDeleteAvatar = async () => {
    if (!window.confirm(PROFILE_UI.CONFIRM_DELETE_AVATAR)) return
    try {
      const result = await deleteAvatar.mutateAsync()
      setAvatarPreview(null)
      addToast(result.mensaje ?? PROFILE_TOAST.AVATAR_DELETED, 'success')
    } catch (err) {
      addToast(err.message ?? err.response?.data?.mensaje ?? PROFILE_TOAST.AVATAR_DELETE_ERROR, 'error')
    }
  }

  const avatarColor = hashColor(data?.full_name ?? '')
  const initials = (data?.full_name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const disabilities = data?.profiling?.disability_types ?? []
  const stage = LIFE_STAGES.find(l => l.id === data?.profiling?.life_stage)

  const s = {
    page: { minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' },
    card: { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 20 },
    sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--fg1)', margin: '0 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    row: { display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 16 },
    field: { flex: 1 },
    chip: (color) => ({
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
      borderRadius: 20, fontSize: 13, fontWeight: 600,
      background: `color-mix(in oklch, ${color} 15%, transparent)`,
      color, border: `1px solid color-mix(in oklch, ${color} 30%, transparent)`,
    }),
    roleBadge: {
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
      borderRadius: 12, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      background: 'var(--primary-subtle)', color: 'var(--primary)',
    },
    stat: { flex: 1, padding: 20, background: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' },
  }

  const roleLabels = { pcd: 'Persona con discapacidad', tutor: 'Tutor o familiar', institution: 'Institución', admin: 'Administrador', user: 'Usuario' }
  const fullName = data?.full_name ?? '—'
  const nameParts = fullName.trim().split(' ')
  const firstName = nameParts[0] || '—'
  const lastName = nameParts.slice(1).join(' ') || '—'

  return (
    <>
      <main className="responsive-main">
      <div style={{ maxWidth: 840, width: '100%', margin: '0 auto', padding: '0 20px 48px' }}>
          
          {/* Header */}
          <div className="animate-fade-in-up" style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>Mi perfil</h1>
            <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>Gestiona tu información personal</p>
          </div>

          {isLoading ? (
            <div style={s.card}>
              {[80, 200, 120, 60].map((w, i) => (
                <div key={i} style={{ height: 18, width: w, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: 16 }} />
              ))}
            </div>
          ) : isError ? (
            <div style={s.card}>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-subtle, #fdecea)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {Icons.shieldAlert({ s: 22 })}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>{PROFILE_UI.ERROR_TITLE}</h3>
                <p style={{ fontSize: 14, color: 'var(--fg2)', marginBottom: 20 }}>{PROFILE_UI.ERROR_DESCRIPTION}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Tarjeta: Mi Perfil */}
              <div className="profile-card animate-fade-in-up delay-1" style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                    Mi Perfil
                  </h3>
                  <button className="btn-secondary" style={{ fontSize: 13, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--bg-surface)', fontWeight: 600 }} onClick={() => startEdit('profile')}>
                    {Icons.edit({ s: 13 })} Editar
                  </button>
                </div>

                {/* Avatar + Name row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50% 50% 50% 18%', background: data?.avatar_url ? 'transparent' : avatarColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, overflow: 'hidden' }}>
                      {data?.avatar_url ? (
                        <img src={data?.avatar_url} alt={data?.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : initials}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                        {data?.full_name ?? '—'}
                      </h2>
                      <span style={s.roleBadge}>{ROLE_LABELS[data?.role] ?? data?.role}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--fg3)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {Icons.mail({ s: 13 })} {data?.email}
                      </span>
                      {(data?.city || data?.state) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {Icons.mapPin({ s: 13 })} {[data?.city, data?.state].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fields Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre</div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg1)', marginTop: 4 }}>{firstName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apellido</div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg1)', marginTop: 4 }}>{lastName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Correo electrónico</div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg1)', marginTop: 4 }}>{data?.email ?? '—'}</div>
                  </div>
                </div>
              </div>

              {/* Preferencias seleccionadas en registro */}
              {(() => {
                let regInterests = []
                try {
                  regInterests = JSON.parse(localStorage.getItem('raices_user_interests') || '[]')
                } catch (_) {}
                if (regInterests.length === 0 && !data?.profiling) return null
                return (
                  <div className="profile-card animate-fade-in-up delay-2" style={s.card}>
                    <div style={s.sectionTitle}>
                      <span>Tus preferencias</span>
                    </div>
                    {regInterests.length > 0 && (
                      <div style={{ marginBottom: data?.profiling ? 16 : 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intereses seleccionados</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {regInterests.map((interest, i) => (
                            <span key={i} style={s.chip(CATEGORY_COLORS['social'] ?? 'var(--primary)')}>{interest}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {data?.profiling?.life_stage && stage && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{PROFILE_UI.LIFE_STAGE_LABEL}</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={s.chip('var(--primary)')}>{stage.label}</span>
                          {data.profiling.age && (
                            <span style={s.chip('#4A5568')}>{data.profiling.age} años</span>
                          )}
                        </div>
                      </div>
                    )}
                    {disabilities.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{PROFILE_UI.DISABILITY_TYPES_LABEL}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {disabilities.map((d, i) => (
                            <span key={i} style={s.chip(CATEGORY_COLORS['Salud'] ?? 'var(--primary)')}>{d}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {data?.profiling?.communication_modes?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{PROFILE_UI.COMMUNICATION_MODES_LABEL}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {data?.profiling?.communication_modes?.map((m, i) => (
                            <span key={i} style={s.chip(CATEGORY_COLORS['Educación'] ?? '#8B6BAE')}>{m}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {data?.profiling?.mobility_needs?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{PROFILE_UI.MOBILITY_NEEDS_LABEL}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {data?.profiling?.mobility_needs?.map((m, i) => (
                            <span key={i} style={s.chip(CATEGORY_COLORS['Empleo'] ?? '#D4944C')}>{m}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Tarjeta: Dirección */}
              <div className="profile-card animate-fade-in-up delay-3" style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                    Dirección
                  </h3>
                  <button className="btn-secondary" style={{ fontSize: 13, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--bg-surface)', fontWeight: 600 }} onClick={() => startEdit('address')}>
                    {Icons.edit({ s: 13 })} Editar
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>País</div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg1)', marginTop: 4 }}>México</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ciudad / Estado</div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg1)', marginTop: 4 }}>{[data?.city, data?.state].filter(Boolean).join(', ') || 'No especificado'}</div>
                  </div>
                </div>
              </div>



            </>
          )}
        </div>
      </main>

      {/* Edit Personal Information Modal Overlay */}
      {editingMode === 'profile' && (
        <div onClick={() => setEditingMode(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: 32, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', animation: 'fade-in 0.12s ease-out', position: 'relative' }}>
            
            {/* Close Button */}
            <button onClick={() => setEditingMode(null)} style={{ position: 'absolute', top: 20, right: 20, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--bg-warm)', color: 'var(--fg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--border-color)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-warm)'}>
              {Icons.x({ s: 16 })}
            </button>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>Editar información personal</h3>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 24px' }}>Actualiza tus datos para mantener tu perfil al día.</p>
            
            {/* Change Profile Picture Section */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 14px' }}>Cambiar foto de perfil</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <button onClick={handleAvatarClick} style={{ width: 72, height: 72, borderRadius: '50%', background: (avatarPreview || data?.avatar_url) ? 'transparent' : avatarColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, cursor: 'pointer', border: 'none', padding: 0, overflow: 'hidden' }}>
                    {(avatarPreview || data?.avatar_url) ? (
                      <img src={avatarPreview || data?.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : initials}
                  </button>
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-surface)', pointerEvents: 'none' }}>
                    {uploadAvatar.isPending ? (
                      <span style={{ width: 10, height: 10, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    ) : (
                      Icons.camera({ s: 12 })
                    )}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontSize: 12.5, color: 'var(--fg3)', margin: '0 0 8px', lineHeight: '1.4' }}>
                    Sube una imagen cuadrada (200x200 px) en formato JPEG o PNG.
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={handleAvatarClick} style={{ background: 'var(--primary-subtle)', border: 'none', color: 'var(--primary)', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {Icons.upload({ s: 12 })} Subir foto
                    </button>
                    {(avatarPreview || data?.avatar_url) && (
                      <button onClick={handleDeleteAvatar} disabled={deleteAvatar.isPending} style={{ background: 'transparent', border: '1px solid #DC3545', color: '#DC3545', padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: deleteAvatar.isPending ? 0.6 : 1 }}>
                        {Icons.x({ s: 12 })} Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

            {/* Personal Information Section */}
            <div>
              <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 16px' }}>Información personal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Nombre</label>
                    <input style={inputStyle} value={form.first_name} onChange={set('first_name')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Apellido</label>
                    <input style={inputStyle} value={form.last_name} onChange={set('last_name')} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Correo electrónico</label>
                  <input style={{ ...inputStyle, background: 'var(--bg-warm)', cursor: 'not-allowed' }} value={data?.email ?? ''} disabled />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
              <button className="btn-secondary" style={{ fontSize: 13.5, padding: '10px 20px', borderRadius: 8 }} onClick={() => setEditingMode(null)}>Cerrar</button>
              <button onClick={handleSave} style={{ fontSize: 13.5, padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }} disabled={update.isPending}>
                {update.isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Modal Overlay */}
      {editingMode === 'address' && (
        <div onClick={() => setEditingMode(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: 32, maxWidth: 520, width: '100%', animation: 'fade-in 0.12s ease-out', position: 'relative' }}>
            
            {/* Close Button */}
            <button onClick={() => setEditingMode(null)} style={{ position: 'absolute', top: 20, right: 20, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--bg-warm)', color: 'var(--fg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--border-color)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-warm)'}>
              {Icons.x({ s: 16 })}
            </button>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>Editar dirección</h3>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 24px' }}>Actualiza tus datos para mantener tu perfil al día.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>País</label>
                  <input style={{ ...inputStyle, background: 'var(--bg-warm)', cursor: 'not-allowed' }} value="México" disabled />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SearchableSelect
                    label="Estado"
                    value={form.state}
                    onChange={val => setForm(f => ({ ...f, state: val, city: '' }))}
                    options={STATES}
                    placeholder="Selecciona un estado..."
                  />
                  <SearchableSelect
                    label="Ciudad / Municipio"
                    value={form.city}
                    onChange={val => setForm(f => ({ ...f, city: val }))}
                    options={form.state ? getMunicipalities(getNormalizedStateKey(form.state)) : []}
                    placeholder={form.state ? "Selecciona..." : "Elige un estado"}
                    disabled={!form.state}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
              <button className="btn-secondary" style={{ fontSize: 13.5, padding: '10px 20px', borderRadius: 8 }} onClick={() => setEditingMode(null)}>Cerrar</button>
              <button onClick={handleSave} style={{ fontSize: 13.5, padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }} disabled={update.isPending}>
                {update.isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
