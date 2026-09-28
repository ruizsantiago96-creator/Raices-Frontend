import { useNavigate } from 'react-router-dom'

const FIELD_LABELS: Record<string, string> = {
  curp: 'CURP',
  perfilNecesidades: 'Perfil de necesidades',
  certificadoDiscapacidad: 'Certificado de discapacidad',
  telefono: 'Teléfono',
  direccion: 'Dirección o ubicación',
  biografia: 'Biografía',
  fechaNacimiento: 'Fecha de nacimiento',
}

export interface ProfileCompletionModalProps {
  isOpen: boolean
  onboardingStatus?: { porcentaje?: number; camposFaltantes?: string[]; [key: string]: unknown } | null
  isRejected?: boolean
  identidadStatus?: { motivoRechazo?: string; [key: string]: unknown } | null
  onClose: () => void
}

export default function ProfileCompletionModal({
  isOpen,
  onboardingStatus,
  isRejected = false,
  identidadStatus,
  onClose,
}: ProfileCompletionModalProps) {
  const nav = useNavigate()

  if (!isOpen) {
    return null
  }

  const formattedMissing = (onboardingStatus?.camposFaltantes || [])
    .map((field: string) => FIELD_LABELS[field] || field)
    .join(', ')

  const handleComplete = () => {
    onClose()
    nav('/completar-perfil')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-profile-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxWidth: 520,
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top accent border stripe con degradado verde-azul */}
        <div style={{ height: 6, width: '100%', background: 'linear-gradient(90deg, #229B58 0%, #2F80ED 50%, #073B4C 100%)' }} />

        <div style={{ padding: '32px 36px 36px', textAlign: 'left' }}>
          <h2
            id="modal-profile-title"
            style={{
              fontFamily: 'var(--font-display, "Atkinson Hyperlegible", system-ui, sans-serif)',
              fontSize: 22,
              fontWeight: 800,
              background: isRejected
                ? 'linear-gradient(90deg, #DC2626 0%, #991B1B 100%)'
                : 'linear-gradient(90deg, #229B58 0%, #073B4C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: isRejected ? '#DC2626' : '#073B4C',
              margin: '0 0 16px',
              lineHeight: 1.3,
            }}
          >
            {isRejected ? 'Actualiza tu documentación' : 'Completa tu perfil'}
          </h2>

          <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
            {isRejected
              ? 'Tu documentación de identidad fue revisada y rechazada por el equipo de administración. Es necesario subirla nuevamente para validar tu identidad en Raíces.'
              : 'Faltan datos en tu perfil. Completarlo permite que tus oportunidades, recomendaciones y caminos se adapten correctamente dentro del ecosistema de Raíces.'
            }
          </p>

          {isRejected && identidadStatus?.motivoRechazo && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1.5px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 14,
                padding: '14px 18px',
                marginBottom: 20,
                fontSize: 13,
                color: '#991B1B',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⚠️</span> Motivo de rechazo:
              </div>
              <div>{identidadStatus.motivoRechazo}</div>
            </div>
          )}

          {!isRejected && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(34, 155, 88, 0.08) 0%, rgba(7, 59, 76, 0.05) 100%)',
                border: '1.5px solid rgba(34, 155, 88, 0.22)',
                borderRadius: 14,
                padding: '16px 20px',
                marginBottom: 20,
                fontSize: 13,
                color: '#073B4C',
                lineHeight: 1.5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: '#073B4C' }}>Progreso de perfil</span>
                  {onboardingStatus?.nombrePcd && (
                    <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 10, background: 'rgba(34,155,88,0.15)', color: '#229B58', fontWeight: 700 }}>
                      {onboardingStatus.destinatarioPerfil === 'PARA_MI_HIJO' ? `Para: ${onboardingStatus.nombrePcd}` : 'Para mi'}
                    </span>
                  )}
                </div>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#229B58' }}>
                  {onboardingStatus?.porcentajeProgreso ?? onboardingStatus?.porcentaje ?? 0}%
                </span>
              </div>

              <div style={{ height: 7, background: 'rgba(7, 59, 76, 0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${onboardingStatus?.porcentajeProgreso ?? onboardingStatus?.porcentaje ?? 0}%`,
                    background: 'linear-gradient(90deg, #229B58 0%, #073B4C 100%)',
                    borderRadius: 4,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>

              {typeof onboardingStatus?.ultimoPasoCompletado === 'number' && onboardingStatus.ultimoPasoCompletado > 0 && (
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#229B58', marginBottom: 6 }}>
                  📍 Te quedaste en el Paso {onboardingStatus.ultimoPasoCompletado} (Reanudarás automáticamente en el Paso {onboardingStatus.ultimoPasoCompletado + 1})
                </div>
              )}

              {formattedMissing && (
                <div style={{ fontSize: 12.5, color: '#334155' }}>
                  <span style={{ fontWeight: 600, color: '#073B4C' }}>Faltan por completar:</span> {formattedMissing}
                </div>
              )}
            </div>
          )}

          <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 28px', lineHeight: 1.5 }}>
            Puedes continuar ahora o guardar tu avance para después en cualquier momento.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 28px',
                borderRadius: 24,
                background: '#F1F5F9',
                color: '#475569',
                border: '1px solid #E2E8F0',
                fontWeight: 600,
                fontSize: 14.5,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E2E8F0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
            >
              Más tarde
            </button>

            <button
              type="button"
              onClick={handleComplete}
              style={{
                padding: '12px 32px',
                borderRadius: 24,
                background: 'linear-gradient(135deg, #229B58 0%, #073B4C 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: 14.5,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(34, 155, 88, 0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.08)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'none'
                e.currentTarget.style.transform = 'none'
              }}
            >
              {isRejected
                ? 'Actualizar documentos'
                : typeof onboardingStatus?.ultimoPasoCompletado === 'number' && onboardingStatus.ultimoPasoCompletado > 0
                  ? `Reanudar en Paso ${onboardingStatus.ultimoPasoCompletado + 1}`
                  : 'Completar perfil'
              }
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
