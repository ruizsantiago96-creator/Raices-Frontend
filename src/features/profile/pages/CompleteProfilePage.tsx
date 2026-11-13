import { useMe, useProfile } from '@features/auth'
import { useNavigate, Navigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import FocusTrap from 'focus-trap-react'
import { useOnboardingStatus } from '@features/institutions/hooks/useRecommendations'
import { esSoloPendienteVerificacion, getVerificationRouteByRole } from '@features/dashboard/components/ProfileCompletionModal'
import PcdProfileWizard from '../components/PcdProfileWizard'
import TutorProfileWizard from '../components/TutorProfileWizard'
import InstitutionProfileWizard from '../components/InstitutionProfileWizard'
import EnterpriseProfileWizard from '../components/EnterpriseProfileWizard'

interface UserProfileData {
  role?: string
  rol?: string
  fecha_nacimiento?: string
  fechaNacimiento?: string
  profiling?: {
    birth_date?: string
  }
}

function getUserProfileData(user: unknown, profile: unknown): { userRole: string; birthDate: string } {
  const u = (user && typeof user === 'object' ? user : {}) as UserProfileData
  const p = (profile && typeof profile === 'object' ? profile : {}) as UserProfileData
  const userRole = String(u.role || u.rol || p.role || p.rol || 'pcd')
  const birthDate =
    u.fecha_nacimiento ||
    u.fechaNacimiento ||
    p.fechaNacimiento ||
    p.fecha_nacimiento ||
    p.profiling?.birth_date ||
    ''
  return { userRole, birthDate }
}

/**
 * Página `/completar-perfil` — renderiza el wizard de completar perfil
 * según el rol del usuario autenticado.
 */
export default function CompleteProfilePage() {
  const { data: user } = useMe()
  const { data: profile } = useProfile()
  const { data: onboardingStatus } = useOnboardingStatus()
  const nav = useNavigate()
  const [isDone, setIsDone] = useState(false)

  const { userRole, birthDate } = getUserProfileData(user, profile)

  useEffect(() => {
    if (!isDone && esSoloPendienteVerificacion(onboardingStatus)) {
      nav(getVerificationRouteByRole(userRole), { replace: true })
    }
  }, [isDone, onboardingStatus, userRole, nav])

  const handleClose = useCallback(() => {
    nav('/feed')
  }, [nav])

  // Manejo accesible del teclado (Cerrar modal con tecla Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClose])

  if (!isDone && esSoloPendienteVerificacion(onboardingStatus)) {
    return <Navigate to={getVerificationRouteByRole(userRole)} replace />
  }

  return (
    <FocusTrap focusTrapOptions={{ allowOutsideClick: true, fallbackFocus: '#modal-title' }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'var(--modal-backdrop)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--fg1)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            boxShadow: 'var(--shadow-xl)',
            maxWidth: 880,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar modal"
            title="Cerrar"
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              color: 'var(--fg2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              zIndex: 10,
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-warm)'
              e.currentTarget.style.color = 'var(--fg1)'
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)'
              e.currentTarget.style.color = 'var(--fg2)'
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {/* Top accent border stripe */}
          {!isDone && <div style={{ height: 6, width: '100%', background: 'linear-gradient(90deg, #229B58 0%, #2F80ED 50%, #073B4C 100%)', flexShrink: 0 }} />}
          
          <div style={{ padding: isDone ? '54px 36px 36px' : '32px 36px 36px' }}>
            {/* Header motivacional */}
            {!isDone && (
              <div style={{
                textAlign: 'center',
                marginBottom: 24,
                padding: '20px 16px',
                background: 'linear-gradient(135deg, rgba(34,155,88,0.08) 0%, rgba(7,59,76,0.05) 100%)',
                borderRadius: 16,
                border: '1px solid rgba(34,155,88,0.15)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
                <h1 id="modal-title" tabIndex={-1} style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 800,
                  background: 'linear-gradient(90deg, #229B58 0%, #073B4C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0 0 6px',
                  outline: 'none',
                }}>
                  Completa tu perfil
                </h1>
                <p style={{ fontSize: 13.5, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
                  Mientras más sepamos sobre ti, mejores recomendaciones podremos darte.
                  <br />
                  <strong style={{ color: 'var(--fg1)' }}>Solo te tomará unos minutos.</strong>
                </p>
              </div>
            )}

            {/* Wizard según rol */}
            {(userRole === 'pcd' || userRole === 'persona_discapacidad') && (
              <PcdProfileWizard birthDate={birthDate} onDone={() => setIsDone(true)} />
            )}

            {(userRole === 'tutor' || userRole === 'padre_tutor') && (
              <TutorProfileWizard onDone={() => setIsDone(true)} />
            )}

            {(userRole === 'institucion' || userRole === 'institution') && (
              <InstitutionProfileWizard onDone={() => setIsDone(true)} />
            )}

            {(userRole === 'empresa' || userRole === 'enterprise') && (
              <EnterpriseProfileWizard onDone={() => setIsDone(true)} />
            )}
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
    </FocusTrap>
  )
}
