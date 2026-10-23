import React from 'react'
import { createPortal } from 'react-dom'
import type { ModeracionInfo } from '@/types/social'

interface ModeracionFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  moderacion?: ModeracionInfo | null
  onEditAgain?: () => void
}

const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  spam: {
    label: 'Spam o contenido irrelevante',
    color: '#D4944C',
    bg: 'color-mix(in srgb, #D4944C 12%, transparent)',
  },
  lenguaje_inapropiado: {
    label: 'Lenguaje inapropiado o agresivo',
    color: 'var(--color-coral, #FF4D68)',
    bg: 'color-mix(in srgb, var(--color-coral, #FF4D68) 12%, transparent)',
  },
  desinformacion: {
    label: 'Salud / Información sensible no verificada',
    color: '#E06D53',
    bg: 'color-mix(in srgb, #E06D53 12%, transparent)',
  },
  datos_sensibles: {
    label: 'Datos personales o confidenciales',
    color: '#8A5BD6',
    bg: 'color-mix(in srgb, #8A5BD6 12%, transparent)',
  },
}

export const ModeracionFeedbackModal: React.FC<ModeracionFeedbackModalProps> = ({
  isOpen,
  onClose,
  moderacion,
  onEditAgain,
}) => {
  if (!isOpen || !moderacion) return null

  const catMeta = CATEGORY_LABELS[moderacion.categoria?.toLowerCase() || ''] ?? {
    label: 'Revisión comunitaria',
    color: 'var(--color-coral, #FF4D68)',
    bg: 'color-mix(in srgb, var(--color-coral, #FF4D68) 12%, transparent)',
  }

  const fuenteLabel =
    moderacion.fuente === 'gemini'
      ? 'Inteligencia Artificial Gemini'
      : moderacion.fuente === 'admin'
      ? 'Equipo de Administración'
      : 'Reglas de Seguridad'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-moderacion-titulo"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'var(--modal-backdrop, rgba(15, 23, 42, 0.65))',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--bg-surface, #FFFFFF)',
          borderRadius: 20,
          border: '1.5px solid var(--border-color, rgba(33, 48, 82, 0.12))',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header con acento de atención */}
        <div
          style={{
            padding: '24px 24px 16px',
            borderBottom: '1px solid var(--border-color, rgba(0,0,0,0.08))',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'color-mix(in srgb, var(--color-coral, #FF4D68) 14%, transparent)',
              color: 'var(--color-coral, #FF4D68)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              id="modal-moderacion-titulo"
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                color: 'var(--fg1, #1e293b)',
                fontFamily: 'var(--font-display, inherit)',
              }}
            >
              Publicación en revisión
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: catMeta.color,
                  background: catMeta.bg,
                  padding: '3px 8px',
                  borderRadius: 6,
                }}
              >
                {catMeta.label}
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--fg3, #64748b)' }}>
                Detectado por: {fuenteLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Cuerpo explicativo en Lectura Fácil */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Motivo */}
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: 'var(--bg-cool, rgba(0,0,0,0.03))',
              border: '1px solid var(--border-color, rgba(0,0,0,0.06))',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--fg3, #64748b)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: 4,
              }}
            >
              Motivo detectado
            </div>
            <div style={{ fontSize: 14.5, color: 'var(--fg1, #1e293b)', lineHeight: 1.5, fontWeight: 500 }}>
              {moderacion.razon || 'El contenido no cumple con las directrices de convivencia inclusiva.'}
            </div>
          </div>

          {/* Sugerencia de mejora (Lectura Fácil) */}
          {moderacion.sugerenciaMejora && (
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: 'color-mix(in srgb, var(--color-matcha, #A8B86B) 14%, transparent)',
                border: '1.5px solid color-mix(in srgb, var(--color-matcha, #A8B86B) 35%, transparent)',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--color-matcha, #7C8B46)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>💡</span> Sugerencia en Lectura Fácil
              </div>
              <div style={{ fontSize: 14.5, color: 'var(--fg1, #1e293b)', lineHeight: 1.5, fontWeight: 600 }}>
                {moderacion.sugerenciaMejora}
              </div>
            </div>
          )}

          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--fg3, #64748b)', lineHeight: 1.45 }}>
            Tu contenido no se ha perdido. Está guardado para revisión con el equipo de moderación.
            Si corriges el texto siguiendo la sugerencia, podrás publicarlo de inmediato.
          </p>
        </div>

        {/* Footer con acciones */}
        <div
          style={{
            padding: '16px 24px 20px',
            borderTop: '1px solid var(--border-color, rgba(0,0,0,0.08))',
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              background: 'transparent',
              border: '1px solid var(--border-color, #cbd5e1)',
              color: 'var(--fg2, #475569)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body, inherit)',
            }}
          >
            Cerrar
          </button>

          <button
            onClick={() => {
              onClose()
              if (onEditAgain) onEditAgain()
            }}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              background: 'var(--primary, #0C3B4B)',
              color: '#ffffff',
              border: 'none',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-body, inherit)',
              boxShadow: '0 4px 14px rgba(12, 59, 75, 0.25)',
            }}
          >
            <span>✏️</span> Corregir texto
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
