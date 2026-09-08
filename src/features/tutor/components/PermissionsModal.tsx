import { useState, useEffect, useRef, FC, ReactNode } from 'react'
import { Icons } from '@shared/components/shared'
import { usePermisos, useUpdatePermisos, DEFAULT_PERMISOS, PERMISOS_CONFIG } from '../hooks/usePermisos'

export interface PermissionsModalProps {
  dependienteId: string | number
  dependienteName: string
  onClose: () => void
}

type PermisoKey = 'puedeComentar' | 'puedeInteractuar' | 'accesoMultimedia' | 'accesoChat' | 'puedePublicar'

export default function PermissionsModal({ dependienteId, dependienteName, onClose }: PermissionsModalProps) {
  const { data: permisosData, isLoading: loadingPermisos } = usePermisos(dependienteId)
  const updatePermisos = useUpdatePermisos()

  // Estado local de los permisos (se inicializa con los datos del backend o defaults)
  const [permisos, setPermisos] = useState(DEFAULT_PERMISOS)
  const initializedRef = useRef(false)

  // Sincronizar con datos del backend cuando lleguen (una sola vez)
  useEffect(() => {
    if (permisosData && !initializedRef.current) {
      initializedRef.current = true
      setPermisos({
        puedeComentar: permisosData.puedeComentar ?? DEFAULT_PERMISOS.puedeComentar,
        puedeInteractuar: permisosData.puedeInteractuar ?? DEFAULT_PERMISOS.puedeInteractuar,
        accesoMultimedia: permisosData.accesoMultimedia ?? DEFAULT_PERMISOS.accesoMultimedia,
        accesoChat: permisosData.accesoChat ?? DEFAULT_PERMISOS.accesoChat,
        puedePublicar: permisosData.puedePublicar ?? DEFAULT_PERMISOS.puedePublicar,
      })
    }
  }, [permisosData])

  const togglePermiso = (key: PermisoKey) => {
    if (isSaving) return // Evitar race conditions con toggles rápidos
    
    const newValue = !permisos[key]
    const newPermisos = { ...permisos, [key]: newValue }
    setPermisos(newPermisos)

    // Guardar automáticamente
    updatePermisos.mutate(
      { id: dependienteId, permisos: newPermisos } as unknown as Parameters<typeof updatePermisos.mutate>[0],
      {
        onError: () => {
          // Revertir en caso de error
          setPermisos(prev => ({ ...prev, [key]: permisos[key] }))
        },
      }
    )
  }

  const isSaving = updatePermisos.isPending

  return (
    <div onClick={onClose} className="modal-overlay" style={{ zIndex: 1000, overflowY: 'auto' }}>
      <div 
        onClick={e => e.stopPropagation()} 
        className="modal-card" 
        style={{ maxWidth: 480, width: '100%', margin: 'auto' }}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
              Permisos de acceso
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '4px 0 0' }}>
              Configura a qué funciones tiene acceso <strong>{dependienteName}</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'var(--fg3)', 
              padding: 4, 
              display: 'flex',
              borderRadius: 8,
            }}
            aria-label="Cerrar modal"
          >
            {Icons.close({ s: 20 })}
          </button>
        </div>

        {/* ── Info Box ── */}
        <div 
          style={{ 
            background: 'var(--primary-subtle)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 12, 
            padding: '12px 16px', 
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 20 }}>🛡️</span>
          <p style={{ fontSize: 13, color: 'var(--fg1)', margin: 0, lineHeight: 1.4 }}>
            Como tutor, puedes activar o desactivar funciones según las necesidades de esta persona.
          </p>
        </div>

        {/* ── Loading Skeleton ── */}
        {loadingPermisos && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton" style={{ height: 68, borderRadius: 12 }} />
            ))}
          </div>
        )}

        {/* ── Permissions List ── */}
        {!loadingPermisos && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: '260px', overflowY: 'auto', paddingRight: '6px' }}>
            {PERMISOS_CONFIG.map(({ key, label, description, icon }) => (
              <ToggleRow
                key={key}
                icon={Icons[icon as keyof typeof Icons]?.({ s: 18 })}
                label={label}
                description={description}
                enabled={Boolean(permisos[key as PermisoKey])}
                onToggle={() => togglePermiso(key as PermisoKey)}
                disabled={isSaving}
              />
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0 }}>
            Los cambios se guardan automáticamente
          </p>
          <button 
            className="btn-secondary"
            onClick={onClose}
            style={{ fontSize: 14 }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

interface ToggleRowProps {
  icon?: ReactNode
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
  disabled?: boolean
}

/* ── Fila de Toggle ── */
const ToggleRow: FC<ToggleRowProps> = ({ icon, label, description, enabled, onToggle, disabled }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 12,
        background: enabled ? 'var(--primary-subtle)' : 'transparent',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* Icono */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: enabled ? 'var(--primary)' : 'var(--border-color)',
          color: enabled ? '#fff' : 'var(--fg3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        {icon}
      </div>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>
          {label}
        </p>
        <p style={{ fontSize: 13, color: 'var(--fg2)', margin: '2px 0 0', lineHeight: 1.4 }}>
          {description}
        </p>
      </div>

      {/* Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        disabled={disabled}
        onClick={onToggle}
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          background: enabled ? 'var(--primary)' : 'var(--border-color)',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative',
          padding: 2,
          transition: 'background 0.2s ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: 'block',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transform: enabled ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>
    </div>
  )
}
