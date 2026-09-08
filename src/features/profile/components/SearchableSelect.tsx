import React, { useState, useRef, useEffect } from 'react'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'

function normalizeText(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export interface SearchableSelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  disabled?: boolean
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // When closed, show the selected value; when open, show user's search
  const displayValue = isOpen ? userSearch : (value || '')
  const normSearch = normalizeText(displayValue)
  const filteredOptions = options.filter((opt) =>
    normalizeText(opt).includes(normSearch)
  )

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flex: 1,
      }}
    >
      {label && <label style={labelStyle}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          style={{ ...inputStyle, paddingRight: 32 }}
          value={displayValue}
          onChange={(e) => {
            setUserSearch(e.target.value)
            setIsOpen(true)
            if (!e.target.value) onChange('')
          }}
          onFocus={() => {
            if (!disabled) {
              setUserSearch(value || '')
              setIsOpen(true)
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
        />
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--fg3)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {Icons.chevronDown ? Icons.chevronDown({ s: 15 }) : '▼'}
        </div>
      </div>

      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            maxHeight: 180,
            overflowY: 'auto',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            boxShadow: 'var(--shadow-md)',
            zIndex: 1010,
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt)
                  setUserSearch(opt)
                  setIsOpen(false)
                }}
                style={{
                  padding: '8px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                  color: opt === value ? 'var(--primary)' : 'var(--fg1)',
                  fontWeight: opt === value ? 600 : 400,
                  background:
                    opt === value
                      ? 'color-mix(in oklch, var(--primary) 8%, transparent)'
                      : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (opt !== value)
                    e.currentTarget.style.background = 'var(--bg-warm)'
                }}
                onMouseLeave={(e) => {
                  if (opt !== value)
                    e.currentTarget.style.background = 'transparent'
                }}
              >
                {opt}
              </div>
            ))
          ) : (
            <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--fg3)' }}>
              No se encontraron opciones
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchableSelect
