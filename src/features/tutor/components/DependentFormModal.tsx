import { useState, ChangeEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@shared/stores/uiStore'
import { useSubirDocumentoIdentidad } from '@features/profile/hooks/useDocumentoIdentidad'
import AddDependienteModal from './AddDependienteModal'
import { useCatalogos } from '@shared/hooks/useCatalogos'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE_MB = 10

export default function DependentFormModal({ open, onClose, onAdd }: {
  open: boolean
  onClose: () => void
  onAdd: (data: Record<string, unknown>) => Promise<void>
}) {
  const { addToast } = useUiStore()
  const qc = useQueryClient()
  const uploadDoc = useSubirDocumentoIdentidad()
  const { data: catalogos } = useCatalogos()
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [parentesco, setParentesco] = useState('')
  const [necesidades, setNecesidades] = useState<string[]>([])
  const [etapaVida, setEtapaVida] = useState('')
  const [birth_date, setBirth_date] = useState('')
  const [crearCuenta, setCrearCuenta] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      addToast(`Formato no permitido. Usa JPEG, PNG, WebP o PDF.`, 'error')
      e.target.value = ''
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      addToast(`El archivo supera el límite de ${MAX_SIZE_MB}MB.`, 'error')
      e.target.value = ''
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

  const handleUpload = async () => {
    if (!selectedFile) return
    try {
      await uploadDoc.mutateAsync({
        file: selectedFile,
        tipo: 'identificacion_oficial',
      })
      addToast('Identificación oficial subida correctamente', 'success')
      setSelectedFile(null)
      setPreviewUrl(null)
      qc.invalidateQueries({ queryKey: ['documento-identidad'] })
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      addToast(errMsg ?? 'Error al subir la identificación oficial', 'error')
    }
  }

  const handleClose = () => {
    onClose()
    setSelectedFile(null)
    setPreviewUrl(null)
    setNombreCompleto('')
    setParentesco('')
    setNecesidades([])
    setEtapaVida('')
    setBirth_date('')
    setCrearCuenta(false)
    setEmail('')
    setPassword('')
  }

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreCompleto.trim()) {
      addToast('El nombre completo es requerido', 'error')
      return
    }
    setSaving(true)
    try {
      await onAdd({
        nombreCompleto: nombreCompleto.trim(),
        parentesco,
        necesidades,
        etapaVida,
        birth_date,
        crearCuenta,
        email,
        password,
      })
      addToast('Dependiente agregado exitosamente', 'success')
      handleClose()
    } catch (err) {
      const errMsg = err && typeof err === 'object' && 'message' in err ? String((err as { message?: string }).message) : undefined
      addToast(errMsg ?? 'Error al agregar el dependiente', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AddDependienteModal
      onClose={handleClose}
      saving={saving}
      catalogos={catalogos}
      form={{
        nombreCompleto,
        parentesco,
        necesidades,
        etapaVida,
        birth_date,
        crearCuenta,
        email,
        password,
      }}
      onChange={(key: string, value: string | string[] | boolean) => {
        switch (key) {
          case 'nombreCompleto':
            setNombreCompleto(value as string)
            break
          case 'parentesco':
            setParentesco(value as string)
            break
          case 'necesidades':
            setNecesidades(value as string[])
            break
          case 'etapaVida':
            setEtapaVida(value as string)
            break
          case 'birth_date':
            setBirth_date(value as string)
            break
          case 'crearCuenta':
            setCrearCuenta(value as boolean)
            break
          case 'email':
            setEmail(value as string)
            break
          case 'password':
            setPassword(value as string)
            break
          default:
            break
        }
      }}
      onSubmit={handleSubmit}
      fileInputProps={{
        accept: ALLOWED_TYPES.join(','),
        onChange: handleFileSelect,
      }}
      previewUrl={previewUrl}
      onClearPreview={() => {
        setSelectedFile(null)
        setPreviewUrl(null)
      }}
      onUpload={handleUpload}
      isUploading={uploadDoc.isPending}
    />
  )
}
