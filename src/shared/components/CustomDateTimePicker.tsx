import React, { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Sparkles,
} from 'lucide-react'

export interface CustomDateTimePickerProps {
  value?: string // Formato standard HTML5: YYYY-MM-DDTHH:mm o ISO string
  onChange?: (val: string) => void
  min?: string
  max?: string
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  name?: string
  id?: string
  style?: CSSProperties
  className?: string
  borderRadius?: string | number
  accentColor?: string
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

export const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  value = '',
  onChange,
  min,
  max,
  placeholder = 'Selecciona fecha y hora...',
  label,
  required = false,
  disabled = false,
  name,
  id,
  style,
  className = '',
  borderRadius = 12,
  accentColor = '#20bd88',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 360 })
  const [mobileTab, setMobileTab] = useState<'fecha' | 'hora'>('fecha')

  // Parsear la fecha y hora actual recibida
  const parsedDateTime = useMemo(() => {
    if (!value) return null
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }, [value])

  // Estados de vista del calendario
  const [viewYear, setViewYear] = useState<number>(() =>
    parsedDateTime ? parsedDateTime.getFullYear() : new Date().getFullYear(),
  )
  const [viewMonth, setViewMonth] = useState<number>(() =>
    parsedDateTime ? parsedDateTime.getMonth() : new Date().getMonth(),
  )

  // Estado temporal de selección dentro del popover
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    parsedDateTime ? new Date(parsedDateTime) : new Date(),
  )
  const [selectedHour, setSelectedHour] = useState<number>(() =>
    parsedDateTime ? parsedDateTime.getHours() : 18,
  )
  const [selectedMinute, setSelectedMinute] = useState<number>(() =>
    parsedDateTime ? parsedDateTime.getMinutes() : 0,
  )

  // Sincronizar cuando el prop value cambia externamente
  useEffect(() => {
    if (parsedDateTime) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewYear(parsedDateTime.getFullYear())
      setViewMonth(parsedDateTime.getMonth())
      setSelectedDate(new Date(parsedDateTime))
      setSelectedHour(parsedDateTime.getHours())
      setSelectedMinute(parsedDateTime.getMinutes())
    }
  }, [parsedDateTime])

  // Calcular posición del popover respecto al contenedor disparador
  const updatePopoverPosition = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const isNarrow = typeof window !== 'undefined' && window.innerWidth < 420
    const popoverWidth = isNarrow ? Math.min(300, window.innerWidth - 24) : 365

    const measuredHeight = popoverRef.current?.offsetHeight || (isNarrow ? 290 : 260)
    const spaceBelow = window.innerHeight - rect.bottom - 10
    const spaceAbove = rect.top - 10

    let top: number
    // Si cabe abajo:
    if (spaceBelow >= measuredHeight) {
      top = rect.bottom + 6
    }
    // Si no cabe abajo pero sí arriba:
    else if (spaceAbove >= measuredHeight) {
      top = rect.top - measuredHeight - 6
    }
    // Si no cabe completo en ninguno, colocar donde haya más espacio SIN cubrir el input
    else if (spaceBelow >= spaceAbove) {
      top = rect.bottom + 6
    } else {
      top = Math.max(10, rect.top - measuredHeight - 6)
    }

    let left = rect.left
    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12
    }
    left = Math.max(12, left)

    setPopoverPos({ top, left, width: popoverWidth })
  }, [])

  useLayoutEffect(() => {
    if (isOpen) {
      updatePopoverPosition()
    }
  }, [isOpen, updatePopoverPosition])

  useEffect(() => {
    if (!isOpen) return
    updatePopoverPosition()
    const handleScrollOrResize = () => updatePopoverPosition()
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [isOpen, updatePopoverPosition])

  // Cerrar al dar click fuera o presionar escape
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Confirmar y emitir el valor final en formato estándar YYYY-MM-DDTHH:mm
  const emitChange = (d: Date, hour: number, minute: number) => {
    const y = d.getFullYear()
    const m = pad(d.getMonth() + 1)
    const day = pad(d.getDate())
    const h = pad(hour)
    const minStr = pad(minute)
    const formatted = `${y}-${m}-${day}T${h}:${minStr}`
    if (onChange) {
      onChange(formatted)
    }
  }

  const handleSelectDay = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day)
    setSelectedDate(newDate)
    emitChange(newDate, selectedHour, selectedMinute)
  }

  const handleHourChange = (newHour: number) => {
    setSelectedHour(newHour)
    emitChange(selectedDate, newHour, selectedMinute)
  }

  const handleMinuteChange = (newMinute: number) => {
    setSelectedMinute(newMinute)
    emitChange(selectedDate, selectedHour, newMinute)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onChange) onChange('')
  }

  // Navegación de meses
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

  // Días del mes a desplegar
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  // Día de la semana del primer día del mes (0 = Domingo -> queremos 0 = Lunes)
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth
  const todayDay = today.getDate()

  // Formateo para texto del botón disparador
  const displayText = useMemo(() => {
    if (!parsedDateTime) return ''
    try {
      const fechaTexto = parsedDateTime.toLocaleDateString('es-MX', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      const horaTexto = parsedDateTime.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      return `${fechaTexto} a las ${horaTexto}`
    } catch {
      return value
    }
  }, [parsedDateTime, value])

  // Horas 1-12 y AM/PM para el selector intuitivo
  const isPM = selectedHour >= 12
  const display12Hour = selectedHour % 12 === 0 ? 12 : selectedHour % 12

  const isNarrow = typeof window !== 'undefined' && window.innerWidth < 420

  const popoverContent = isOpen ? (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="true"
      aria-label="Selector de fecha y hora"
      style={{
        position: 'fixed',
        top: popoverPos.top,
        left: popoverPos.left,
        width: popoverPos.width,
        maxHeight: 'min(360px, calc(100vh - 20px))',
        overflowY: 'auto',
        zIndex: 2147483647,
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #cbd5e1',
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.06)',
        padding: '10px 12px',
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
        color: '#0f172a',
        animation: 'fadeIn 0.15s ease-out',
        boxSizing: 'border-box',
      }}
    >
      {/* Pestañas para pantallas muy estrechas (< 420px) */}
      {isNarrow && (
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: 8,
            padding: 2,
            marginBottom: 8,
          }}
        >
          <button
            type="button"
            onClick={() => setMobileTab('fecha')}
            style={{
              flex: 1,
              padding: '4px 0',
              borderRadius: 6,
              border: 'none',
              background: mobileTab === 'fecha' ? '#ffffff' : 'transparent',
              color: mobileTab === 'fecha' ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: 11.5,
              cursor: 'pointer',
              boxShadow: mobileTab === 'fecha' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Fecha
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('hora')}
            style={{
              flex: 1,
              padding: '4px 0',
              borderRadius: 6,
              border: 'none',
              background: mobileTab === 'hora' ? '#ffffff' : 'transparent',
              color: mobileTab === 'hora' ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: 11.5,
              cursor: 'pointer',
              boxShadow: mobileTab === 'hora' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Hora
          </button>
        </div>
      )}

      {/* Contenido principal en 2 columnas (side-by-side) en desktop/tablets */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'stretch',
        }}
      >
        {/* ── Columna Izquierda: Calendario ── */}
        {(!isNarrow || mobileTab === 'fecha') && (
          <div style={{ flex: '1 1 auto', minWidth: 200 }}>
            {/* Encabezado Mes / Año */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Mes anterior"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                <ChevronLeft size={14} />
              </button>

              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </div>

              <button
                type="button"
                onClick={nextMonth}
                aria-label="Mes siguiente"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Días de la semana */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                textAlign: 'center',
                gap: 1,
                marginBottom: 2,
              }}
            >
              {DAY_NAMES.map(d => (
                <span
                  key={d}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: '#94a3b8',
                    padding: '1px 0',
                  }}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Días del mes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 2,
              }}
            >
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNumber = i + 1
                const isSelected =
                  selectedDate &&
                  selectedDate.getDate() === dayNumber &&
                  selectedDate.getMonth() === viewMonth &&
                  selectedDate.getFullYear() === viewYear

                const isToday = isCurrentMonth && dayNumber === todayDay

                return (
                  <button
                    key={dayNumber}
                    type="button"
                    onClick={() => handleSelectDay(dayNumber)}
                    style={{
                      height: 25,
                      width: 25,
                      margin: '0 auto',
                      borderRadius: '50%',
                      border: isSelected ? 'none' : isToday ? `1.5px solid ${accentColor}` : 'none',
                      background: isSelected ? accentColor : 'transparent',
                      color: isSelected ? '#ffffff' : isToday ? accentColor : '#1e293b',
                      fontWeight: isSelected || isToday ? 800 : 600,
                      fontSize: 11.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.12s ease',
                      boxShadow: isSelected ? `0 2px 5px ${accentColor}40` : 'none',
                      padding: 0,
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.background = '#f1f5f9'
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {dayNumber}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Separador vertical en modo side-by-side */}
        {!isNarrow && (
          <div style={{ width: 1, background: '#f1f5f9', alignSelf: 'stretch' }} />
        )}

        {/* ── Columna Derecha: Selector de Hora y Atajos ── */}
        {(!isNarrow || mobileTab === 'hora') && (
          <div
            style={{
              width: isNarrow ? '100%' : 126,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Header de hora y AM/PM toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
                  <Clock size={12} color={accentColor} />
                  <span>Hora</span>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    background: '#f1f5f9',
                    borderRadius: 12,
                    padding: 1.5,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isPM) handleHourChange(selectedHour - 12)
                    }}
                    style={{
                      padding: '1px 6px',
                      borderRadius: 10,
                      border: 'none',
                      background: !isPM ? accentColor : 'transparent',
                      color: !isPM ? '#ffffff' : '#64748b',
                      fontSize: 10,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isPM) handleHourChange(selectedHour + 12)
                    }}
                    style={{
                      padding: '1px 6px',
                      borderRadius: 10,
                      border: 'none',
                      background: isPM ? accentColor : 'transparent',
                      color: isPM ? '#ffffff' : '#64748b',
                      fontSize: 10,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Selects de Hora y Minuto */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                <select
                  value={display12Hour}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10)
                    const finalHour = isPM ? (val === 12 ? 12 : val + 12) : val === 12 ? 0 : val
                    handleHourChange(finalHour)
                  }}
                  aria-label="Hora"
                  style={{
                    padding: '3px 4px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#0f172a',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const h = i + 1
                    return (
                      <option key={h} value={h}>
                        {pad(h)}
                      </option>
                    )
                  })}
                </select>

                <span style={{ fontWeight: 800, fontSize: 13, color: '#94a3b8' }}>:</span>

                <select
                  value={selectedMinute}
                  onChange={e => handleMinuteChange(parseInt(e.target.value, 10))}
                  aria-label="Minutos"
                  style={{
                    padding: '3px 4px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#0f172a',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                    <option key={m} value={m}>
                      {pad(m)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Atajos de hora rápida en cuadrícula compacta */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 4,
                }}
              >
                {[
                  { label: '09:00 AM', h: 9, m: 0 },
                  { label: '12:00 PM', h: 12, m: 0 },
                  { label: '04:00 PM', h: 16, m: 0 },
                  { label: '07:00 PM', h: 19, m: 0 },
                ].map(shortcut => {
                  const isCur = selectedHour === shortcut.h && selectedMinute === shortcut.m
                  return (
                    <button
                      key={shortcut.label}
                      type="button"
                      onClick={() => {
                        setSelectedHour(shortcut.h)
                        setSelectedMinute(shortcut.m)
                        emitChange(selectedDate, shortcut.h, shortcut.m)
                      }}
                      style={{
                        padding: '3px 2px',
                        borderRadius: 5,
                        background: isCur ? '#e8f8f2' : '#f8fafc',
                        border: isCur ? `1px solid ${accentColor}` : '1px solid #e2e8f0',
                        color: isCur ? accentColor : '#64748b',
                        fontSize: 9.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {shortcut.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Barra inferior de acciones ── */}
      <div
        style={{
          marginTop: 8,
          paddingTop: 6,
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          onClick={() => {
            const now = new Date()
            setSelectedDate(now)
            setSelectedHour(now.getHours())
            setSelectedMinute(0)
            setViewYear(now.getFullYear())
            setViewMonth(now.getMonth())
            emitChange(now, now.getHours(), 0)
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: accentColor,
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Sparkles size={11} /> Hoy y ahora
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={{
            padding: '4px 12px',
            borderRadius: 12,
            background: accentColor,
            color: '#ffffff',
            border: 'none',
            fontSize: 11.5,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: `0 2px 6px ${accentColor}40`,
          }}
        >
          <Check size={12} strokeWidth={3} /> Listo
        </button>
      </div>
    </div>
  ) : null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        ...style,
      }}
      className={className}
    >
      {label && (
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--fg1, #0f172a)',
            marginBottom: 6,
          }}
        >
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      {/* Disparador visual principal */}
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen(o => !o)
        }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '10px 14px',
          borderRadius,
          border: isOpen ? `1.5px solid ${accentColor}` : '1px solid var(--border-color, #cbd5e1)',
          background: 'var(--bg-surface, #ffffff)',
          color: displayText ? 'var(--fg1, #0f172a)' : 'var(--fg3, #94a3b8)',
          fontSize: 14,
          fontWeight: displayText ? 600 : 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: isOpen ? `0 0 0 3px ${accentColor}25` : 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxSizing: 'border-box',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: displayText ? '#e8f8f2' : '#f1f5f9',
              color: displayText ? accentColor : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CalendarIcon size={16} />
          </div>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayText || placeholder}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {displayText && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              title="Borrar fecha"
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={12} />
            </span>
          )}
          <Clock size={16} color={accentColor} />
        </div>
      </button>

      {/* Renderizado mediante createPortal para no ser afectado por overflow o transforms */}
      {typeof document !== 'undefined' && popoverContent && createPortal(popoverContent, document.body)}
    </div>
  )
}
