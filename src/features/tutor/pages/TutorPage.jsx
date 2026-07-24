import { useState } from 'react'
import { useMe, useAuthStore } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import { useDependents, useAddDependent, useUpdateDependent, useDeleteDependent } from '../hooks/useDependents'
import { useAIForDependent } from '../hooks/useAI'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'
import { AppSidebar, TopNav } from '@features/auth'

const RELATIONSHIPS = ['Hijo/a', 'Hermano/a', 'Nieto/a', 'Sobrino/a', 'Cónyuge', 'Tutor legal', 'Otro familiar']
const DISABILITIES = ['Motriz', 'Visual', 'Auditiva', 'Intelectual', 'Psicosocial', 'TEA / Autismo', 'Síndrome de Down', 'Lenguaje', 'Múltiple', 'Otra']
const LIFE_STAGES = [
  { id: 'infancia', label: 'Infancia (0-12)' },
  { id: 'adolescencia', label: 'Adolescencia (13-17)' },
  { id: 'adulto_joven', label: 'Adulto joven (18-29)' },
  { id: 'adulto', label: 'Adulto (30-59)' },
  { id: 'mayor', label: 'Adulto mayor (60+)' },
]

function hashColor(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff
  const colors = ['#01ADFF', '#B85C84', '#7857A0', '#BE7C34', '#5F8043', '#3A8C8C', '#5A6C8C']
  return colors[Math.abs(h) % colors.length]
}

const card = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }

export default function TutorPage() {
  const { logout } = useAuthStore()
  const { data: user } = useMe()
  const { addToast } = useUiStore()
  const { data: dependents = [], isLoading } = useDependents()
  const add = useAddDependent()
  const update = useUpdateDependent()
  const del = useDeleteDependent()

  const [editing, setEditing] = useState(null)   // objeto en edición, {} para nuevo, null cerrado
  const [confirm, setConfirm] = useState(null)

  const save = (form) => {
    const mut = form.id ? update : add
    mut.mutate(form, {
      onSuccess: () => { addToast(form.id ? 'Datos actualizados' : 'Persona agregada', 'success'); setEditing(null) },
      onError: (e) => addToast(e.response?.data?.message ?? 'Error al guardar', 'error'),
    })
  }
  const doDelete = () => del.mutate(confirm.id, {
    onSuccess: () => { addToast('Persona eliminada', 'success'); setConfirm(null) },
    onError: () => addToast('Error al eliminar', 'error'),
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      <AppSidebar currentPage="tutor" />
      <TopNav user={user} onLogout={logout} currentPage="tutor" />

      <main id="main" className="responsive-main" style={{ '--main-max-width': '960px' }}>
        {/* Header */}            <div className="tutor-header responsive-header" style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50% 50% 50% 14%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {Icons.users({ s: 24 })}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Mi familia</h1>
              <p style={{ fontSize: 15, color: 'var(--fg2)', margin: '2px 0 0' }}>Personas a tu cuidado y sus necesidades</p>
            </div>
          </div>
          <button className="btn-primary tutor-btn" onClick={() => setEditing({})} style={{ fontSize: 16 }}>
            {Icons.plus({ s: 18 })} Agregar persona
          </button>
        </div>

        {/* Contenido */}
        <div style={{ marginTop: 28 }}>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {[0, 1].map(i => (
                <div key={i} style={{ ...card, padding: 22 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--border-color)', animation: 'pulse 1.5s infinite', marginBottom: 14 }} />
                  <div style={{ width: '60%', height: 18, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s infinite', marginBottom: 10 }} />
                  <div style={{ width: '40%', height: 14, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s infinite' }} />
                </div>
              ))}
            </div>
          ) : dependents.length === 0 ? (
            <div style={{ ...card, padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50% 50% 50% 18%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                {Icons.users({ s: 30 })}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>Aún no agregas a nadie</h2>
              <p style={{ fontSize: 15, color: 'var(--fg2)', marginBottom: 24, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                Registra a las personas que cuidas para guardar sus necesidades y encontrar instituciones adecuadas para cada una.
              </p>
              <button className="btn-primary" onClick={() => setEditing({})} style={{ fontSize: 16 }}>
                {Icons.plus({ s: 18 })} Agregar la primera persona
              </button>
            </div>
          ) : (
            <div className="tutor-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {dependents.map(dep => (
                <DependentCard key={dep.id} dep={dep} onEdit={() => setEditing(dep)} onDelete={() => setConfirm(dep)} />
              ))}
            </div>
          )}
        </div>
      </main>

      {editing !== null && (
        <DependentForm initial={editing} onCancel={() => setEditing(null)} onSave={save} saving={add.isPending || update.isPending} />
      )}
      {confirm && (
        <ConfirmDialog
          title="Eliminar persona"
          message={`¿Seguro que quieres eliminar a "${confirm.full_name}"? Se borrarán sus datos guardados.`}
          onConfirm={doDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

/* ── Tarjeta de dependiente ── */
function DependentCard({ dep, onEdit, onDelete }) {
  const color = hashColor(dep.full_name)
  const initials = (dep.full_name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const stage = LIFE_STAGES.find(l => l.id === dep.life_stage)
  const [showAI, setShowAI] = useState(false)
  const aiRec = useAIForDependent()

  const handleAIToggle = () => {
    if (!showAI && !aiRec.data && !aiRec.isPending) {
      aiRec.mutate(dep.id)
    }
    setShowAI(s => !s)
  }

  return (
    <div style={{ ...card, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div aria-hidden="true" style={{ width: 56, height: 56, borderRadius: '50% 50% 50% 16%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{dep.full_name}</h3>
          <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '2px 0 0' }}>{dep.relationship}{stage ? ` · ${stage.label}` : ''}</p>
        </div>
      </div>

      {dep.disability_types?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {dep.disability_types.map((d, i) => (
            <span key={i} style={{ padding: '4px 12px', borderRadius: 16, fontSize: 12.5, fontWeight: 600, background: `color-mix(in oklch, ${color} 14%, transparent)`, color }}>{d}</span>
          ))}
        </div>
      )}

      {dep.notes && (
        <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5, background: 'var(--bg-warm)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>{dep.notes}</p>
      )}

      <div className="tutor-card-actions" style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
        <button onClick={handleAIToggle} className="btn-secondary"
          aria-expanded={showAI}
          style={{ flex: 1, fontSize: 13, padding: '10px', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {Icons.sparkles({ s: 15 })} {showAI ? 'Ocultar IA' : 'Recomendaciones IA'}
        </button>
        <button onClick={onEdit} className="btn-secondary" style={{ flex: 1, fontSize: 13, padding: '10px', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {Icons.edit({ s: 15 })} Editar
        </button>
        <button onClick={onDelete} aria-label={`Eliminar a ${dep.full_name}`}
          style={{ minHeight: 44, minWidth: 44, borderRadius: 'var(--radius-pill)', border: '2px solid color-mix(in oklch, var(--color-error) 40%, transparent)', background: 'var(--bg-surface)', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icons.x({ s: 16 })}
        </button>
      </div>

      {/* Panel de recomendaciones IA */}
      {showAI && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.sparkles({ s: 13 })} Próximos pasos para {dep.full_name}
          </p>

          {aiRec.isPending && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[100, 85, 90].map((w, i) => (
                <div key={i} style={{ height: 14, width: `${w}%`, borderRadius: 4, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          )}

          {aiRec.isError && (
            <p style={{ fontSize: 13, color: 'var(--color-error)', margin: 0 }}>No se pudo cargar. Intenta de nuevo.</p>
          )}

          {aiRec.data && (
            <>
              <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {aiRec.data.next_steps?.map((step, i) => (
                  <li key={i} style={{ fontSize: 13.5, color: 'var(--fg1)', lineHeight: 1.5 }}>{step}</li>
                ))}
              </ol>
              {aiRec.data.reasoning && (
                <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '10px 0 0', fontStyle: 'italic', lineHeight: 1.4 }}>
                  {aiRec.data.reasoning}
                  {aiRec.data.mock && ' (modo demo)'}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Formulario (modal) ── */
function DependentForm({ initial, onCancel, onSave, saving }) {
  const [form, setForm] = useState({
    id: initial.id,
    full_name: initial.full_name ?? '',
    relationship: initial.relationship ?? RELATIONSHIPS[0],
    disability_types: initial.disability_types ?? [],
    life_stage: initial.life_stage ?? '',
    notes: initial.notes ?? '',
  })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggleDis = (d) => setForm(f => ({
    ...f,
    disability_types: f.disability_types.includes(d) ? f.disability_types.filter(x => x !== d) : [...f.disability_types, d],
  }))
  const submit = (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) return
    onSave(form)
  }

  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={form.id ? 'Editar persona' : 'Agregar persona'}
        style={{ ...card, padding: 28, maxWidth: 540, width: '100%', margin: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
            {form.id ? 'Editar persona' : 'Agregar persona'}
          </h2>
          <button onClick={onCancel} aria-label="Cerrar"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icons.x({ s: 18 })}
          </button>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="dep-name" style={labelStyle}>Nombre completo</label>
            <input id="dep-name" style={inputStyle} value={form.full_name} onChange={set('full_name')} required placeholder="Ej. Mateo Pérez" autoFocus />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label htmlFor="dep-rel" style={labelStyle}>Relación contigo</label>
            <select id="dep-rel" style={{ ...inputStyle, cursor: 'pointer' }} value={form.relationship} onChange={set('relationship')}>
              {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label htmlFor="dep-stage" style={labelStyle}>Etapa de vida</label>
            <select id="dep-stage" style={{ ...inputStyle, cursor: 'pointer' }} value={form.life_stage} onChange={set('life_stage')}>
              <option value="">Sin especificar</option>
              {LIFE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 18px' }}>
            <legend style={{ ...labelStyle, padding: 0 }}>Tipo(s) de discapacidad</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {DISABILITIES.map(d => {
                const on = form.disability_types.includes(d)
                return (
                  <button key={d} type="button" onClick={() => toggleDis(d)} aria-pressed={on}
                    style={{ padding: '8px 14px', minHeight: 44, borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                      border: on ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                      background: on ? 'var(--primary-subtle)' : 'var(--bg-surface)', color: on ? 'var(--primary)' : 'var(--fg2)' }}>
                    {on && <span aria-hidden="true">✓ </span>}{d}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div style={{ marginBottom: 24 }}>
            <label htmlFor="dep-notes" style={labelStyle}>Notas (opcional)</label>
            <textarea id="dep-notes" value={form.notes} onChange={set('notes')} rows={3}
              placeholder="Información útil: terapias actuales, intereses, lo que necesita..."
              style={{ ...inputStyle, height: 'auto', paddingTop: 12, paddingBottom: 12, resize: 'vertical', lineHeight: 1.5 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving || !form.full_name.trim()}>
              {saving ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Confirmación ── */
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-label={title} style={{ ...card, padding: 28, maxWidth: 420, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'color-mix(in oklch, var(--color-error) 15%, transparent)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {Icons.shieldAlert({ s: 20 })}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: 15, color: 'var(--fg2)', lineHeight: 1.5, margin: '0 0 20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button onClick={onConfirm} style={{ fontSize: 17, padding: '12px 24px', minHeight: 48, borderRadius: 'var(--radius-pill)', border: '2px solid var(--color-error)', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-body)', background: 'var(--color-error)', color: '#fff' }}>
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
