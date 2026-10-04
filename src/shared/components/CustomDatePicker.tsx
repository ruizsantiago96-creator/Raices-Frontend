import React, { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

export interface CustomDatePickerProps {
  value?: string // YYYY-MM-DD
  onChange?: (val: string) => void
  min?: string // YYYY-MM-DD
  max?: string // YYYY-MM-DD
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  name?: string
  id?: string
  style?: CSSProperties
  className?: string
  borderRadius?: string | number
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const MONTH_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

type CalendarViewMode = 'days' | 'months' | 'years'

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value = '',
  onChange,
  min,
  max,
  placeholder = 'DD/MM/AAAA',
  label,
  required = false,
  disabled = false,
  name,
  id,
  style,
  className = '',
  borderRadius = 10,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<CalendarViewMode>('days')
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 320 })
  const [srAnnouncement, setSrAnnouncement] = useState<string>('')

  // Text input value (DD/MM/AAAA format for display & manual typing)
  const [inputText, setInputText] = useState<string>(() => {
    if (!value || isNaN(Date.parse(value))) return ''
    const parts = value.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return ''
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const calendarBtnRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const yearListRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Parse current selected date or fallback to today
  const parsedValue = useMemo(() => {
    return value && !isNaN(Date.parse(value)) ? new Date(value + 'T00:00:00') : null
  }, [value])

  // View state for month & year in visual calendar
  const [viewYear, setViewYear] = useState<number>(() => {
    if (parsedValue) return parsedValue.getFullYear()
    const nowYear = new Date().getFullYear()
    if (max) {
      const maxY = new Date(max + 'T00:00:00').getFullYear()
      if (maxY <= nowYear) return Math.min(nowYear - 15, maxY)
    }
    return nowYear
  })

  const [viewMonth, setViewMonth] = useState<number>(() => {
    if (parsedValue) return parsedValue.getMonth()
    return new Date().getMonth()
  })

  // Position popover relative to trigger container
  const updatePopoverPosition = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const popoverHeight = 350
    const popoverWidth = Math.max(rect.width, 310)

    const spaceBelow = window.innerHeight - rect.bottom
    let top = rect.bottom + 6

    if (spaceBelow < popoverHeight && rect.top > popoverHeight) {
      top = rect.top - popoverHeight - 6
    }

    top = Math.max(16, Math.min(top, window.innerHeight - popoverHeight - 16))

    let left = rect.left
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16
    }
    left = Math.max(16, left)

    setPopoverPos({ top, left, width: popoverWidth })
  }, [])

  // Keep inputText and view state in sync when value changes externally
  useEffect(() => {
    if (parsedValue) {
      const dayStr = String(parsedValue.getDate()).padStart(2, '0')
      const monthStr = String(parsedValue.getMonth() + 1).padStart(2, '0')
      const yearStr = parsedValue.getFullYear()
      const formattedDDMMYYYY = `${dayStr}/${monthStr}/${yearStr}`
      setInputText(formattedDDMMYYYY)
      setViewYear(parsedValue.getFullYear())
      setViewMonth(parsedValue.getMonth())
    } else if (!value) {
      setInputText('')
    }
  }, [value, parsedValue])

  // Reset viewMode when opened
  useEffect(() => {
    if (isOpen) {
      setViewMode('days')
      updatePopoverPosition()
    }
  }, [isOpen, updatePopoverPosition])

  useEffect(() => {
    if (!isOpen) return
    const handleScrollOrResize = () => updatePopoverPosition()
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [isOpen, updatePopoverPosition])

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Scroll selected year into view in year view mode
  useEffect(() => {
    if (viewMode === 'years' && yearListRef.current) {
      const selectedYearBtn = yearListRef.current.querySelector('[data-selected-year="true"]')
      if (selectedYearBtn) {
        selectedYearBtn.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }, [viewMode])

  // Year range
  const currentYear = new Date().getFullYear()
  const minYear = min ? new Date(min + 'T00:00:00').getFullYear() : 1920
  const maxYear = max ? new Date(max + 'T00:00:00').getFullYear() : currentYear + 10

  const years: number[] = []
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y)
  }

  // Format date for screen reader announcement
  const getAnnouncementText = (year: number, month: number, day: number) => {
    const monthName = MONTH_NAMES[month]
    return `Fecha seleccionada: ${day} de ${monthName.toLowerCase()} de ${year}`
  }

  // Helper to commit date in YYYY-MM-DD format
  const commitDate = (year: number, month: number, day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0')
    const formattedDay = String(day).padStart(2, '0')
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`

    if (min && dateStr < min) return false
    if (max && dateStr > max) return false

    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = dateStr
    }

    const dayStr = String(day).padStart(2, '0')
    setInputText(`${dayStr}/${formattedMonth}/${year}`)
    const announcement = getAnnouncementText(year, month, day)
    setSrAnnouncement(announcement)
    onChange?.(dateStr)
    return true
  }

  // Direct manual text typing handler with auto-slash formatting (DD/MM/AAAA)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    // Allow digits and slashes
    const cleanedDigits = rawValue.replace(/[^0-9]/g, '')

    let formatted = ''
    if (cleanedDigits.length <= 2) {
      formatted = cleanedDigits
    } else if (cleanedDigits.length <= 4) {
      formatted = `${cleanedDigits.slice(0, 2)}/${cleanedDigits.slice(2)}`
    } else {
      formatted = `${cleanedDigits.slice(0, 2)}/${cleanedDigits.slice(2, 4)}/${cleanedDigits.slice(4, 8)}`
    }

    setInputText(formatted)

    // Validate if 8 digits typed (DD/MM/YYYY)
    if (cleanedDigits.length === 8) {
      const day = parseInt(cleanedDigits.slice(0, 2), 10)
      const month = parseInt(cleanedDigits.slice(2, 4), 10) - 1
      const year = parseInt(cleanedDigits.slice(4, 8), 10)

      if (month >= 0 && month <= 11 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
        const testDate = new Date(year, month, day)
        if (
          testDate.getFullYear() === year &&
          testDate.getMonth() === month &&
          testDate.getDate() === day
        ) {
          commitDate(year, month, day)
          return
        }
      }
    }

    if (formatted === '') {
      onChange?.('')
    }
  }

  // Days grid calculation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  const daysGrid: ({ day: number; month: number; year: number; isCurrentMonth: boolean })[] = []

  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    daysGrid.push({
      day: prevMonthDays - i,
      month: viewMonth === 0 ? 11 : viewMonth - 1,
      year: viewMonth === 0 ? viewYear - 1 : viewYear,
      isCurrentMonth: false,
    })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
    })
  }

  const remainingCells = 42 - daysGrid.length
  for (let d = 1; d <= remainingCells; d++) {
    daysGrid.push({
      day: d,
      month: viewMonth === 11 ? 0 : viewMonth + 1,
      year: viewMonth === 11 ? viewYear + 1 : viewYear,
      isCurrentMonth: false,
    })
  }

  const isDateDisabled = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (min && dateStr < min) return true
    if (max && dateStr > max) return true
    return false
  }

  const isSelected = (year: number, month: number, day: number) => {
    if (!parsedValue) return false
    return (
      parsedValue.getFullYear() === year &&
      parsedValue.getMonth() === month &&
      parsedValue.getDate() === day
    )
  }

  const today = new Date()
  const isToday = (year: number, month: number, day: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    )
  }

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`custom-datepicker-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Hidden native input for form compatibility */}
      <input
        ref={hiddenInputRef}
        type="date"
        id={id}
        name={name}
        value={value}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 0,
          height: 0,
        }}
        tabIndex={-1}
      />

      {/* Screen Reader Live Announcement */}
      <div role="status" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
        {srAnnouncement}
      </div>

      {/* Accessible Input Field with Direct Text Typing + Calendar Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-surface, #FFFFFF)',
          border: isOpen ? '1.5px solid var(--primary, #073B4C)' : '1.5px solid var(--border-color, #E2E8F0)',
          borderRadius: borderRadius,
          padding: '2px 6px 2px 14px',
          minHeight: 44,
          boxSizing: 'border-box',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 0 3px var(--primary-subtle, rgba(7, 59, 76, 0.15))' : 'none',
        }}
      >
        {/* Direct Manual Text Input (DD/MM/AAAA) for Screen Readers and Typing */}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9/]*"
          value={inputText}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-label={label || "Fecha en formato día, mes y año (DD/MM/AAAA)"}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: '14.5px',
            fontFamily: 'var(--font-body, sans-serif)',
            fontWeight: inputText ? 600 : 400,
            color: 'var(--fg1, #073B4C)',
            outline: 'none',
            minWidth: 0,
          }}
        />

        {/* Clear Button */}
        {inputText && !disabled && (
          <button
            type="button"
            onClick={() => {
              setInputText('')
              onChange?.('')
              inputRef.current?.focus()
            }}
            aria-label="Limpiar fecha"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--fg3, #94A3B8)',
              cursor: 'pointer',
              fontSize: 14,
              padding: '6px 8px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        )}

        {/* Visual Calendar Toggle Button */}
        <button
          ref={calendarBtnRef}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(prev => !prev)}
          aria-label={isOpen ? "Cerrar calendario visual" : "Abrir calendario visual"}
          aria-expanded={isOpen}
          title="Abrir calendario visual"
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 6,
            padding: '6px 8px',
            fontSize: 15,
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'var(--primary, #073B4C)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>🗓️</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Visual Calendar Popover (Portal Attached to Body) */}
      {isOpen && createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Calendario visual de selección de fecha"
          style={{
            position: 'fixed',
            top: popoverPos.top,
            left: popoverPos.left,
            width: popoverPos.width,
            minWidth: 300,
            maxWidth: 340,
            background: 'var(--bg-surface, #FFFFFF)',
            border: '1px solid var(--border-color, #E2E8F0)',
            borderRadius: 16,
            boxShadow: '0 18px 48px rgba(0, 0, 0, 0.22)',
            padding: 16,
            boxSizing: 'border-box',
            zIndex: 999999,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Mes anterior"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1px solid var(--border-color, #E2E8F0)',
                background: 'var(--bg-warm, #FFF9F2)',
                color: 'var(--fg1, #073B4C)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              ‹
            </button>

            {/* Prominent Header View Mode Toggles */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setViewMode(v => v === 'months' ? 'days' : 'months')}
                aria-label={`Mes actual: ${MONTH_NAMES[viewMonth]}. Haz clic para cambiar mes.`}
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  border: viewMode === 'months' ? '1.5px solid var(--primary)' : '1px solid var(--border-color, #E2E8F0)',
                  background: viewMode === 'months' ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                  color: 'var(--fg1, #073B4C)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{MONTH_NAMES[viewMonth]}</span>
                <span style={{ fontSize: 10, opacity: 0.6 }}>▼</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode(v => v === 'years' ? 'days' : 'years')}
                aria-label={`Año actual: ${viewYear}. Haz clic para seleccionar año.`}
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  border: viewMode === 'years' ? '1.5px solid var(--primary)' : '1px solid var(--border-color, #E2E8F0)',
                  background: viewMode === 'years' ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                  color: 'var(--fg1, #073B4C)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{viewYear}</span>
                <span style={{ fontSize: 10, opacity: 0.6 }}>▼</span>
              </button>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              aria-label="Siguiente mes"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1px solid var(--border-color, #E2E8F0)',
                background: 'var(--bg-warm, #FFF9F2)',
                color: 'var(--fg1, #073B4C)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              ›
            </button>
          </div>

          {/* VIEW MODE: MONTHS GRID */}
          {viewMode === 'months' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase' }}>
                Selecciona un mes ({viewYear})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '4px 0 8px' }}>
                {MONTH_NAMES.map((mName, idx) => {
                  const isSelectedMonth = idx === viewMonth
                  return (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => {
                        setViewMonth(idx)
                        setViewMode('days')
                      }}
                      style={{
                        padding: '10px 6px',
                        borderRadius: 10,
                        border: isSelectedMonth ? 'none' : '1px solid var(--border-color, #E2E8F0)',
                        background: isSelectedMonth ? 'var(--primary, #073B4C)' : 'var(--bg-surface, #FFFFFF)',
                        color: isSelectedMonth ? '#FFFFFF' : 'var(--fg1, #073B4C)',
                        fontWeight: isSelectedMonth ? 700 : 500,
                        fontSize: 13,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {MONTH_SHORT[idx]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE: YEARS GRID */}
          {viewMode === 'years' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase' }}>
                Selecciona año de nacimiento
              </div>
              <div
                ref={yearListRef}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  maxHeight: 220,
                  overflowY: 'auto',
                  padding: '4px 4px 8px',
                }}
              >
                {years.map(y => {
                  const isSelectedYear = y === viewYear
                  return (
                    <button
                      key={y}
                      type="button"
                      data-selected-year={isSelectedYear}
                      onClick={() => {
                        setViewYear(y)
                        setViewMode('days')
                      }}
                      style={{
                        padding: '8px 4px',
                        borderRadius: 10,
                        border: isSelectedYear ? 'none' : '1px solid var(--border-color, #E2E8F0)',
                        background: isSelectedYear ? 'var(--primary, #073B4C)' : 'var(--bg-surface, #FFFFFF)',
                        color: isSelectedYear ? '#FFFFFF' : 'var(--fg1, #073B4C)',
                        fontWeight: isSelectedYear ? 700 : 500,
                        fontSize: 13,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {y}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE: DAYS GRID (DEFAULT) */}
          {viewMode === 'days' && (
            <>
              {/* Day of week headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 6 }}>
                {DAY_NAMES.map(d => (
                  <span key={d} style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3, #94A3B8)', textTransform: 'uppercase' }}>
                    {d}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {daysGrid.map((item, index) => {
                  const disabledDay = isDateDisabled(item.year, item.month, item.day)
                  const selectedDay = isSelected(item.year, item.month, item.day)
                  const todayDay = isToday(item.year, item.month, item.day)

                  return (
                    <button
                      key={`${item.year}-${item.month}-${item.day}-${index}`}
                      type="button"
                      disabled={disabledDay}
                      onClick={() => {
                        if (!disabledDay) {
                          commitDate(item.year, item.month, item.day)
                          setIsOpen(false)
                        }
                      }}
                      aria-label={`${item.day} de ${MONTH_NAMES[item.month]} de ${item.year}${selectedDay ? ', seleccionado' : ''}${disabledDay ? ', no disponible' : ''}`}
                      style={{
                        height: 36,
                        borderRadius: 8,
                        border: todayDay && !selectedDay ? '1.5px solid var(--primary)' : 'none',
                        background: selectedDay
                          ? 'var(--primary, #073B4C)'
                          : 'transparent',
                        color: selectedDay
                          ? '#FFFFFF'
                          : !item.isCurrentMonth
                          ? 'var(--fg3, #CBD5E1)'
                          : disabledDay
                          ? 'var(--border-strong, #CBD5E1)'
                          : 'var(--fg1, #073B4C)',
                        fontWeight: selectedDay || todayDay ? 700 : 500,
                        fontSize: 13.5,
                        cursor: disabledDay ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: disabledDay ? 0.3 : 1,
                      }}
                    >
                      {item.day}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-color, #E2E8F0)' }}>
            <button
              type="button"
              onClick={() => {
                const now = new Date()
                commitDate(now.getFullYear(), now.getMonth(), now.getDate())
                setIsOpen(false)
              }}
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: 'var(--primary, #073B4C)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 6,
              }}
            >
              Hoy
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  setInputText('')
                  onChange?.('')
                  setIsOpen(false)
                }}
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'var(--fg3, #94A3B8)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 6,
                }}
              >
                Borrar
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default CustomDatePicker
