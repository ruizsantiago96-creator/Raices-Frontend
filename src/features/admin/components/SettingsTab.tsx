import { useEffect, useState } from 'react'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import { useAdminSettings, useUpdateSettings } from '../hooks/useAdmin'
import { Card, SectionTitle, Skeleton } from './AdminUI'
import { ADMIN_TOAST } from '../constants/adminMessages'

/* ═══════════════════════════════════════════════════════════════════
   Configuración de plataforma (rol Admin)

   Modelo de estado del formulario:
   - `form` guarda SIEMPRE boolean para toggles y string para textos.
   - La API devuelve todo como string ('true'/'false'), así que se
     normaliza UNA sola vez al inicializar el espejo local `serverData`.
   - Al guardar, se serializa de vuelta a strings con las claves de la API.
   ═══════════════════════════════════════════════════════════════════ */

interface SettingsField {
  key: string
  label: string
  type: 'text' | 'number' | 'toggle'
  apiKey: string
}

const SETTING_FIELDS: SettingsField[] = [
  { key: 'platform_name', label: 'Nombre de la plataforma', type: 'text', apiKey: 'nombrePlataforma' },
  { key: 'support_email', label: 'Email de soporte', type: 'text', apiKey: 'emailSoporte' },
  { key: 'default_city', label: 'Ciudad por defecto', type: 'text', apiKey: 'ciudadPorDefecto' },
  { key: 'max_reviews_per_user', label: 'Máx. reseñas por usuario', type: 'number', apiKey: 'maxResenasPorUsuario' },
  { key: 'allow_registration', label: 'Permitir nuevos registros', type: 'toggle', apiKey: 'permitirRegistro' },
  { key: 'require_institution_approval', label: 'Requerir aprobación de instituciones', type: 'toggle', apiKey: 'aprobacionInstitucionRequerida' },
  { key: 'ai_enabled', label: 'Motor de IA activo', type: 'toggle', apiKey: 'iaHabilitada' },
  { key: 'maintenance_mode', label: 'Modo mantenimiento', type: 'toggle', apiKey: 'modoMantenimiento' },
]

const TOGGLE_KEYS = new Set(SETTING_FIELDS.filter(f => f.type === 'toggle').map(f => f.key))

/** true solo para 'true' (string) o true (boolean). */
const isTruthy = (v: unknown) => v === 'true' || v === true

type FormValues = Record<string, string | boolean>

export default function SettingsTab() {
  const addToast = useUiStore(s => s.addToast)
  const { data: settings } = useAdminSettings()
  const update = useUpdateSettings()

  // `form` es la única fuente de verdad de los cambios (null = sin cambios).
  const [form, setForm] = useState<FormValues | null>(null)

  /* Espejo local de la configuración remota con tipos correctos.
     Se repuebla SOLO cuando `settings` cambia realmente (comparación
     superficial), nunca en cada render: así el invalidateQueries posterior
     al guardar no pisa el estado ni borra lo escrito. */
  const [serverData, setServerData] = useState<FormValues | null>(() => mapServerToLocal(settings))

  useEffect(() => {
    const next = mapServerToLocal(settings)
    setServerData(prev => (sameData(prev, next) ? prev : next))
    setForm(null)
  }, [settings])

  /* Valores actuales: cambios locales si existen, si no los del servidor. */
  const values: FormValues = form ?? serverData ?? {}

  /* set() con updater funcional: sin mutación directa y sin perder la
     referencia anterior — corrige la pérdida de teclas en escritura rápida
     (React batch: `current` del render anterior quedaría desactualizado). */
  const set = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...(prev ?? serverData ?? {}), [key]: value }))
  }

  /* ── Payload del submit: captura el estado ACTUAL del formulario,
        serializa boolean→'true'/'false' y mapea a las claves de la API. ── */
  const buildPayload = (): Record<string, string> => {
    const payload: Record<string, string> = {}
    for (const f of SETTING_FIELDS) {
      const v = values[f.key]
      if (v === undefined) continue
      payload[f.apiKey] = TOGGLE_KEYS.has(f.key)
        ? (v === true ? 'true' : 'false')
        : String(v ?? '')
    }
    return payload
  }

  const save = () => {
    update.mutate(buildPayload(), {
      onSuccess: () => {
        addToast(ADMIN_TOAST.SETTINGS_UPDATED, 'success')
        setForm(null) // vuelve a los valores del servidor (ya invalidados por el hook)
      },
      onError: () => addToast(ADMIN_TOAST.SETTINGS_UPDATE_FAILED, 'error'),
    })
  }

  if (!serverData) {
    return (
      <div style={{ maxWidth: 640 }}>
        <Card>
          <SectionTitle icon={Icons.target({ s: 18 })}>Configuración de la plataforma</SectionTitle>
          <Skeleton h={40} style={{ marginBottom: 16 }} />
          <Skeleton h={40} style={{ marginBottom: 16 }} />
          <Skeleton h={40} />
        </Card>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <Card>
        <SectionTitle icon={Icons.target({ s: 18 })}>Configuración de la plataforma</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {SETTING_FIELDS.map(f => {
            const isToggle = f.type === 'toggle'
            const checked = isToggle && values[f.key] === true
            return (
              <div key={f.key} className="admin-settings-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingBottom: 14, borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)' }}>{f.label}</div>
                </div>
                {isToggle ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-label={f.label}
                    onClick={() => set(f.key, !checked)} // valor booleano inverso
                    style={{ width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, background: checked ? 'var(--primary)' : 'var(--border-color)', transition: 'background 0.2s' }}
                  >
                    <span style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </button>
                ) : (
                  <input
                    type={f.type}
                    value={String(values[f.key] ?? '')}
                    onChange={e => set(f.key, e.target.value)}
                    className="admin-settings-input"
                    style={{ height: 38, padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', fontFamily: 'var(--font-body)' }}
                  />
                )}
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          {form && (
            <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={() => setForm(null)}>
              Descartar
            </button>
          )}
          <button
            onClick={save}
            disabled={!form || update.isPending}
            style={{ fontSize: 14, padding: '10px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: form ? 'var(--primary)' : 'var(--border-color)', color: form ? '#fff' : 'var(--fg3)', fontWeight: 600, cursor: form ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)' }}
          >
            {update.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </Card>
    </div>
  )
}

/* ── Helpers de conversión local ↔ API ─────────────────────────────── */

/** Mapea la respuesta de la API (todo strings) al espejo local tipado. */
function mapServerToLocal(settings: unknown): FormValues | null {
  if (!settings || typeof settings !== 'object') return null
  const s = settings as Record<string, unknown>
  return {
    platform_name: typeof s.nombrePlataforma === 'string' ? s.nombrePlataforma : '',
    support_email: typeof s.emailSoporte === 'string' ? s.emailSoporte : '',
    default_city: typeof s.ciudadPorDefecto === 'string' ? s.ciudadPorDefecto : '',
    max_reviews_per_user: String(s.maxResenasPorUsuario ?? ''),
    allow_registration: isTruthy(s.permitirRegistro),
    require_institution_approval: isTruthy(s.aprobacionInstitucionRequerida),
    ai_enabled: isTruthy(s.iaHabilitada),
    maintenance_mode: isTruthy(s.modoMantenimiento),
    // Claves extra del servidor se ignoran a propósito: el PUT solo envía
    // claves declaradas en el DTO (updateSettings del backend descarta el resto).
  }
}

/** Comparación superficial para no re-crear el espejo (ni resetear el form) con objetos iguales. */
function sameData(a: FormValues | null, b: FormValues | null): boolean {
  if (!a || !b) return a === b
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const k of keys) {
    if (a[k] !== b[k]) return false
  }
  return true
}
