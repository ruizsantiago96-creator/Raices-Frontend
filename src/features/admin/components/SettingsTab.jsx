import { useState } from 'react'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import { useAdminSettings, useUpdateSettings } from '../hooks/useAdmin'
import { Card, SectionTitle, Skeleton } from './AdminUI'

const SETTING_FIELDS = [
  { key: 'platform_name', label: 'Nombre de la plataforma', type: 'text' },
  { key: 'support_email', label: 'Email de soporte', type: 'text' },
  { key: 'default_city', label: 'Ciudad por defecto', type: 'text' },
  { key: 'max_reviews_per_user', label: 'Máx. reseñas por usuario', type: 'number' },
  { key: 'allow_registration', label: 'Permitir nuevos registros', type: 'toggle' },
  { key: 'require_institution_approval', label: 'Requerir aprobación de instituciones', type: 'toggle' },
  { key: 'ai_enabled', label: 'Motor de IA activo', type: 'toggle' },
  { key: 'maintenance_mode', label: 'Modo mantenimiento', type: 'toggle' },
]

export default function SettingsTab() {
  const { addToast } = useUiStore()
  const { data: settings, isLoading } = useAdminSettings()
  const update = useUpdateSettings()
  const [form, setForm] = useState(null)

  const current = form ?? settings ?? {}
  const set = (k, v) => setForm({ ...current, [k]: v })
  const isOn = (v) => v === 'true' || v === true

  const save = () => update.mutate(current, { onSuccess: () => { addToast('Configuración guardada', 'success'); setForm(null) } })

  if (isLoading) return <Card><Skeleton h={40} style={{ marginBottom: 16 }} /><Skeleton h={40} style={{ marginBottom: 16 }} /><Skeleton h={40} /></Card>

  return (
    <div style={{ maxWidth: 640 }}>
      <Card>
        <SectionTitle icon={Icons.target({ s: 18 })}>Configuración de la plataforma</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {SETTING_FIELDS.map(f => (
            <div key={f.key} className="admin-settings-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingBottom: 14, borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)' }}>{f.label}</div>
              </div>
              {f.type === 'toggle' ? (
                <button onClick={() => set(f.key, isOn(current[f.key]) ? 'false' : 'true')}
                  style={{ width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
                    background: isOn(current[f.key]) ? 'var(--primary)' : 'var(--border-color)', transition: 'background 0.2s' }}>
                  <span style={{ position: 'absolute', top: 3, left: isOn(current[f.key]) ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              ) : (
                <input type={f.type} value={current[f.key] ?? ''} onChange={e => set(f.key, e.target.value)}
                  className="admin-settings-input"
                  style={{ height: 38, padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', fontFamily: 'var(--font-body)' }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          {form && <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={() => setForm(null)}>Descartar</button>}
          <button onClick={save} disabled={!form} style={{ fontSize: 14, padding: '10px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: form ? 'var(--primary)' : 'var(--border-color)', color: form ? '#fff' : 'var(--fg3)', fontWeight: 600, cursor: form ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)' }}>Guardar</button>
        </div>
      </Card>
    </div>
  )
}
