import { useState, useMemo } from 'react'
import { Icons } from '@shared/components/shared'
import {
  CATALOGO_DIAGNOSTICOS_OMS,
  mapWizardConditionsToCategories,
  type DiagnosticoEstandarizado,
} from '../constants/diagnosticosEstandarizados'

interface StandardizedDiagnosisPickerProps {
  value: string
  onChange: (newValue: string) => void
  selectedConditions?: string[]
  selectedNeuro?: string[]
}

function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

const CATEGORY_LABELS: Record<string, string> = {
  neurodivergencia: 'Neurodivergencia',
  motriz: 'Motriz / Física',
  intelectual: 'Intelectual / Cognitiva',
  visual: 'Visual',
  auditiva: 'Auditiva',
  habla: 'Habla y lenguaje',
  psicosocial: 'Psicosocial',
}

export default function StandardizedDiagnosisPicker({
  value,
  onChange,
  selectedConditions = [],
  selectedNeuro = [],
}: StandardizedDiagnosisPickerProps) {
  const [query, setQuery] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customText, setCustomText] = useState('')

  // Parse current string into array of selected diagnosis labels
  const selectedList = useMemo(() => {
    if (!value || !value.trim()) return []
    return value
      .split(' · ')
      .map(s => s.replace(/\s*\[CIE-[^\]]+\]/g, '').trim())
      .filter(Boolean)
  }, [value])

  const activeCategories = useMemo(
    () => mapWizardConditionsToCategories(selectedConditions),
    [selectedConditions]
  )

  const filteredDiagnoses = useMemo(() => {
    const q = normalizeSearch(query)

    // Filter by search query if typed
    if (q.length > 0) {
      return CATALOGO_DIAGNOSTICOS_OMS.filter(item => {
        const matchNombre = normalizeSearch(item.nombre).includes(q)
        const matchCodigo = normalizeSearch(item.codigoOms).includes(q)
        const matchSinonimo = item.sinonimos.some(s => normalizeSearch(s).includes(q))
        return matchNombre || matchCodigo || matchSinonimo
      })
    }

    // Otherwise prioritize items matching the user's selected conditions & neurodivergencias
    if (activeCategories.length > 0 || selectedNeuro.length > 0) {
      const matched = CATALOGO_DIAGNOSTICOS_OMS.filter(item => {
        if (selectedNeuro.length > 0 && item.subcategoriaNeuro) {
          if (selectedNeuro.includes(item.subcategoriaNeuro)) return true
        }
        if (activeCategories.includes(item.categoria)) {
          if (item.categoria === 'neurodivergencia' && selectedNeuro.length > 0 && !selectedNeuro.includes('Otro')) {
            return Boolean(item.subcategoriaNeuro && selectedNeuro.includes(item.subcategoriaNeuro))
          }
          return true
        }
        return false
      })
      if (matched.length > 0) return matched
    }

    return CATALOGO_DIAGNOSTICOS_OMS.slice(0, 12)
  }, [query, activeCategories, selectedNeuro])

  const formatEntry = (item: DiagnosticoEstandarizado) => item.nombre

  const isItemSelected = (item: DiagnosticoEstandarizado) => {
    const formatted = formatEntry(item)
    return selectedList.some(s => s === formatted || s === item.nombre || s.startsWith(item.nombre))
  }

  const toggleItem = (item: DiagnosticoEstandarizado) => {
    const formatted = formatEntry(item)
    const exists = isItemSelected(item)
    let next: string[]
    if (exists) {
      next = selectedList.filter(s => s !== formatted && s !== item.nombre && !s.startsWith(item.nombre))
    } else {
      next = [...selectedList, formatted]
    }
    onChange(next.join(' · '))
  }

  const removeEntry = (entry: string) => {
    const next = selectedList.filter(s => s !== entry)
    onChange(next.join(' · '))
  }

  const handleAddCustom = () => {
    const trimmed = customText.trim()
    if (!trimmed) return
    if (!selectedList.includes(trimmed)) {
      onChange([...selectedList, trimmed].join(' · '))
    }
    setCustomText('')
    setShowCustomInput(false)
  }

  const ACCENT_GREEN = '#229B58'
  const ACCENT_GREEN_BG = 'color-mix(in oklch, #229B58 8%, var(--bg-surface))'
  const ACCENT_GREEN_SHADOW = '0 4px 12px color-mix(in oklch, #229B58 12%, transparent)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Chips seleccionados */}
      {selectedList.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {selectedList.map(entry => (
            <div
              key={entry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 12px',
                borderRadius: 10,
                background: ACCENT_GREEN_BG,
                border: `1.5px solid ${ACCENT_GREEN}`,
                boxShadow: ACCENT_GREEN_SHADOW,
                color: 'var(--fg1)',
                fontSize: 12.5,
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              <span>{entry}</span>
              <button
                type="button"
                onClick={() => removeEntry(entry)}
                aria-label={`Quitar ${entry}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: ACCENT_GREEN,
                  padding: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  fontWeight: 800,
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Buscador CIE-11 / CIE-10 */}
      <div style={{ position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            left: 13,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--fg3)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          {Icons.search ? Icons.search({ s: 16 }) : '🔍'}
        </span>
        <input
          type="text"
          className="auth-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar diagnóstico (ej. Autismo, Síndrome de Down, Parálisis cerebral)..."
          style={{
            paddingLeft: 38,
            paddingRight: query ? 34 : 14,
            fontSize: 13.5,
            borderRadius: 12,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Limpiar búsqueda"
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--fg3)',
              fontSize: 16,
              padding: 4,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Lista de opciones estandarizadas */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxHeight: 240,
          overflowY: 'auto',
          padding: 6,
          borderRadius: 14,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)', padding: '4px 8px 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {query.trim()
            ? `Diagnósticos encontrados (${filteredDiagnoses.length})`
            : activeCategories.length > 0
              ? 'Diagnósticos sugeridos según tu condición'
              : 'Diagnósticos frecuentes'}
        </div>

        {filteredDiagnoses.length === 0 ? (
          <div style={{ padding: '12px 10px', fontSize: 13, color: 'var(--fg3)', textAlign: 'center' }}>
            No se encontraron coincidencias en el catálogo para "{query}". Puedes agregarlo manualmente abajo.
          </div>
        ) : (
          filteredDiagnoses.map(item => {
            const active = isItemSelected(item)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: active ? `1.5px solid ${ACCENT_GREEN}` : '1px solid var(--border-color)',
                  background: active ? ACCENT_GREEN_BG : 'var(--bg-surface)',
                  boxShadow: active ? ACCENT_GREEN_SHADOW : 'var(--shadow-sm)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.18s ease-in-out',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: active ? 700 : 600, color: 'var(--fg1)', lineHeight: 1.35 }}>
                    {item.nombre}
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg3)', marginTop: 2 }}>
                    {CATEGORY_LABELS[item.categoria] || item.categoria}
                  </div>
                </div>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: `1.5px solid ${active ? ACCENT_GREEN : 'var(--border-color)'}`,
                    background: active ? ACCENT_GREEN : 'transparent',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {active && (Icons.check ? Icons.check({ s: 12 }) : '✓')}
                </span>
              </button>
            )
          })
        )}
      </div>

      {/* Opción para diagnóstico poco frecuente no listado */}
      {!showCustomInput ? (
        <button
          type="button"
          onClick={() => setShowCustomInput(true)}
          style={{
            alignSelf: 'flex-start',
            background: 'none',
            border: 'none',
            padding: '2px 4px',
            fontSize: 12,
            fontWeight: 600,
            color: ACCENT_GREEN,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            textDecoration: 'underline',
          }}
        >
          + Mi diagnóstico específico no aparece en la lista
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            className="auth-input"
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddCustom()
              }
            }}
            placeholder="Escribe el nombre del síndrome o diagnóstico..."
            style={{
              flex: 1,
              fontSize: 13,
              padding: '9px 12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
          <button
            type="button"
            onClick={handleAddCustom}
            style={{
              padding: '9px 14px',
              borderRadius: 10,
              border: 'none',
              background: ACCENT_GREEN,
              color: 'white',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
            }}
          >
            Agregar
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(false)
              setCustomText('')
            }}
            style={{
              padding: '9px 10px',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--fg2)',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Cancelar
          </button>
        </div>
      )}
      <div style={{ fontSize: 11.5, color: 'var(--fg3)', lineHeight: 1.4 }}>
        Información compartida por ti para conectarte con especialistas y apoyos afines. Raíces no emite diagnósticos médicos.
      </div>
    </div>
  )
}

