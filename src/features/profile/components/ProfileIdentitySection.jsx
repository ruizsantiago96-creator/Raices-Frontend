import { useState } from 'react'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'
import { IdentityStatusCard } from './IdentityStatusCard'

export function useIdentitySection(state) {
  const [curpNumber, setCurpNumber] = useState('')
  return { curpNumber, setCurpNumber }
}

export function IdentityUploadSection({ status, estado, onUploaded }) {
  if (estado !== 'sin_documentos' && estado !== 'rechazado') return null

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
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17,
          fontWeight: 700,
          color: 'var(--fg1)',
          margin: '0 0 6px',
        }}
      >
        {estado === 'rechazado' ? 'Subir documentos nuevamente' : 'Subir documentos'}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 20px' }}>
        Sube tu CURP y una identificación oficial (INE, pasaporte, cédula profesional)
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Número de CURP (18 caracteres)</label>
        <input
          type="text"
          className="onboarding-input"
          style={{ ...inputStyle, marginTop: 6, fontFamily: 'monospace', letterSpacing: '0.05em' }}
          value={status?.numeroCurp ?? ''}
          placeholder="GAPL800101HMCYRL09"
          maxLength={18}
          readOnly
        />
        <div style={{ fontSize: 11.5, color: 'var(--fg3)', marginTop: 4 }}>
          Ingresa las 18 letras de tu Clave Única de Registro de Población
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <IdentityDocumentUploader tipo="curp" isUploaded={status?.tieneCurp && estado !== 'rechazado'} />
      </div>

      <div>
        <IdentityDocumentUploader tipo="identificacion_oficial" isUploaded={status?.tieneIdentificacion && estado !== 'rechazado'} />
      </div>

      <div
        style={{
          marginTop: 20,
          padding: '12px 16px',
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 10,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <span style={{ flexShrink: 0, marginTop: 1 }}>
          {Icons.target({ s: 14 })}
        </span>
        <div style={{ fontSize: 12.5, color: 'var(--fg2)', lineHeight: 1.5 }}>
          <strong>¿Por qué verificar tu identidad?</strong> La verificación de identidad es necesaria
          para que las instituciones confíen en ti. Tu información es tratada de forma confidencial
          y solo es revisada por nuestro equipo de administración.
        </div>
      </div>
    </div>
  )
}

function IdentityDocumentUploader({ tipo, isUploaded }) {
  const tipoLabel = tipo === 'curp' ? 'CURP' : 'Identificación oficial'

  if (isUploaded) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 10,
          fontSize: 13,
          color: '#10B981',
          fontWeight: 600,
        }}
      >
        {Icons.check({ s: 16 })}
        <span>{tipoLabel} subido</span>
      </div>
    )
  }

  return (
    <div
      style={{
        border: '2px dashed var(--border-color)',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--primary-subtle, rgba(99,102,241,0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {Icons.upload({ s: 16 })}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)' }}>{tipoLabel}</div>
          <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
            JPEG, PNG, WebP o PDF — máx. 10 MB
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'var(--bg-warm, #f8fafc)',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        {Icons.upload({ s: 14 })}
        <span style={{ fontSize: 13, color: 'var(--fg1)', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Seleccionar archivo
        </span>
      </div>
    </div>
  )
}

export default function ProfileIdentitySection({ status, estado }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <IdentityStatusCard status={status} />

      <IdentityUploadSection status={status} estado={estado} />

      {estado === 'pendiente' && (
        <div
          className="animate-fade-in-up delay-2"
          style={{
            background: 'var(--bg-surface, #fff)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(212,148,76,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                border: '3px solid #D4944C',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                display: 'block',
              }}
            />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
            Documentos en revisión
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--fg3)', maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
            Tus documentos de identidad han sido enviados y están siendo revisados
            por nuestro equipo. Recibirás una notificación cuando se complete la verificación.
          </p>
        </div>
      )}

      {estado === 'aprobado' && (
        <div
          className="animate-fade-in-up delay-2"
          style={{
            background: 'var(--bg-surface, #fff)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 14,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            {Icons.shieldCheck({ s: 24 })}
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#10B981', margin: '0 0 8px' }}>
            Identidad verificada
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--fg3)', maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
            Tu identidad ha sido verificada exitosamente. Ya puedes acceder a todas
            las funcionalidades de la plataforma.
          </p>
        </div>
      )}
    </div>
  )
}
