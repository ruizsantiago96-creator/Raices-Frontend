import { useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore } from '@features/auth'
import { useEstadoValidacion, useSubirDocumentoIdentidad } from '../hooks/useDocumentoIdentidad'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE_MB = 10

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

function DocumentUploader({ tipo, numeroCurp, onUploaded, isUploaded }) {
  const { addToast } = useUiStore()
  const qc = useQueryClient()
  const uploadDoc = useSubirDocumentoIdentidad()
  const isUploading = uploadDoc.isPending
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const tipoLabel = tipo === 'curp' ? 'CURP' : 'Identificación oficial'
  const accepted = 'image/jpeg,image/png,image/webp,application/pdf'

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      addToast(`Formato no permitido. Usa JPEG, PNG, WebP o PDF.`, 'error')
      e.target.value = ''
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      addToast(`El archivo supera ${MAX_SIZE_MB} MB.`, 'error')
      e.target.value = ''
      return
    }

    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    try {
      await uploadDoc.mutateAsync({
        tipo,
        file: selectedFile,
        numeroCurp: tipo === 'curp' ? numeroCurp : undefined,
      })
      addToast(`${tipoLabel} subido correctamente`, 'success')
      setSelectedFile(null)
      setPreviewUrl(null)
      qc.invalidateQueries({ queryKey: ['documento-identidad'] })
      onUploaded?.()
    } catch (err) {
      addToast(err.response?.data?.message ?? `Error al subir ${tipoLabel}`, 'error')
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (isUploaded) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 10, fontSize: 13, color: '#10B981', fontWeight: 600,
      }}>
        {Icons.check({ s: 16 })}
        <span>{tipoLabel} subido</span>
      </div>
    )
  }

  return (
    <div style={{
      border: '2px dashed var(--border-color)', borderRadius: 12, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 12, transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: 'var(--primary-subtle, rgba(99,102,241,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {Icons.upload({ s: 16 })}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)' }}>{tipoLabel}</div>
          <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
            JPEG, PNG, WebP o PDF — máx. {MAX_SIZE_MB} MB
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accepted}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        aria-label={`Seleccionar archivo de ${tipoLabel}`}
      />

      {selectedFile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {previewUrl ? (
            <div style={{ position: 'relative' }}>
              <img
                src={previewUrl}
                alt={`Vista previa de ${tipoLabel}`}
                style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--border-color)' }}
              />
              <button
                onClick={handleClear}
                style={{
                  position: 'absolute', top: 6, right: 6, width: 24, height: 24,
                  borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Eliminar selección"
              >
                {Icons.x({ s: 12 })}
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              background: 'var(--bg-warm, #f8fafc)', borderRadius: 8,
            }}>
              <span style={{ fontSize: 13, color: 'var(--fg1)', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedFile.name}
              </span>
              <span style={{ fontSize: 11, color: 'var(--fg3)' }}>
                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <button onClick={handleClear} style={{
                background: 'none', border: 'none', color: 'var(--fg3)', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }} aria-label="Eliminar selección">
                {Icons.x({ s: 14 })}
              </button>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={isUploading}
            style={{
              padding: '10px 20px', background: 'var(--primary, #6366f1)', border: 'none',
              color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: isUploading ? 0.7 : 1,
            }}
          >
            {isUploading ? (
              <>
                <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Subiendo...
              </>
            ) : (
              <>
                {Icons.upload({ s: 14 })}
                Subir {tipoLabel}
              </>
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '10px 16px', background: 'transparent', border: '1px solid var(--border-color)',
            borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            color: 'var(--fg1)', fontFamily: 'var(--font-body)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-warm, #f8fafc)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {Icons.upload({ s: 14 })}
          Seleccionar archivo
        </button>
      )}
    </div>
  )
}

export default function MiIdentidadPage() {
  const { data: status, isLoading, isError } = useEstadoValidacion()
  const [curpNumber, setCurpNumber] = useState('')
  const { logout } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = tabParam === 'seguridad' ? 'seguridad' : 'verificacion'

  const estado = status?.estado ?? 'sin_documentos'
  const config = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.sin_documentos
  const StatusIcon = config.icon

  return (
    <main id="main" className="responsive-main" style={{ '--main-max-width': '720px' }}>
      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', padding: '0 20px 48px' }}>

        {/* Header */}
        <div className="animate-fade-in-up" style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
            Configuración
          </h1>
          {activeTab === 'verificacion' && (
            <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>
              Sube tu CURP e identificación oficial para verificar tu cuenta
            </p>
          )}
        </div>

        {/* Tab switcher */}
        <div className="animate-fade-in-up" style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(0, 0, 0, 0.04)', padding: 4, borderRadius: 12, width: 'fit-content' }}>
          <button
            onClick={() => setSearchParams({ tab: 'verificacion' })}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'verificacion' ? 'var(--bg-surface, #fff)' : 'transparent',
              color: activeTab === 'verificacion' ? 'var(--fg1)' : 'var(--fg3)',
              boxShadow: activeTab === 'verificacion' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            {Icons.shieldCheck({ s: 15 })}
            Verificación de identidad
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'seguridad' })}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'seguridad' ? 'var(--bg-surface, #fff)' : 'transparent',
              color: activeTab === 'seguridad' ? 'var(--fg1)' : 'var(--fg3)',
              boxShadow: activeTab === 'seguridad' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            {Icons.sliders({ s: 15 })}
            Seguridad
          </button>
        </div>

        {activeTab === 'verificacion' && (
          isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  height: 120, borderRadius: 12, background: 'var(--border-color)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>
          ) : isError ? (
            <div style={{
              background: 'var(--bg-surface, #fff)', border: '1px solid var(--border-color)',
              borderRadius: 14, padding: 32, textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 8 }}>
                No se pudo cargar el estado de tu identidad
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg3)' }}>
                Intenta recargar la página.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Status Card */}
              <div className="animate-fade-in-up delay-1" style={{
                background: 'var(--bg-surface, #fff)', border: '1px solid var(--border-color)',
                borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, background: config.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <StatusIcon s={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg1)' }}>
                        Estado de verificación
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
                        background: config.bg, color: config.color, textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        {config.label}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '2px 0 0' }}>
                      {config.description}
                    </p>
                  </div>
                </div>

                {/* Status details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div style={{
                    padding: '10px 14px', background: 'var(--bg-warm, #f8fafc)',
                    borderRadius: 8, fontSize: 13,
                  }}>
                    <div style={{ color: 'var(--fg3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      CURP
                    </div>
                    <div style={{ color: status?.tieneCurp ? 'var(--fg1)' : 'var(--fg3)', fontWeight: 600 }}>
                      {status?.tieneCurp ? '✓ Subido' : 'No subido'}
                    </div>
                  </div>
                  <div style={{
                    padding: '10px 14px', background: 'var(--bg-warm, #f8fafc)',
                    borderRadius: 8, fontSize: 13,
                  }}>
                    <div style={{ color: 'var(--fg3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      Identificación oficial 
                    </div>
                    <div style={{ color: status?.tieneIdentificacion ? 'var(--fg1)' : 'var(--fg3)', fontWeight: 600 }}>
                      {status?.tieneIdentificacion ? '✓ Subido' : 'No subido'}
                    </div>
                  </div>
                  {status?.numeroCurp && (
                    <div style={{
                      padding: '10px 14px', background: 'var(--bg-warm, #f8fafc)',
                      borderRadius: 8, fontSize: 13,
                    }}>
                      <div style={{ color: 'var(--fg3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                        CURP declarada
                      </div>
                      <div style={{ color: 'var(--fg1)', fontWeight: 600, fontFamily: 'monospace', fontSize: 12.5, wordBreak: 'break-all' }}>
                        {status.numeroCurp}
                      </div>
                    </div>
                  )}
                  {status?.fechaSubida && (
                    <div style={{
                      padding: '10px 14px', background: 'var(--bg-warm, #f8fafc)',
                      borderRadius: 8, fontSize: 13,
                    }}>
                      <div style={{ color: 'var(--fg3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                        Última subida
                      </div>
                      <div style={{ color: 'var(--fg1)', fontWeight: 600 }}>
                        {new Date(status.fechaSubida).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rejection reason */}
                {estado === 'rechazado' && status?.motivoRechazo && (
                  <div style={{
                    marginTop: 16, padding: '14px 16px',
                    background: 'rgba(220,53,69,0.06)', border: '1px solid rgba(220,53,69,0.2)',
                    borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#DC3545', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      Motivo de rechazo
                    </div>
                    <div style={{ fontSize: 13.5, color: 'var(--fg1)', lineHeight: 1.5 }}>
                      {status.motivoRechazo}
                    </div>
                  </div>
                )}

                {/* Review timestamp */}
                {status?.fechaRevision && (
                  <div style={{ marginTop: 12, fontSize: 12, color: 'var(--fg3)' }}>
                    Revisado el {new Date(status.fechaRevision).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>

              {/* Upload Section — visible when status allows re-upload */}
              {(estado === 'sin_documentos' || estado === 'rechazado') && (
                <div className="animate-fade-in-up delay-2" style={{
                  background: 'var(--bg-surface, #fff)', border: '1px solid var(--border-color)',
                  borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
                    color: 'var(--fg1)', margin: '0 0 6px',
                  }}>
                    {estado === 'rechazado' ? 'Subir documentos nuevamente' : 'Subir documentos'}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 20px' }}>
                    Sube tu CURP y una identificación oficial (INE, pasaporte, cédula profesional)
                  </p>

                  {/* CURP Number Input */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Número de CURP (18 caracteres)</label>
                    <input
                      type="text"
                      className="onboarding-input"
                      style={{ ...inputStyle, marginTop: 6, fontFamily: 'monospace', letterSpacing: '0.05em' }}
                      value={curpNumber}
                      onChange={e => setCurpNumber(e.target.value.toUpperCase().slice(0, 18))}
                      placeholder="GAPL800101HMCYRL09"
                      maxLength={18}
                    />
                    <div style={{ fontSize: 11.5, color: 'var(--fg3)', marginTop: 4 }}>
                      Ingresa las 18 letras de tu Clave Única de Registro de Población
                    </div>
                  </div>

                  {/* CURP Document Upload */}
                  <div style={{ marginBottom: 16 }}>
                    <DocumentUploader
                      tipo="curp"
                      numeroCurp={curpNumber}
                      isUploaded={status?.tieneCurp && estado !== 'rechazado'}
                    />
                  </div>

                  {/* Official ID Upload */}
                  <div>
                    <DocumentUploader
                      tipo="identificacion_oficial"
                      isUploaded={status?.tieneIdentificacion && estado !== 'rechazado'}
                    />
                  </div>

                  {/* Info note */}
                  <div style={{
                    marginTop: 20, padding: '12px 16px', background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10,
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                  }}>
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
              )}

              {/* Pending state info */}
              {estado === 'pendiente' && (
                <div className="animate-fade-in-up delay-2" style={{
                  background: 'var(--bg-surface, #fff)', border: '1px solid var(--border-color)',
                  borderRadius: 14, padding: 24, textAlign: 'center',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(212,148,76,0.12)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  }}>
                    <span style={{ width: 24, height: 24, border: '3px solid #D4944C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'block' }} />
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

              {/* Approved state info */}
              {estado === 'aprobado' && (
                <div className="animate-fade-in-up delay-2" style={{
                  background: 'var(--bg-surface, #fff)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 14, padding: 24, textAlign: 'center',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(16,185,129,0.12)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  }}>
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
        )}

        {activeTab === 'seguridad' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Tarjeta: Seguridad */}
            <div className="animate-fade-in-up" style={{
              background: 'var(--bg-surface, #fff)', border: '1px solid var(--border-color)',
              borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                  Seguridad
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>Cambiar contraseña</h4>
                    <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0 }}>Recibe notificaciones en tiempo real y alertas del equipo.</p>
                  </div>
                  <button className="btn-secondary" style={{ fontSize: 13.5, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--bg-surface)', fontWeight: 600 }}>
                    {Icons.edit ? Icons.edit({ s: 14 }) : '✏️'} Cambiar contraseña
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>Autenticación de dos factores (2FA)</h4>
                    <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0 }}>Mantén tu cuenta segura habilitando la verificación en dos pasos.</p>
                  </div>
                  <div style={{ width: 44, height: 24, borderRadius: 12, background: 'var(--primary)', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 2px' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', marginLeft: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta: Zona de Peligro */}
            <div className="animate-fade-in-up delay-1" style={{
              background: 'var(--bg-surface, #fff)', border: '1px solid var(--border-color)',
              borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-error, #DC3545)', margin: 0 }}>
                  Zona de peligro
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>Cerrar sesión en todos los dispositivos</h4>
                    <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0 }}>Cierra sesión en todas las sesiones activas.</p>
                  </div>
                  <button className="btn-secondary" style={{ fontSize: 13.5, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--bg-surface)', fontWeight: 600 }} onClick={logout}>
                    Cerrar sesión
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>Eliminar cuenta</h4>
                    <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0 }}>Elimina permanentemente tu cuenta y todos los datos asociados.</p>
                  </div>
                  <button style={{ fontSize: 13.5, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-error, #DC3545)', background: 'transparent', color: 'var(--color-error, #DC3545)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in oklch, var(--color-error, #DC3545) 8%, transparent)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </main>
  )
}
