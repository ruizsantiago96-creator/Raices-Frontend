import React, { useState, useRef } from 'react'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'
import { IdentityStatusCard } from './IdentityStatusCard'
import {
  EstadoValidacionIdentidad,
  DocumentoIdentidadEstado,
} from '@/types/profile'
import { useSubirDocumentoIdentidad } from '../hooks/useDocumentoIdentidad'
import {
  useEstadoVerificacionInstitucion,
  useSubirDocumentoVerificacion,
} from '@features/institutions/hooks/useInstitutions'
import { useUiStore } from '@shared/stores/uiStore'
import { useEsEmpresa } from '@features/auth/lib/empresaRole'

export function useIdentitySection(_state?: unknown) {
  const [curpNumber, setCurpNumber] = useState<string>('')
  return { curpNumber, setCurpNumber }
}

export interface IdentityUploadSectionProps {
  status?: EstadoValidacionIdentidad | null
  estado?: DocumentoIdentidadEstado | string
  onUploaded?: () => void
}

export const IdentityUploadSection: React.FC<IdentityUploadSectionProps> = ({
  status,
  estado,
  onUploaded,
}) => {
  const [localCurp, setLocalCurp] = useState(status?.numeroCurp ?? '')
  // Persona moral: sin CURP ni identificación oficial. Se oculta en el origen
  // para que ninguna vista que lo monte (MiIdentidadPage, /verificacion-identidad)
  // pueda ofrecerle la validación individual.
  const isEmpresa = useEsEmpresa()

  if (isEmpresa) return null
  if (estado === 'aprobado') return null
  if (estado === 'pendiente' && status?.tieneCurp && status?.tieneIdentificacion) return null

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
          value={localCurp}
          onChange={(e) => setLocalCurp(e.target.value.toUpperCase())}
          placeholder="GAPL800101HMCYRL09"
          maxLength={18}
          readOnly={Boolean(status?.tieneCurp && estado !== 'rechazado')}
        />
        <div style={{ fontSize: 11.5, color: 'var(--fg3)', marginTop: 4 }}>
          Ingresa las 18 letras de tu Clave Única de Registro de Población
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <IdentityDocumentUploader
          tipo="curp"
          numeroCurp={localCurp}
          isUploaded={Boolean(status?.tieneCurp && estado !== 'rechazado')}
          onUploadSuccess={onUploaded}
        />
      </div>

      <div>
        <IdentityDocumentUploader
          tipo="identificacion_oficial"
          isUploaded={Boolean(status?.tieneIdentificacion && estado !== 'rechazado')}
          onUploadSuccess={onUploaded}
        />
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

export interface IdentityDocumentUploaderProps {
  tipo: 'curp' | 'identificacion_oficial' | 'csf' | string
  isUploaded?: boolean
  numeroCurp?: string
  onUploadSuccess?: () => void
}

export const IdentityDocumentUploader: React.FC<IdentityDocumentUploaderProps> = ({
  tipo,
  isUploaded,
  numeroCurp,
  onUploadSuccess,
}) => {
  const tipoLabel =
    tipo === 'csf'
      ? 'Constancia de Situación Fiscal (CSF)'
      : tipo === 'curp'
      ? 'CURP'
      : 'Identificación oficial del representante legal'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const subirDoc = useSubirDocumentoIdentidad()
  // La CSF no pertenece al flujo de identidad de usuario: es un documento de la
  // persona moral y va a su propio endpoint (ver useSubirDocumentoVerificacion).
  const subirVerificacion = useSubirDocumentoVerificacion()
  const esCsf = tipo === 'csf'
  // El botón debe reflejar la subida que realmente se está haciendo: la de la
  // CSF va por su propio endpoint, la del resto por el de identidad de usuario.
  const isEnviando = esCsf ? subirVerificacion.isPending : subirDoc.isPending
  const addToast = useUiStore((s) => s.addToast)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      addToast('El archivo supera el tamaño máximo permitido de 10 MB', 'error')
      return
    }

    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return
    const onSuccess = () => {
      addToast(`${tipoLabel} subido exitosamente`, 'success')
      handleClear()
      onUploadSuccess?.()
    }
    const onError = (err: Error) => {
      addToast(err?.message || `Error al subir ${tipoLabel}`, 'error')
    }

    // Bifurcación por endpoint: mandarlo todo a /usuarios/documento-identidad
    // devolvía 400 para la CSF ("Tipo de documento inválido"), porque ese
    // endpoint solo admite curp | identificacion_oficial | certificado_discapacidad.
    if (esCsf) {
      subirVerificacion.mutate(
        { tipo: 'csf', file: selectedFile },
        { onSuccess, onError },
      )
      return
    }

    subirDoc.mutate(
      {
        tipo,
        file: selectedFile,
        numeroCurp,
      },
      { onSuccess, onError },
    )
  }

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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
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
                style={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                }}
              />
              <button
                type="button"
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Eliminar selección"
              >
                {Icons.x({ s: 12 })}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                background: 'var(--bg-warm, #f8fafc)',
                borderRadius: 8,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--fg1)',
                  fontWeight: 500,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedFile.name}
              </span>
              <span style={{ fontSize: 11, color: 'var(--fg3)' }}>
                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--fg3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Eliminar selección"
              >
                {Icons.x({ s: 14 })}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleUpload}
            disabled={isEnviando}
            style={{
              padding: '10px 20px',
              background: 'var(--primary, #6366f1)',
              border: 'none',
              color: '#fff',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: isEnviando ? 0.7 : 1,
            }}
          >
            {isEnviando ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: '2px solid #fff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
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
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '10px 16px',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            color: 'var(--fg1)',
            fontFamily: 'var(--font-body)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-warm, #f8fafc)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {Icons.upload({ s: 14 })}
          Seleccionar archivo
        </button>
      )}
    </div>
  )
}

export const EmpresaIdentitySection: React.FC<IdentityUploadSectionProps> = ({
  status,
  estado = status?.estado ?? 'sin_documentos',
  onUploaded,
}) => {
  // La CSF vive en la entidad de la persona moral (`documentoCsf`), así que su
  // estado se lee del endpoint de verificación de institución. Antes se leía
  // `status?.tieneCsf` de /usuarios/estado-validacion-identidad, campo que ese
  // endpoint nunca devuelve (no aplica a personas morales): por eso la tarjeta
  // de CSF nunca se markaba como subida, aunque la carga hubiera funcionado.
  const { data: estadoVerificacion } = useEstadoVerificacionInstitucion()
  const pasoCsf = estadoVerificacion?.pasos?.find(p => p.clave === 'csf')
  const tieneCsf = pasoCsf?.completado === true

  // Para la persona moral la bandera que manda es `instituciones/{id}.verificada`
  // (la que el admin aprueba), no el estado de sus documentos de identidad. Se
  // usa como fuente principal y se cae al `estado` previo si aún no hay respuesta.
  const verificada = estadoVerificacion?.verificada === true || estado === 'aprobado'
  const enRevision = !verificada && (tieneCsf || estado === 'pendiente')
  const estadoVisible = verificada ? 'aprobado' : enRevision ? 'pendiente' : estado

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Tarjeta de estado de la empresa */}
      <div
        className="animate-fade-in-up"
        style={{
          background: 'var(--bg-surface, #fff)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: estadoVisible === 'aprobado' ? 'rgba(16,185,129,0.12)' : estadoVisible === 'pendiente' ? 'rgba(212,148,76,0.12)' : 'rgba(99,102,241,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: estadoVisible === 'aprobado' ? '#10B981' : estadoVisible === 'pendiente' ? '#D4944C' : 'var(--primary)',
            }}
          >
            {estadoVisible === 'aprobado' ? Icons.shieldCheck({ s: 22 }) : Icons.building({ s: 22 })}
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
              {estadoVisible === 'aprobado' ? 'Empresa Verificada' : estadoVisible === 'pendiente' ? 'Documentos Corporativos en Revisión' : 'Verificación de la Empresa'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '2px 0 0' }}>
              {estadoVisible === 'aprobado'
                ? 'Tu organización ha sido validada exitosamente con su Constancia de Situación Fiscal (CSF).'
                : estadoVisible === 'pendiente'
                ? 'Tus documentos oficiales están siendo revisados por nuestro equipo de validación.'
                : 'Sube la Constancia de Situación Fiscal (CSF) de tu empresa y la identificación oficial del representante legal.'}
            </p>
          </div>
        </div>
      </div>

      {/* Carga de documentos oficiales (CSF + INE del Representante Legal) — SIN SOLICITAR CURP */}
      <div
        className="animate-fade-in-up delay-1"
        style={{
          background: 'var(--bg-surface, #fff)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
          {estado === 'rechazado' ? 'Actualizar documentos oficiales de la empresa' : 'Documentos oficiales de la empresa'}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 20px' }}>
          Adjunta los archivos requeridos para verificar la existencia legal de tu organización. <strong>No se requiere ni se solicita CURP para cuentas de empresa.</strong>
        </p>

        {/* 1. Constancia de Situación Fiscal (CSF) */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--fg2)', marginBottom: 8 }}>
            1. Constancia de Situación Fiscal (CSF)
          </div>
          <IdentityDocumentUploader
            tipo="csf"
            isUploaded={tieneCsf && estado !== 'rechazado'}
            onUploadSuccess={onUploaded}
          />
        </div>

        {/* 2. Identificación Oficial del Representante Legal (INE) */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--fg2)', marginBottom: 8 }}>
            2. Identificación Oficial del Representante Legal (INE / Pasaporte / Cédula)
          </div>
          <IdentityDocumentUploader
            tipo="identificacion_oficial"
            isUploaded={Boolean(status?.tieneIdentificacion && estado !== 'rechazado')}
            onUploadSuccess={onUploaded}
          />
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
          <span style={{ flexShrink: 0, marginTop: 1 }}>{Icons.target({ s: 14 })}</span>
          <div style={{ fontSize: 12.5, color: 'var(--fg2)', lineHeight: 1.5 }}>
            <strong>Entidades Empresariales / Persona Moral:</strong> La Constancia de Situación Fiscal (CSF) valida la razón social, el RFC corporativo y el domicilio fiscal de tu empresa. La información es tratada confidencialmente.
          </div>
        </div>
      </div>
    </div>
  )
}

export interface ProfileIdentitySectionProps {
  status?: EstadoValidacionIdentidad | null
  estado?: DocumentoIdentidadEstado | string
}

export const ProfileIdentitySection: React.FC<ProfileIdentitySectionProps> = ({
  status,
  estado = status?.estado ?? 'sin_documentos',
}) => {
  const isEmpresa = useEsEmpresa()

  if (isEmpresa) {
    return <EmpresaIdentitySection status={status} estado={estado} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <IdentityStatusCard status={status} />

      <IdentityUploadSection status={status} estado={estado} onUploaded={() => {}} />

      {estado === 'pendiente' && status?.tieneCurp && status?.tieneIdentificacion && (
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

export default ProfileIdentitySection
