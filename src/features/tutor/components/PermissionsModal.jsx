import { useState, useEffect, useRef } from 'react'
import { Icons } from '@shared/components/shared'
import { usePermisos, useUpdatePermisos, DEFAULT_PERMISOS, PERMISOS_CONFIG } from '../hooks/usePermisos'

/**
 * Modal para gestionar los permisos de un dependiente.
 *
 * Muestra toggles modernos para cada permiso disponible.
 * Guarda los cambios automáticamente al modificar un toggle.
 *
 * @param {Object} props
 * @param {string}  props.dependienteId - ID del dependiente
 * @param {string}  props.dependienteName - Nombre del dependiente (para mostrar en el header)
 * @param {Function} props.onClose - Cierra el modal
 */
export default function PermissionsModal({ dependienteId, dependienteName, onClose }) {
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

  const togglePermiso = (key) => {
    if (isSaving) return // Evitar race conditions con toggles rápidos
    
    const newValue = !permisos[key]
    const newPermisos = { ...permisos, [key]: newValue }
    setPermisos(newPermisos)

    // Guardar automáticamente
    updatePermisos.mutate(
      { id: dependienteId, permisos: newPermisos },
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
    <div onClick={onClose} style={overlayStyle}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Gestionar permisos"
        style={modalStyle}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
              Permisos
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '4px 0 0' }}>
              {dependienteName}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={closeBtnStyle}
          >
            {Icons.x({ s: 18 })}
          </button>
        </div>

        {/* ── Loading State ── */}
        {loadingPermisos && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 72, borderRadius: 12, background: 'var(--border-color)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        )}

        {/* ── Permissions List ── */}
        {!loadingPermisos && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {PERMISOS_CONFIG.map(({ key, label, description, icon }) => (
              <ToggleRow
                key={key}
                icon={Icons[icon]?.({ s: 18 })}
                label={label}
                description={description}
                enabled={permisos[key]}
                onToggle={() => togglePermiso(key)}
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
            style={{ fontSize: 14, padding: '10px 20px', minHeight: 44 }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Fila de Toggle ── */
function ToggleRow({ icon, label, description, enabled, onToggle, disabled }) {
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
        onClick={onToggle}
        disabled={disabled}
        style={{
          width: 52,
          height: 28,
          borderRadius: 14,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: enabled ? 'var(--primary)' : 'var(--border-color)',
          position: 'relative',
          transition: 'background 0.2s ease',
          flexShrink: 0,
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: enabled ? 27 : 3,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            transition: 'left 0.2s ease',
          }}
        />
      </button>
    </div>
  )
}

/* ── Estilos ── */
const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 16,
  overflowY: 'auto',
}

const modalStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-sm)',
  padding: 28,
  maxWidth: 480,
  width: '100%',
  margin: 'auto',
}

const closeBtnStyle = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: '2px solid var(--border-color)',
  background: 'var(--bg-surface)',
  color: 'var(--fg2)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
