import { useNavigate } from 'react-router-dom'
import { useEstadoValidacion } from '../hooks/useDocumentoIdentidad'
import IdentityStatusCard from '../components/IdentityStatusCard'
import { IdentityUploadSection } from '../components/ProfileIdentitySection'
import { Icons } from '@shared/components/shared'

export default function IdentityVerificationPage() {
  const nav = useNavigate()
  const { data: status, isLoading, refetch } = useEstadoValidacion()

  const estado = status?.estado || 'sin_documentos'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px', fontFamily: 'var(--font-body)' }}>
      {/* Botón Volver */}
      <button
        onClick={() => nav(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: 'none',
          color: 'var(--fg2)',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 20,
          padding: '6px 12px',
          borderRadius: 8,
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-cool)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {Icons.arrowLeft({ s: 18 })} Volver
      </button>

      {/* Header explicativo */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34,155,88,0.08) 0%, rgba(7,59,76,0.05) 100%)',
        border: '1px solid rgba(34,155,88,0.2)',
        borderRadius: 16,
        padding: '28px 24px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
      }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: 'rgba(34,155,88,0.15)',
          color: '#229B58',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {Icons.shieldCheck({ s: 28 })}
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--fg1)',
            margin: '0 0 6px',
          }}>
            Verificación de Identidad (CURP y Documentación)
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
            La verificación con CURP e Identificación Oficial otorga la <strong>Insignia de Cuenta Verificada 🛡️</strong>, garantiza la protección de tu cuenta y te permite acceder a convocatorias, vinculación legal de tutores y programas institucionales de Raíces.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--fg3)', fontSize: 14 }}>
          Cargando estado de verificación de identidad...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Card con el Estado Actual */}
          <IdentityStatusCard status={status} stateKey={estado} />

          {/* Módulo de carga de documentos si no está verificado o si requiere corregir */}
          <IdentityUploadSection status={status} estado={estado} onUploaded={() => refetch()} />
        </div>
      )}
    </div>
  )
}
