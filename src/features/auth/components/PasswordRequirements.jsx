import React from 'react'
import { checkPasswordCriteria } from '../lib/passwordStrength'

export default function PasswordRequirements({ password = '' }) {
  if (!password) return null

  const { missing, isValid } = checkPasswordCriteria(password)

  // Si ya cumple con todos los caracteres requeridos, no mostramos nada
  if (isValid || missing.length === 0) return null

  return (
    <div
      style={{
        marginTop: 6,
        padding: '6px 10px',
        background: 'rgba(239, 68, 68, 0.06)',
        border: '1px solid rgba(239, 68, 68, 0.22)',
        borderRadius: 6,
        fontSize: 11.5,
        color: '#b91c1c',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4px 6px',
        lineHeight: 1.4,
      }}
      aria-live="polite"
    >
      <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        ⚠️ Te falta:
      </span>
      {missing.map(m => (
        <span
          key={m.id}
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            padding: '2px 7px',
            borderRadius: 4,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {m.missingText}
        </span>
      ))}
    </div>
  )
}
