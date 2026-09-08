import { Icons } from '@shared/components/shared'

const ESTADO_CONFIG = {
  sin_documentos: {
    label: 'Sin documentos',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.12)',
    description: 'Aún no has subido ningún documento de identidad.',
    icon: Icons.upload,
  },
  pendiente: {
    label: 'En revisión',
    color: '#D4944C',
    bg: 'rgba(212,148,76,0.12)',
    description: 'Tus documentos están siendo revisados por nuestro equipo.',
    icon: Icons.activity,
  },
  aprobado: {
    label: 'Aprobado',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    description: 'Tu identidad ha sido verificada exitosamente.',
    icon: Icons.shieldCheck,
  },
  rechazado: {
    label: 'Rechazado',
    color: '#DC3545',
    bg: 'rgba(220,53,69,0.12)',
    description: 'Tu identidad no pudo ser verificada. Revisa el motivo y vuelve a subir.',
    icon: Icons.shieldAlert,
  },
}

export function useIdentityStatusConfig(estado = 'sin_documentos') {
  return ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.sin_documentos
}

export function IdentityStatusCard({ status, stateKey }) {
  const cfg = useIdentityStatusConfig(stateKey ?? status?.estado ?? 'sin_documentos')
  const StatusIcon = cfg.icon
  const displayState = stateKey ?? status?.estado ?? 'sin_documentos'

  return (
    <div
      style={{
        background: 'var(--bg-surface, #fff)',
        border: '1px solid var(--border-color)',
        borderRadius: 14,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: cfg.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StatusIcon s={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg1)' }}>
              Estado de verificación
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 8,
                background: cfg.bg,
                color: cfg.color,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {cfg.label}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '2px 0 0' }}>
            {cfg.description}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <IdentityDetail label="CURP" value={status?.tieneCurp ? '✓ Subido' : 'No subido'} color={status?.tieneCurp ? 'var(--fg1)' : 'var(--fg3)'} />
        <IdentityDetail label="Identificación oficial" value={status?.tieneIdentificacion ? '✓ Subido' : 'No subido'} color={status?.tieneIdentificacion ? 'var(--fg1)' : 'var(--fg3)'} />
        {status?.numeroCurp && (
          <IdentityDetail label="CURP declarada" value={status.numeroCurp} color="var(--fg1)" mono />
        )}
        {status?.fechaSubida && (
          <IdentityDetail
            label="Última subida"
            value={new Date(status.fechaSubida).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
            color="var(--fg1)"
          />
        )}
      </div>

      {displayState === 'rechazado' && status?.motivoRechazo && (
        <div
          style={{
            marginTop: 16,
            padding: '14px 16px',
            background: 'rgba(220,53,69,0.06)',
            border: '1px solid rgba(220,53,69,0.2)',
            borderRadius: 10,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#DC3545', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Motivo de rechazo
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--fg1)', lineHeight: 1.5 }}>
            {status.motivoRechazo}
          </div>
        </div>
      )}

      {status?.fechaRevision && (
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--fg3)' }}>
          Revisado el {new Date(status.fechaRevision).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  )
}

function IdentityDetail({ label, value, color, mono }) {
  return (
    <div
      style={{
        padding: '10px 14px',
        background: 'var(--bg-warm, #f8fafc)',
        borderRadius: 8,
        fontSize: 13,
      }}
    >
      <div style={{ color: 'var(--fg3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ color, fontWeight: 600, ...(mono ? { fontFamily: 'monospace', fontSize: 12.5, wordBreak: 'break-all' } : {}) }}>
        {value}
      </div>
    </div>
  )
}

export default IdentityStatusCard
