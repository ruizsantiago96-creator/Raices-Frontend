import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useEstadoValidacion } from '@features/profile/hooks/useDocumentoIdentidad'
import { useEsEmpresa } from '@features/auth/lib/empresaRole'
import { Icons } from '@shared/components/shared'

export interface VerificationBadgeCardProps {
  compact?: boolean
}

export const VerificationBadgeCard: React.FC<VerificationBadgeCardProps> = ({ compact = false }) => {
  const nav = useNavigate()
  const { data: status } = useEstadoValidacion()
  const isEmpresa = useEsEmpresa()

  // La insignia se basa en CURP + identificación oficial, que son datos de
  // persona física. Una empresa (persona moral) se acredita con su CSF, así que
  // nunca debe ver este llamado a la acción.
  if (isEmpresa) return null

  const estado = status?.estado || 'sin_documentos'

  if (estado === 'aprobado') {
    return (
      <div style={{
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: compact ? 12 : 16,
        padding: compact ? '10px 14px' : '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: compact ? 28 : 36,
          height: compact ? 28 : 36,
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.2)',
          color: '#10B981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {Icons.shieldCheck({ s: compact ? 16 : 20 })}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: compact ? 12.5 : 14, fontWeight: 700, color: '#10B981' }}>
            Cuenta Verificada Oficialmente 🛡️
          </div>
          {!compact && (
            <p style={{ fontSize: 12, color: 'var(--fg2)', margin: '2px 0 0' }}>
              Tu CURP e identidad han sido validados con éxito en Raíces.
            </p>
          )}
        </div>
      </div>
    )
  }

  if (estado === 'pendiente') {
    return (
      <div style={{
        background: 'rgba(212, 148, 76, 0.08)',
        border: '1px solid rgba(212, 148, 76, 0.3)',
        borderRadius: compact ? 12 : 16,
        padding: compact ? '10px 14px' : '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: compact ? 28 : 36,
            height: compact ? 28 : 36,
            borderRadius: '50%',
            background: 'rgba(212, 148, 76, 0.2)',
            color: '#D4944C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {Icons.activity({ s: compact ? 16 : 20 })}
          </div>
          <div>
            <div style={{ fontSize: compact ? 12.5 : 14, fontWeight: 700, color: '#D4944C' }}>
              Verificación en revisión
            </div>
            {!compact && (
              <p style={{ fontSize: 12, color: 'var(--fg2)', margin: '2px 0 0' }}>
                Estamos validando tu CURP y documentación.
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => nav('/verificacion-identidad')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(212, 148, 76, 0.5)',
            color: '#D4944C',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Ver estado
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(7, 59, 76, 0.04) 0%, rgba(34, 155, 88, 0.07) 100%)',
      border: '1px solid rgba(34, 155, 88, 0.25)',
      borderRadius: compact ? 12 : 16,
      padding: compact ? '12px 14px' : '18px 22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: compact ? 32 : 42,
          height: compact ? 32 : 42,
          borderRadius: 12,
          background: 'rgba(34, 155, 88, 0.15)',
          color: '#229B58',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {Icons.shieldCheck({ s: compact ? 18 : 24 })}
        </div>
        <div>
          <div style={{ fontSize: compact ? 13 : 15, fontWeight: 800, color: 'var(--fg1)' }}>
            Obtén tu Insignia de Cuenta Verificada 🛡️
          </div>
          {!compact && (
            <p style={{ fontSize: 12.5, color: 'var(--fg2)', margin: '2px 0 0', lineHeight: 1.4 }}>
              Verifica tu CURP e Identificación Oficial para habilitar convocatorias y vincular la red comunitaria.
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => nav('/verificacion-identidad')}
        style={{
          background: '#229B58',
          color: '#ffffff',
          border: 'none',
          padding: compact ? '7px 14px' : '10px 18px',
          borderRadius: 10,
          fontSize: compact ? 12 : 13,
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(34, 155, 88, 0.25)',
          transition: 'all 0.2s ease',
        }}
      >
        Verificar con CURP
      </button>
    </div>
  )
}

export default VerificationBadgeCard
