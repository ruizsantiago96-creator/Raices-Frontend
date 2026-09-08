import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import { useSubirDocumentoIdentidad } from '@features/auth'
import { AddDependienteModal } from './AddDependienteModal'
import { useCatalogos } from '@shared/hooks/useCatalogos'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE_MB = 10

export default function DependentFormModal({ open, onClose, onAdd }) {
  const { addToast } = useUiStore()
  const qc = useQueryClient()
  const uploadDoc = useSubirDocumentoIdentidad()
  const catalogos = useCatalogos()
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [parentesco, setParentesco] = useState('')
  const [necesidades, setNecesidades] = useState([])
  const [etapaVida, setEtapaVida] = useState('')
  const [birth_date, setBirth_date] = useState('')
  const [crearCuenta, setCrearCuenta] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
        tipo: 'identificacion_oficial',
        file: selectedFile,
      })
      addToast('Identificación oficial subida correctamente', 'success')
      setSelectedFile(null)
      setPreviewUrl(null)
      qc.invalidateQueries({ queryKey: ['documento-identidad'] })
    } catch (err) {
      addToast(err.response?.data?.message ?? 'Error al subir la identificación oficial', 'error')
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

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onAdd({
        nombreCompleto,
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
      addToast(err?.message ?? 'Error al agregar el dependiente', 'error')
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
      onChange={(key, value) => {
        switch (key) {
          case 'nombreCompleto':
            setNombreCompleto(value)
            break
          case 'parentesco':
            setParentesco(value)
            break
          case 'necesidades':
            setNecesidades(value)
            break
          case 'etapaVida':
            setEtapaVida(value)
            break
          case 'birth_date':
            setBirth_date(value)
            break
          case 'crearCuenta':
            setCrearCuenta(value)
            break
          case 'email':
            setEmail(value)
            break
          case 'password':
            setPassword(value)
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
