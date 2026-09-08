import React from 'react'
import DependentForm from './DependentForm'
import type { CrearDependientePayload, UpdateDependentPayload } from '@/types/tutor'

export interface AddDependienteModalProps {
  onClose: () => void
  onSubmit?: ((e: React.FormEvent) => void) | ((payload: Record<string, unknown>) => void)
  saving?: boolean
  catalogos?: Record<string, unknown> | null
  form?: Record<string, unknown>
  onChange?: (key: string, value: string | string[] | boolean) => void
  fileInputProps?: {
    accept?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    [key: string]: unknown
  }
  previewUrl?: string | null
  onClearPreview?: () => void
  onUpload?: () => void
  isUploading?: boolean
}

/**
 * Modal contenedor que delega la UI del formulario a DependentForm.
 */
export default function AddDependienteModal({
  onClose,
  onSubmit,
  saving = false,
  catalogos,
}: AddDependienteModalProps) {
  const PARENTESCOS = (catalogos?.parentescos as string[]) ?? []
  const DISABILIDADES = ((catalogos?.tiposDiscapacidad as (string | { label?: string })[] | undefined)?.map((d) => (typeof d === 'string' ? d : d.label ?? String(d)))) ?? []

  const handleSave = (data: CrearDependientePayload | UpdateDependentPayload) => {
    if (onSubmit) {
      onSubmit(data as unknown as React.FormEvent & Record<string, unknown>)
    }
  }

  return (
    <DependentForm
      initial={null}
      onCancel={onClose}
      onSave={handleSave}
      saving={saving}
      relationships={PARENTESCOS}
      disabilities={DISABILIDADES}
    />
  )
}
