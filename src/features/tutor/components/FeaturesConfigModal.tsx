import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Icons } from '@shared/components/shared'
import { TUTOR_UI } from '../constants/tutorMessages'
import { usePermisos } from '../hooks/usePermisos'

export interface FeatureItem {
  id: string
  label: string
  description?: string
}

export interface FeaturesConfigModalProps {
  dependent: {
    id: string | number
    pcdUserId?: string | number
    nombreCompleto?: string
    nombre?: string
    features?: Record<string, boolean | undefined>
    isLinked?: boolean
  }
  features?: (FeatureItem | string)[]
  onSave: (data: { id: string | number; features: Record<string, boolean>; isLinked: boolean }) => void
  onCancel: () => void
  saving?: boolean
}

const DEFAULT_FEATURE_DETAILS: Record<string, { label: string; description: string }> = {
  instituciones: { label: 'Instituciones', description: 'Explorar y buscar instituciones' },
  empleo: { label: 'Empleo', description: 'Ver y postularse a vacantes laborales' },
  comunidad: { label: 'Comunidad', description: 'Publicar y comentar en la comunidad' },
  mensajes: { label: 'Mensajes', description: 'Enviar y recibir mensajes directos' },
  favoritos: { label: 'Favoritos', description: 'Guardar instituciones favoritas' },
  asistenteIa: { label: 'Asistente IA', description: 'Usar el asistente de inteligencia artificial' },
  notificaciones: { label: 'Notificaciones', description: 'Recibir notificaciones del sistema' },
}

function getStoredFeatures(depId: string | number): Record<string, boolean> | null {
  try {
    const raw = localStorage.getItem(`raices_dep_features_${depId}`)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return null
}

function extractModuleValue(
  depId: string | number,
  dependentFeatures: Record<string, boolean | undefined> | undefined,
  permisosData: Record<string, unknown> | null | undefined,
  featureId: string
): boolean {
  // 1. Leer almacenamiento local prioritario
  const stored = getStoredFeatures(depId)
  if (stored && typeof stored[featureId] === 'boolean') {
    return stored[featureId]
  }

  // 2. Priorizar dependent.features (guardados en estado local/React Query)
  if (dependentFeatures && typeof dependentFeatures[featureId] === 'boolean') {
    return dependentFeatures[featureId] as boolean
  }

  if (dependentFeatures) {
    const keyMatch = Object.keys(dependentFeatures).find(k => k.toLowerCase() === featureId.toLowerCase())
    if (keyMatch && typeof dependentFeatures[keyMatch] === 'boolean') {
      return dependentFeatures[keyMatch] as boolean
    }
  }

  // 3. Evaluar la respuesta del backend permisosData
  if (permisosData) {
    const subObjects: unknown[] = [
      permisosData.modulos,
      permisosData.features,
      (permisosData.datos as Record<string, unknown> | undefined)?.modulos,
      (permisosData.datos as Record<string, unknown> | undefined)?.features,
      permisosData.datos,
      permisosData,
    ]

    for (const obj of subObjects) {
      if (!obj) continue

      if (Array.isArray(obj)) {
        const lowerArr = obj.map(item => String(item).toLowerCase())
        return lowerArr.includes(featureId.toLowerCase())
      }

      if (typeof obj === 'object') {
        const rec = obj as Record<string, unknown>
        if (typeof rec[featureId] === 'boolean') {
          return rec[featureId] as boolean
        }
        const keyMatch = Object.keys(rec).find(k => k.toLowerCase() === featureId.toLowerCase())
        if (keyMatch && typeof rec[keyMatch] === 'boolean') {
          return rec[keyMatch] as boolean
        }
      }
    }
  }

  // Fallback inicial por defecto
  return true
}

export default function FeaturesConfigModal({ dependent, features = [], onSave, onCancel, saving }: FeaturesConfigModalProps) {
  const nombre = dependent?.nombreCompleto || dependent?.nombre || 'esta persona'
  const depId = dependent?.isLinked ? (dependent?.pcdUserId || dependent?.id) : dependent?.id
  const { data: permisosData } = usePermisos(depId ? String(depId) : '')

  const normalizedFeatures: FeatureItem[] = (features && features.length > 0
    ? features
    : ['instituciones', 'empleo', 'comunidad']
  ).map(f => {
    if (typeof f === 'string') {
      const details = DEFAULT_FEATURE_DETAILS[f] || { label: f, description: '' }
      return { id: f, label: details.label, description: details.description }
    }
    return f
  })

  const [form, setForm] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    normalizedFeatures.forEach(f => {
      initial[f.id] = extractModuleValue(depId || dependent.id, dependent?.features, permisosData, f.id)
    })
    return initial
  })

  useEffect(() => {
    const updated: Record<string, boolean> = {}
    normalizedFeatures.forEach(f => {
      updated[f.id] = extractModuleValue(depId || dependent.id, dependent?.features, permisosData, f.id)
    })
    setForm(updated)
  }, [permisosData, dependent, depId])

  const toggleFeature = (id: string) => setForm(f => ({ ...f, [id]: !f[id] }))

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const targetId = depId || dependent.id
    try {
      localStorage.setItem(`raices_dep_features_${targetId}`, JSON.stringify(form))
    } catch {
      // ignore
    }
    onSave({
      id: targetId,
      features: form,
      isLinked: !!dependent.isLinked,
    })
  }

  return (
    <div onClick={onCancel} className="modal-overlay" style={{ zIndex: 1000, padding: 16, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} role="dialog" className="glass-card" aria-modal="true" aria-label="Configurar features" style={{ padding: 28, maxWidth: 480, width: '100%', margin: 'auto', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Icons.shield({ s: 22 })}</div>
            <div><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{TUTOR_UI.FEATURES_TITLE} {nombre}</h2><p style={{ fontSize: 13, color: 'var(--fg2)', margin: '2px 0 0' }}>{TUTOR_UI.FEATURES_MODAL_DESC}</p></div>
          </div>
          <button onClick={onCancel} aria-label="Cerrar" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.x({ s: 18 })}</button>
        </div>
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, maxHeight: '260px', overflowY: 'auto', paddingRight: '6px' }}>
            {normalizedFeatures.map(f => {
              const enabled = Boolean(form[f.id])
              return (
                <button key={f.id} type="button" onClick={() => toggleFeature(f.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: '12px', border: enabled ? '1.5px solid var(--primary)' : '1px solid var(--border-color)', background: enabled ? 'var(--primary-subtle)' : 'var(--bg-surface)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: enabled ? '2.5px solid var(--primary)' : '2.5px solid var(--border-color)', background: enabled ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s ease', color: '#fff' }}>{enabled && <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>✓</span>}</div>
                  <div><p style={{ fontSize: 15, fontWeight: 700, color: enabled ? 'var(--primary)' : 'var(--fg1)', margin: 0 }}>{f.label}</p><p style={{ fontSize: 12.5, color: 'var(--fg2)', margin: '2px 0 0' }}>{f.description}</p></div>
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="btn-secondary" onClick={onCancel} style={{ fontSize: 14.5 }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ fontSize: 14.5, padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', opacity: saving ? 0.6 : 1 }}>
              {saving ? TUTOR_UI.SAVE_BUTTON_LOADING : 'Guardar permisos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
