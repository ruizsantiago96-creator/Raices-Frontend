import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProfile, useUpdateProfile, useActualizarAvatar, useEliminarAvatar } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, labelStyle, inputStyle, hashColor } from '@shared/components/shared'
import EscalasVidaSection from '../components/EscalasVidaSection'
import { PROFILE_TOAST, PROFILE_UI, PROFILE_VALIDATION, ROLE_LABELS } from '../constants/profileMessages'

function splitSpanishFullName(fullName = '') {
  const clean = (fullName || '').trim().replace(/\s+/g, ' ')
  if (!clean || clean === '—') return { firstName: '—', lastName: '—' }

  const words = clean.split(' ')
  if (words.length === 1) {
    return { firstName: words[0], lastName: '—' }
  }
  if (words.length === 2) {
    return { firstName: words[0], lastName: words[1] }
  }
  if (words.length === 3) {
    return { firstName: words[0], lastName: `${words[1]} ${words[2]}` }
  }
  if (words.length === 4) {
    return { firstName: `${words[0]} ${words[1]}`, lastName: `${words[2]} ${words[3]}` }
  }
  const lastName = words.slice(-2).join(' ')
  const firstName = words.slice(0, -2).join(' ')
  return { firstName, lastName }
}

interface PersonalInfoForm {
  first_name: string
  last_name: string
  full_name: string
  city: string
  state: string
  avatar_url: string
}

export default function ProfilePage() {
  const { data, isLoading, isError } = useProfile()
  const update = useUpdateProfile()
  const uploadAvatar = useActualizarAvatar()
  const deleteAvatar = useEliminarAvatar()
  const { addToast } = useUiStore()

  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false)
  const [form, setForm] = useState<PersonalInfoForm | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startEdit = () => {
    const fullNameVal = data?.full_name ?? ''
    const { firstName: fName, lastName: lName } = splitSpanishFullName(fullNameVal)
    setForm({
      first_name: fName === '—' ? '' : fName,
      last_name: lName === '—' ? '' : lName,
      full_name: fullNameVal,
      city: data?.city ?? '',
      state: data?.state ?? '',
      avatar_url: avatarPreview || data?.avatar_url || '',
    })
    setIsEditingProfile(true)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setAvatarPreview(ev.target.result)
      }
    }
    reader.readAsDataURL(file)
    try {
      await uploadAvatar.mutateAsync(file)
      addToast(PROFILE_TOAST.AVATAR_UPDATED, 'success')
    } catch (err: unknown) {
      setAvatarPreview(null)
      const errorMsg = (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje ?? PROFILE_TOAST.AVATAR_UPDATE_ERROR
      addToast(errorMsg, 'error')
    }
    e.target.value = ''
  }

  const handleSave = async () => {
    if (!form) return
    try {
      const mergedName = form.first_name !== undefined 
        ? `${form.first_name.trim()} ${form.last_name.trim()}`.trim()
        : form.full_name
      await update.mutateAsync({
        full_name: mergedName,
        city: form.city,
        state: form.state,
      })
      addToast(PROFILE_TOAST.PROFILE_UPDATED, 'success')
      setIsEditingProfile(false)
    } catch {
      addToast(PROFILE_TOAST.PROFILE_UPDATE_ERROR, 'error')
    }
  }

  const setFormField = (k: keyof PersonalInfoForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => (f ? { ...f, [k]: e.target.value } : null))
  }

  const handleDeleteAvatar = async () => {
    if (!window.confirm(PROFILE_UI.CONFIRM_DELETE_AVATAR)) return
    try {
      const result = await deleteAvatar.mutateAsync()
      setAvatarPreview(null)
      addToast((result as { mensaje?: string })?.mensaje ?? PROFILE_TOAST.AVATAR_DELETED, 'success')
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string; response?: { data?: { mensaje?: string } } })?.message ??
        (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje ??
        PROFILE_TOAST.AVATAR_DELETE_ERROR
      addToast(errorMsg, 'error')
    }
  }

  const avatarColor = hashColor(data?.full_name ?? '')
  const initials = (data?.full_name ?? '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  const s = {
    card: { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 20 },
    sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--fg1)', margin: '0 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    roleBadge: {
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
      borderRadius: 12, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const,
      background: 'var(--primary-subtle)', color: 'var(--primary)',
    },
  }

  const fullName = data?.full_name ?? '—'
  const { firstName, lastName } = splitSpanishFullName(fullName)

  return (
    <>
      <main className="responsive-main">
        <div style={{ maxWidth: 840, width: '100%', margin: '0 auto', padding: '0 20px 48px' }}>
          {/* Header */}
          <div className="animate-fade-in-up" style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>Mi perfil</h1>
            <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>Gestiona tu información personal y tu camino de vida</p>
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
                    Información personal
                  </h3>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: 13, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--bg-surface)', fontWeight: 600 }}
                    onClick={startEdit}
                  >
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
                      <span style={s.roleBadge}>{(ROLE_LABELS as Record<string, string>)[data?.role ?? ''] ?? data?.role}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--fg3)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {Icons.mail({ s: 13 })} {data?.email}
                      </span>
                      <Link
                        to="/mi-identidad?tab=verificacion"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          color: 'inherit', textDecoration: 'none',
                        }}
                        title="Ubicación verificada en Mi Identidad"
                      >
                        {Icons.mapPin({ s: 13 })} {[data?.city, data?.state].filter(Boolean).join(', ') || 'Agregar ubicación'}
                      </Link>
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

              {/* Escalas de Vida integradas en el perfil */}
              {data?.role !== 'institution' && data?.role !== 'empresa' && (
                <EscalasVidaSection />
              )}
            </>
          )}
        </div>
      </main>

      {/* Edit Personal Information Modal Overlay */}
      {isEditingProfile && form && (
        <div onClick={() => setIsEditingProfile(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: 32, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', animation: 'fade-in 0.12s ease-out', position: 'relative' }}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              style={{ position: 'absolute', top: 20, right: 20, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--bg-warm)', color: 'var(--fg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--border-color)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-warm)')}
            >
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
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    style={{ width: 72, height: 72, borderRadius: '50%', background: (avatarPreview || data?.avatar_url) ? 'transparent' : avatarColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, cursor: 'pointer', border: 'none', padding: 0, overflow: 'hidden' }}
                  >
                    {(avatarPreview || data?.avatar_url) ? (
                      <img src={avatarPreview || data?.avatar_url || ''} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : initials}
                  </button>
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-surface)', pointerEvents: 'none' }}>
                    {uploadAvatar.isPending ? (
                      <span style={{ width: 10, height: 10, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    ) : (
                      Icons.camera ? Icons.camera({ s: 12 }) : '📷'
                    )}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontSize: 12.5, color: 'var(--fg3)', margin: '0 0 8px', lineHeight: '1.4' }}>
                    Sube una imagen cuadrada (200x200 px) en formato JPEG o PNG.
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      style={{ background: 'var(--primary-subtle)', border: 'none', color: 'var(--primary)', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      {Icons.upload({ s: 12 })} Subir foto
                    </button>
                    {(avatarPreview || data?.avatar_url) && (
                      <button
                        type="button"
                        onClick={handleDeleteAvatar}
                        disabled={deleteAvatar.isPending}
                        style={{ background: 'transparent', border: '1px solid #DC3545', color: '#DC3545', padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: deleteAvatar.isPending ? 0.6 : 1 }}
                      >
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
                    <input style={inputStyle} value={form.first_name} onChange={setFormField('first_name')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Apellido</label>
                    <input style={inputStyle} value={form.last_name} onChange={setFormField('last_name')} />
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
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: 13.5, padding: '10px 20px', borderRadius: 8 }}
                onClick={() => setIsEditingProfile(false)}
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleSave}
                style={{ fontSize: 13.5, padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                disabled={update.isPending}
              >
                {update.isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
