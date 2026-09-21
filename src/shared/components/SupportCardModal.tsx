import React from 'react'
import { createPortal } from 'react-dom'
import { Icons } from './shared'
import { useMe } from '@features/auth'
import type { Dependiente } from '@/types/tutor'

export interface SupportCardModalProps {
  isOpen: boolean
  onClose: () => void
  dependiente: Dependiente | null
}

export const SupportCardModal: React.FC<SupportCardModalProps> = ({ isOpen, onClose, dependiente }) => {
  const { data: user } = useMe()
  if (!isOpen || !dependiente) return null

  const handlePrint = () => {
    window.print()
  }

  return createPortal(
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        overflowY: 'auto',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-card-title"
    >
      <div
        className="animate-scale-up"
        style={{
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-color)',
          borderRadius: 24,
          padding: '28px 24px',
          width: '100%',
          maxWidth: 540,
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          margin: 'auto',
          position: 'relative',
        }}
      >
        {/* Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icons.shieldAlert({ s: 22 })}
            </div>
            <div>
              <h2 id="support-card-title" style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                Ficha de Necesidades y Apoyo
              </h2>
              <span style={{ fontSize: 12, color: 'var(--fg3)' }}>Carnet Digital e Información de Emergencia</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)',
              padding: 6, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            aria-label="Cerrar ficha"
          >
            {Icons.x({ s: 20 })}
          </button>
        </div>

        {/* Profile Card Summary */}
        <div style={{ background: 'var(--bg-cool)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
              {(dependiente?.nombreCompleto || dependiente?.nombre) ? String(dependiente.nombreCompleto || dependiente.nombre).charAt(0).toUpperCase() : '🌱'}
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 2px' }}>
                {String(dependiente?.nombreCompleto || dependiente?.nombre || 'Persona registrada')} {String(dependiente?.apellido || '')}
              </h3>
              <span style={{ fontSize: 13, color: 'var(--fg2)' }}>
                {String(dependiente?.parentesco || dependiente?.relacion || 'Familiar').replace(/&#x2F;/g, '/').replace(/&amp;/g, '&')}
                {dependiente?.fechaNacimiento ? ` · ${dependiente.fechaNacimiento}` : ''}
              </span>
            </div>
          </div>

          {(dependiente?.diagnostico || dependiente?.notas) && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--primary)', display: 'block', marginBottom: 4 }}>
                Diagnóstico / Notas de Expediente
              </span>
              <p style={{ fontSize: 14, color: 'var(--fg1)', margin: 0, fontWeight: 500 }}>
                {String(dependiente?.diagnostico || dependiente?.notas || '')}
              </p>
            </div>
          )}
        </div>

        {/* Communication & Sensory Support Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              {Icons.message({ s: 14 })} Canal Preferido
            </span>
            <p style={{ fontSize: 13.5, color: dependiente?.canalComunicacion ? 'var(--fg1)' : 'var(--fg3)', margin: 0, fontWeight: 600 }}>
              {String(dependiente?.canalComunicacion || 'No especificado')}
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              {Icons.shieldAlert({ s: 14 })} Alertas / Necesidades
            </span>
            <p style={{ fontSize: 13.5, color: (dependiente?.apoyosSensoriales || (Array.isArray(dependiente?.tiposDiscapacidad) && dependiente.tiposDiscapacidad.length > 0)) ? 'var(--fg1)' : 'var(--fg3)', margin: 0, fontWeight: 600 }}>
              {String(
                dependiente?.apoyosSensoriales ||
                (Array.isArray(dependiente?.tiposDiscapacidad) && dependiente.tiposDiscapacidad.length > 0
                  ? dependiente.tiposDiscapacidad.join(', ')
                  : 'Sin alertas registradas')
              )}
            </p>
          </div>
        </div>

        {/* Emergency Tutor Contact */}
        <div style={{ background: 'color-mix(in oklch, var(--primary) 8%, transparent)', border: '1px solid color-mix(in oklch, var(--primary) 25%, transparent)', borderRadius: 16, padding: 18, marginBottom: 24 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
            📞 Contacto Principal de Emergencia / Tutor
          </span>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>
            {String(
              dependiente?.tutorContacto ||
              (user?.full_name ? `${user.full_name} (${user.email || ''})` : 'Tutor Responsable Registrado')
            )}
          </p>
          <span style={{ fontSize: 13, color: 'var(--fg2)' }}>
            Cuenta verificada del tutor registrado en la plataforma.
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <button
            onClick={handlePrint}
            className="btn-secondary"
            style={{
              padding: '10px 18px', borderRadius: 12, fontSize: 13.5, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer'
            }}
          >
            {Icons.plus({ s: 16 })} Imprimir Carnet Digital
          </button>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{
              padding: '10px 22px', borderRadius: 12, fontSize: 13.5, fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default SupportCardModal
