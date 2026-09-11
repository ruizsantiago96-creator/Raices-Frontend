import { useMe } from '@features/auth'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import PcdProfileWizard from '../components/PcdProfileWizard'
import TutorProfileWizard from '../components/TutorProfileWizard'

/**
 * Página `/completar-perfil` — renderiza el wizard de completar perfil
 * según el rol del usuario autenticado.
 *
 * Diseño: pantalla limpia, centrada, con el mismo estilo que el flujo
 * de registro (una pregunta por pantalla, muy limpio y ligero).
 */
export default function CompleteProfilePage() {
  const { data: user } = useMe()
  const nav = useNavigate()
  const userRole = String((user as any)?.role || (user as any)?.rol || 'pcd')
  const birthDate = (user as any)?.fecha_nacimiento || (user as any)?.fechaNacimiento || ''
  const [isDone, setIsDone] = useState(false)

  return (
    <div
      role="dialog"
      aria-modal="true"
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
          maxWidth: 640,
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
          onClick={() => nav('/feed')}
          aria-label="Cerrar"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 16,
            zIndex: 10,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ✕
        </button>
        {/* Top accent border stripe */}
        {!isDone && <div style={{ height: 6, width: '100%', background: 'linear-gradient(90deg, #229B58 0%, #2F80ED 50%, #073B4C 100%)', flexShrink: 0 }} />}
        
        <div style={{ padding: '32px 36px 36px' }}>
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
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 800,
          background: 'linear-gradient(90deg, #229B58 0%, #073B4C 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 6px',
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

      {(userRole === 'institucion' || userRole === 'empresa' || userRole === 'institution' || userRole === 'enterprise') && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--fg2)',
          fontSize: 14,
        }}>
          <p>La completación de perfil para instituciones y empresas estará disponible pronto.</p>
          <p style={{ fontSize: 12.5, color: 'var(--fg3)', marginTop: 8 }}>
            Por ahora, puedes configurar tu institución desde el Portal Institucional.
          </p>
        </div>
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
  )
}
