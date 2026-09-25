import { useState, useRef, useEffect, type CSSProperties } from 'react'

export interface SelectOption<T = string | number> {
  value: T
  label: string
  icon?: string
}

export interface CustomSelectProps<T = string | number> {
  options: SelectOption<T>[]
  value: T
  onChange: (val: T) => void
  placeholder?: string
  style?: CSSProperties
  className?: string
  minWidth?: number | string
  placement?: 'auto' | 'up' | 'down'
}

export function CustomSelect<T extends string | number>({
  options,
  value,
  onChange,
  placeholder = 'Selecciona una opción',
  style,
  className = '',
  minWidth = 180,
  placement = 'auto',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.value === value)

  // Auto-detect whether to open upward or downward based on viewport space
  useEffect(() => {
    if (isOpen && containerRef.current) {
      if (placement === 'up') {
        setOpenUpward(true)
        return
      }
      if (placement === 'down') {
        setOpenUpward(false)
        return
      }
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      if (spaceBelow < 220 && rect.top > 200) {
        setOpenUpward(true)
      } else {
        setOpenUpward(false)
      }
    }
  }, [isOpen, placement])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        minWidth: minWidth,
        zIndex: isOpen ? 9999 : 1,
        ...style,
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          background: 'var(--bg-surface, #FFFFFF)',
          border: isOpen ? '1.5px solid var(--primary, #073B4C)' : '1.5px solid var(--border-color, #E2E8F0)',
          borderRadius: 'var(--radius-pill, 9999px)',
          padding: '6px 14px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--fg1, #073B4C)',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px var(--primary-subtle, rgba(7,59,76,0.15))' : '0 1px 2px rgba(7, 59, 76, 0.04)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption ? (
            <>
              {selectedOption.icon && <span style={{ marginRight: 6 }}>{selectedOption.icon}</span>}
              {selectedOption.label}
            </>
          ) : (
            placeholder
          )}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary, #073B4C)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? (openUpward ? 'rotate(0deg)' : 'rotate(180deg)') : (openUpward ? 'rotate(180deg)' : 'rotate(0deg)'),
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Custom Dropdown Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            ...(openUpward ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
            left: 0,
            minWidth: '100%',
            width: 'max-content',
            maxWidth: '280px',
            zIndex: 99999,
            background: 'var(--bg-surface, #FFFFFF)',
            border: '1px solid var(--border-color, #E2E8F0)',
            borderRadius: '14px',
            padding: '6px',
            boxShadow: '0 12px 30px -5px rgba(7, 59, 76, 0.2), 0 8px 12px -6px rgba(7, 59, 76, 0.12)',
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {options.map(opt => {
            const isSelected = opt.value === value
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSelected ? 'var(--primary-subtle, rgba(7,59,76,0.12))' : 'transparent',
                  color: isSelected ? 'var(--primary, #073B4C)' : 'var(--fg1, #073B4C)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  marginBottom: '2px',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'var(--bg-warm, #FFF9F2)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {opt.icon && <span style={{ marginRight: 6 }}>{opt.icon}</span>}
                  {opt.label}
                </span>
                {isSelected && (
                  <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
