import { useState, useRef } from 'react'
import { useProfile, useUpdateProfile, useActualizarAvatar, useAuthStore } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, CATEGORY_COLORS, labelStyle, inputStyle, hashColor } from '@shared/components/shared'
import { AppSidebar, TopNav } from '@features/auth'


const LIFE_STAGES = [
  { id: 'infancia', label: 'Infancia (0-12)' },
  { id: 'adolescencia', label: 'Adolescencia (13-17)' },
  { id: 'adulto_joven', label: 'Adulto joven (18-29)' },
  { id: 'adulto', label: 'Adulto (30-59)' },
  { id: 'mayor', label: 'Adulto mayor (60+)' },
]


export default function ProfilePage() {
  const { logout } = useAuthStore()
  const { data: profile, isLoading } = useProfile()
  const update = useUpdateProfile()
  const uploadAvatar = useActualizarAvatar()
  const { addToast } = useUiStore()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  const startEdit = () => {
    setForm({
      full_name: profile?.full_name ?? '',
      city: profile?.city ?? '',
      state: profile?.state ?? '',
      avatar_url: avatarPreview || profile?.avatar_url || '',
    })
    setEditing(true)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Validar tipo de archivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      addToast('Formato no permitido. Usa PNG, JPG o JPEG', 'error')
      return
    }
    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      addToast('La imagen no puede superar 5MB', 'error')
      return
    }
    // Mostrar preview inmediato
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
    // Subir al endpoint real
    try {
      await uploadAvatar.mutateAsync(file)
      addToast('Avatar actualizado correctamente', 'success')
    } catch (err) {
      setAvatarPreview(null)
      addToast(err.response?.data?.mensaje ?? 'Error al subir la foto', 'error')
    }
    e.target.value = ''
  }

  const handleSave = async () => {
    try {
      await update.mutateAsync({
        full_name: form.full_name,
        city: form.city,
        state: form.state,
        ...(form.avatar_url ? { avatar_url: form.avatar_url } : {}),
      })
      addToast('Perfil actualizado', 'success')
      setEditing(false)
    } catch {
      addToast('Error al guardar', 'error')
    }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const avatarColor = hashColor(profile?.full_name ?? '')
  const initials = (profile?.full_name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const disabilities = profile?.profiling?.disability_types ?? []
  const stage = LIFE_STAGES.find(l => l.id === profile?.profiling?.life_stage)

  const s = {
    page: { minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' },
    card: { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 32, boxShadow: 'var(--shadow-sm)', marginBottom: 24 },
    sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
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

  return (
    <div style={s.page}>
      <AppSidebar currentPage="profile" />
      <TopNav user={profile} onLogout={logout} currentPage="profile" />
      <main className="responsive-main">
        <div style={{ maxWidth: 800, width: '100%', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 32px' }}>
          Mi perfil
        </h1>

        {isLoading ? (
          <div style={s.card}>
            {[80, 200, 120, 60].map((w, i) => (
              <div key={i} style={{ height: 18, width: w, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: 16 }} />
            ))}
          </div>
        ) : (
          <>
            {/* Header card */}
            <div className="profile-card" style={s.card}>
              <div className="profile-header-row" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <button onClick={handleAvatarClick} style={{ width: 72, height: 72, borderRadius: '50% 50% 50% 18%', background: (avatarPreview || profile?.avatar_url) ? 'transparent' : avatarColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, cursor: 'pointer', border: 'none', padding: 0, overflow: 'hidden' }} aria-label="Cambiar foto de perfil">
                    {(avatarPreview || profile?.avatar_url) ? (
                      <img src={avatarPreview || profile?.avatar_url} alt={profile?.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : initials}
                  </button>
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', border: '2px solid var(--bg-surface)' }}>
                    {uploadAvatar.isPending ? (
                      <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    ) : (
                      Icons.camera({ s: 14 })
                    )}
                  </span>
                </div>
                <button onClick={handleAvatarClick} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {Icons.upload({ s: 14 })} Subir foto
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                      {profile?.full_name ?? '—'}
                    </h2>
                    <span style={s.roleBadge}>{roleLabels[profile?.role] ?? profile?.role}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--fg3)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {Icons.mail({ s: 14 })} {profile?.email}
                    </span>
                    {(profile?.city || profile?.state) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {Icons.mapPin({ s: 14 })} {[profile?.city, profile?.state].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                {!editing && (
                  <div className="profile-header-actions">
                    <button className="btn-secondary" style={{ fontSize: 14, padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={startEdit}>
                      {Icons.edit({ s: 14 })} Editar
                    </button>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="profile-stats-row" style={{ display: 'flex', gap: 12 }}>
                <div style={s.stat}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                    {disabilities.length}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>tipo{disabilities.length !== 1 ? 's' : ''} de discapacidad</div>
                </div>
                <div style={s.stat}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                    {profile?.profiling ? '✓' : '—'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>perfil de necesidades</div>
                </div>
                <div style={s.stat}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                    {profile?.is_verified ? '✓' : '—'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>identidad verificada</div>
                </div>
              </div>
            </div>

            {/* Edit form */}
            {editing && (
              <div style={s.card}>
                <div style={s.sectionTitle}>
                  <span>Editar datos personales</span>
                </div>
                <div style={s.row}>
                  <div style={s.field}>
                    <label style={labelStyle}>Nombre completo</label>
                    <input style={inputStyle} value={form.full_name} onChange={set('full_name')} />
                  </div>
                </div>
                <div style={s.row}>
                  <div style={s.field}>
                    <label style={labelStyle}>Ciudad</label>
                    <input style={inputStyle} value={form.city} onChange={set('city')} placeholder="Mérida" />
                  </div>
                  <div style={s.field}>
                    <label style={labelStyle}>Estado</label>
                    <input style={inputStyle} value={form.state} onChange={set('state')} placeholder="Yucatán" />
                  </div>
                </div>
                <div className="profile-edit-actions" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 24px' }} onClick={() => setEditing(false)}>Cancelar</button>
                  <button className="btn-primary" style={{ fontSize: 14, padding: '10px 24px' }} onClick={handleSave} disabled={update.isPending}>
                    {update.isPending ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            )}

            {/* Perfil de necesidades */}
            {profile?.profiling ? (
              <div style={s.card}>
                <div style={s.sectionTitle}>
                  <span>Perfil de necesidades</span>
                  <a href="/onboarding" style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {Icons.edit({ s: 13 })} Actualizar
                  </a>
                </div>
                {stage && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Etapa de vida</div>
                    <span style={s.chip('var(--primary)')}>{stage.label}</span>
                  </div>
                )}
                {disabilities.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipos de discapacidad</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {disabilities.map((d, i) => (
                        <span key={i} style={s.chip(CATEGORY_COLORS['Salud'] ?? 'var(--primary)')}>{d}</span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.profiling.communication_modes?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modos de comunicación</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {profile.profiling.communication_modes.map((m, i) => (
                        <span key={i} style={s.chip(CATEGORY_COLORS['Educación'] ?? '#8B6BAE')}>{m}</span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.profiling.mobility_needs?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Necesidades de movilidad</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {profile.profiling.mobility_needs.map((m, i) => (
                        <span key={i} style={s.chip(CATEGORY_COLORS['Empleo'] ?? '#D4944C')}>{m}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ ...s.card, textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {Icons.target({ s: 22 })}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>Completa tu perfil de necesidades</h3>
                <p style={{ fontSize: 14, color: 'var(--fg2)', marginBottom: 20 }}>Con esta información la IA puede recomendarte instituciones que realmente encajen contigo</p>
                <a href="/onboarding">
                  <button className="btn-primary" style={{ fontSize: 14, padding: '10px 24px' }}>
                    Completar ahora {Icons.arrowRight({ s: 14 })}
                  </button>
                </a>
              </div>
            )}
          </>
        )}
        </div>
      </main>
    </div>
  )
}
