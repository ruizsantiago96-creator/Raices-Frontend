import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icons } from '@shared/components/shared'
import CvDocumentPreview, { printCvDocument, downloadCvFile } from './CvDocumentPreview'

export interface CvCandidateData {
  name?: string
  email?: string
  phone?: string
  location?: string
  jobTitle?: string
  coverLetter?: string
  skills?: string[]
  fileName?: string
  fileUrl?: string | null
}

export interface CvModalProps {
  isOpen: boolean
  onClose: () => void
  candidate: CvCandidateData | null
}

export default function CvModal({ isOpen, onClose, candidate }: CvModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !candidate) return null

  const name = candidate.name || 'Postulante'
  const jobTitle = candidate.jobTitle || 'Vacante'

  const handlePrint = () => {
    printCvDocument(candidate)
  }

  const handleDownload = () => {
    downloadCvFile(candidate)
  }

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3500,
        background: 'var(--modal-backdrop, rgba(15, 23, 42, 0.65))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Currículum Vitae de ${name}`}
        className="animate-scale-in"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 780,
          maxHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Header del Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            background: 'color-mix(in oklch, var(--bg-warm) 60%, var(--bg-surface))',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'color-mix(in oklch, var(--primary) 12%, transparent)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {Icons.fileText ? Icons.fileText({ s: 20 }) : '📄'}
            </div>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--fg1)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Currículum Vitae — {name}
              </h2>
              <div style={{ fontSize: 12.5, color: 'var(--fg3)', marginTop: 2 }}>
                Postulación para: <strong style={{ color: 'var(--fg2)' }}>{jobTitle}</strong>
              </div>
            </div>
          </div>

          {/* Acciones principales en cabecera */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: 'var(--bg-surface)',
                color: 'var(--fg1)',
                border: '1.5px solid var(--border-color)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
              }}
              title="Imprimir o guardar como PDF"
            >
              {Icons.printer ? Icons.printer({ s: 14 }) : '🖨️'} Imprimir / PDF
            </button>
            <button
              type="button"
              onClick={handleDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
              }}
              title="Descargar Currículum"
            >
              {Icons.download ? Icons.download({ s: 14 }) : '📥'} Descargar
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--fg3)',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 8,
              }}
            >
              {Icons.x({ s: 18 })}
            </button>
          </div>
        </div>

        {/* Cuerpo del Modal: Visor completo */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          <CvDocumentPreview
            name={candidate.name}
            email={candidate.email}
            phone={candidate.phone}
            location={candidate.location}
            jobTitle={candidate.jobTitle}
            coverLetter={candidate.coverLetter}
            skills={candidate.skills}
            fileName={candidate.fileName}
            fileUrl={candidate.fileUrl}
            onPrint={handlePrint}
            onDownload={handleDownload}
          />
        </div>

        {/* Footer con ayuda contextual */}
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-warm)',
            fontSize: 12,
            color: 'var(--fg3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span>
            💡 Puedes seleccionar <strong>&quot;Guardar como PDF&quot;</strong> en el diálogo de impresión para conservarlo en tu equipo.
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 12,
              padding: 0,
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

