import React from 'react'
import { Icons } from './shared'

export interface EmptyStateProps {
  icon?: React.ReactNode | ((props?: { s?: number; color?: string }) => React.ReactNode)
  emoji?: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  action?: React.ReactNode
  style?: React.CSSProperties
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  emoji = '🌱',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  action,
  style,
}) => {
  return (
    <div
      className="animate-fade-in-up"
      style={{
        background: 'var(--bg-surface)',
        border: '1.5px dashed var(--border-color)',
        borderRadius: 20,
        padding: '44px 28px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 520,
        margin: '24px auto',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Visual icon badge */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'color-mix(in oklch, var(--primary) 10%, transparent)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
          fontSize: 28,
        }}
      >
        {icon ? (typeof icon === 'function' ? icon({ s: 30 }) : icon) : emoji}
      </div>

      {/* Text content */}
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 19,
          fontWeight: 700,
          color: 'var(--fg1)',
          margin: '0 0 8px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: 'var(--fg3)',
          margin: '0 0 24px',
          lineHeight: 1.55,
          maxWidth: 420,
        }}
      >
        {description}
      </p>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel || action) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="btn-primary"
              style={{
                padding: '10px 22px',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {actionLabel}
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="btn-secondary"
              style={{
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 10,
              }}
            >
              {secondaryActionLabel}
            </button>
          )}

          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
