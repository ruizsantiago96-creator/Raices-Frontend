import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Calendar,
  MapPin,
  Tag,
  Users,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Upload,
  Trash2,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react'
import { useCrearEvento } from '../hooks/useEventos'
import { useUploadMultimedia } from '../hooks/useMultimedia'
import { CustomSelect } from '@shared/components/CustomSelect'
import { CustomDateTimePicker } from '@shared/components/CustomDateTimePicker'
import { useUiStore } from '../../../shared/stores/uiStore'
import type { ModalidadEvento } from '@/types/social'

interface CrearEventoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const CATEGORIAS_OPCIONES = [
  { value: 'taller', label: 'Taller / Capacitación' },
  { value: 'cultural', label: 'Arte y Cultura' },
  { value: 'deporte', label: 'Deporte y Bienestar' },
  { value: 'encuentro', label: 'Encuentro y Convivencia' },
  { value: 'voluntariado', label: 'Voluntariado' },
  { value: 'otro', label: 'Otro' },
]

const MODALIDADES_OPCIONES = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'virtual', label: 'Virtual / En línea' },
  { value: 'hibrido', label: 'Híbrido' },
]

const ETIQUETAS_ACCESIBILIDAD_DISPONIBLES = [
  'Rampa de acceso',
  'Intérprete LSM',
  'Espacio de bajo estímulo',
  'Subtítulos en vivo',
  'Audio descripción',
  'Perro guía bienvenido',
  'Baño accesible',
  'Estacionamiento adaptado',
]

const PRESET_BANNERS = [
  {
    nombre: 'Comunidad',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  },
  {
    nombre: 'Taller / Aprendizaje',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  },
  {
    nombre: 'Deporte y Salud',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    nombre: 'Arte y Cultura',
    url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
  },
]

export function CrearEventoModal({ isOpen, onClose, onSuccess }: CrearEventoModalProps) {
  const { addToast } = useUiStore()
  const crearEventoMutation = useCrearEvento()
  const uploadMultimediaMutation = useUploadMultimedia()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('taller')
  const [modalidad, setModalidad] = useState<ModalidadEvento>('presencial')
  const [ciudad, setCiudad] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [urlImagen, setUrlImagen] = useState('')
  const [cupoMaximo, setCupoMaximo] = useState<string>('')
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([])
  const [errorLocal, setErrorLocal] = useState<string | null>(null)
  const [cargandoArchivo, setCargandoArchivo] = useState(false)

  if (!isOpen) return null

  const toggleEtiqueta = (tag: string) => {
    setEtiquetasSeleccionadas(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    )
  }

  // Carga de archivo de imagen hacia el servidor de multimedia
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorLocal('El archivo seleccionado debe ser una imagen (JPG, PNG, WebP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorLocal('La imagen debe pesar menos de 5MB.')
      return
    }

    // Previsualización local instantánea mientras se carga
    const previewUrl = URL.createObjectURL(file)
    setUrlImagen(previewUrl)
    setCargandoArchivo(true)
    setErrorLocal(null)

    try {
      const res = await uploadMultimediaMutation.mutateAsync(file)
      if (res?.url) {
        setUrlImagen(res.url)
        addToast('Foto de fondo subida con éxito', 'success')
      } else {
        throw new Error('No se recibió la URL de la imagen')
      }
    } catch {
      setUrlImagen('')
      setErrorLocal('No se pudo subir la foto al servidor en la nube. Por favor selecciona un fondo prediseñado o ingresa un enlace.')
      addToast('Error al subir imagen. Selecciona un fondo de la galería.', 'error')
    } finally {
      setCargandoArchivo(false)
    }
  }

  const queryDireccionParaMapa = [ubicacion.trim(), ciudad.trim()].filter(Boolean).join(', ')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorLocal(null)

    if (!titulo.trim()) {
      setErrorLocal('El título del evento es obligatorio.')
      return
    }

    if (!fechaInicio) {
      setErrorLocal('Debes indicar la fecha y hora de inicio.')
      return
    }

    if ((modalidad === 'presencial' || modalidad === 'hibrido') && !ubicacion.trim()) {
      setErrorLocal('Debes escribir la dirección o lugar físico del evento para ubicarlo en el mapa.')
      return
    }

    if (cargandoArchivo) {
      setErrorLocal('Espera a que termine de cargarse la foto antes de crear el evento.')
      return
    }

    const isoInicio = new Date(fechaInicio).toISOString()
    let isoFin: string | undefined = undefined

    if (fechaFin) {
      const inicioTimestamp = new Date(fechaInicio).getTime()
      const finTimestamp = new Date(fechaFin).getTime()
      if (finTimestamp <= inicioTimestamp) {
        setErrorLocal('La fecha de término debe ser posterior a la fecha de inicio.')
        return
      }
      isoFin = new Date(fechaFin).toISOString()
    }

    // Asegurarse de que urlImagen sea una URL válida de internet o storage (no un blob local no subido)
    const urlLimpia = urlImagen.startsWith('blob:') ? undefined : (urlImagen.trim() || undefined)

    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      categoria,
      modalidad,
      ciudad: ciudad.trim() || undefined,
      ubicacion: ubicacion.trim() || undefined,
      fechaInicio: isoInicio,
      fechaFin: isoFin,
      urlImagen: urlLimpia,
      cupoMaximo: cupoMaximo ? Math.max(1, parseInt(cupoMaximo, 10)) : undefined,
      etiquetasAccesibilidad: etiquetasSeleccionadas.length > 0 ? etiquetasSeleccionadas : undefined,
    }

    crearEventoMutation.mutate(payload, {
      onSuccess: () => {
        addToast('Evento creado exitosamente', 'success')
        onClose()
        if (onSuccess) onSuccess()
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string | string[] } }; message?: string }
        const msg = Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message.join(', ')
          : error.response?.data?.message || error.message || 'Error al crear el evento'
        setErrorLocal(msg)
        addToast('No se pudo crear el evento', 'error')
      },
    })
  }

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-crear-evento-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60000,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        overflowY: 'auto',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface, #ffffff)',
          color: 'var(--fg1, #0f172a)',
          borderRadius: 20,
          border: '1px solid var(--border-color, #e2e8f0)',
          maxWidth: 780,
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.28)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface, #ffffff)',
          }}
        >
          <div>
            <h2
              id="modal-crear-evento-title"
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 800,
                fontFamily: 'var(--font-display, inherit)',
                color: 'var(--fg1, #0f172a)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Calendar size={22} color="#20bd88" />
              Crear Nuevo Evento Comunitario
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fg2, #64748b)' }}>
              Organiza talleres, actividades inclusivas y encuentros para la comunidad Raíces.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#e2e8f0'
              e.currentTarget.style.color = '#0f172a'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.color = '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario con scroll */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {errorLocal && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 12,
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#991b1b',
                fontSize: 13.5,
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorLocal}</span>
            </div>
          )}

          {/* Título del evento */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
              Título del evento *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Título del evento o actividad"
              maxLength={200}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--bg-surface, #ffffff)',
                color: 'var(--fg1, #0f172a)',
                fontSize: 14.5,
                outline: 'none',
              }}
            />
          </div>

          {/* Categoría y Modalidad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
                Categoría *
              </label>
              <CustomSelect
                options={CATEGORIAS_OPCIONES}
                value={categoria}
                onChange={val => setCategoria(val as string)}
                borderRadius={10}
                accentColor="#20bd88"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
                Modalidad *
              </label>
              <CustomSelect
                options={MODALIDADES_OPCIONES}
                value={modalidad}
                onChange={val => setModalidad(val as ModalidadEvento)}
                borderRadius={10}
                accentColor="#20bd88"
              />
            </div>
          </div>

          {/* Fechas con Selector Moderno Global */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <CustomDateTimePicker
                label="Fecha y hora de inicio"
                required
                value={fechaInicio}
                onChange={val => setFechaInicio(val)}
                placeholder="Selecciona inicio..."
                accentColor="#20bd88"
                borderRadius={10}
              />
            </div>

            <div>
              <CustomDateTimePicker
                label="Fecha y hora de fin (opcional)"
                value={fechaFin}
                onChange={val => setFechaFin(val)}
                placeholder="Selecciona término..."
                accentColor="#20bd88"
                borderRadius={10}
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              FOTO DE FONDO / BANNER DEL EVENTO (Subir archivo o Preset)
             ══════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: 16,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ImageIcon size={18} color="#20bd88" />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                  Foto de fondo del evento (Hero Banner)
                </span>
              </div>
              {urlImagen && (
                <button
                  type="button"
                  onClick={() => setUrlImagen('')}
                  style={{
                    background: '#fee2e2',
                    border: 'none',
                    borderRadius: 8,
                    padding: '4px 10px',
                    color: '#b91c1c',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Trash2 size={13} /> Quitar foto
                </button>
              )}
            </div>

            {/* Vista previa en vivo del banner */}
            {urlImagen ? (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 160,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: `linear-gradient(180deg, rgba(7,42,53,0.3) 0%, rgba(7,42,53,0.85) 100%), url(${urlImagen}) center/cover no-repeat`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 16,
                  color: '#ffffff',
                  boxShadow: 'inset 0 0 40px rgba(0,0,0,0.35)',
                }}
              >
                <div>
                  <span
                    style={{
                      background: '#20bd88',
                      color: '#064e3b',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 12,
                      textTransform: 'uppercase',
                    }}
                  >
                    Vista Previa del Fondo
                  </span>
                  <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>
                    {titulo || 'Título de tu evento'}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Acciones de carga de imagen */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={cargandoArchivo}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 10,
                  background: '#20bd88',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(32, 189, 136, 0.3)',
                }}
              >
                {cargandoArchivo ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                Subir foto desde mi equipo
              </button>

              <span style={{ fontSize: 12, color: '#64748b' }}>o selecciona un fondo prediseñado:</span>
            </div>

            {/* Miniaturas de presets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
              {PRESET_BANNERS.map(preset => {
                const isSelected = urlImagen === preset.url
                return (
                  <button
                    key={preset.nombre}
                    type="button"
                    onClick={() => setUrlImagen(preset.url)}
                    style={{
                      position: 'relative',
                      height: 54,
                      borderRadius: 8,
                      border: isSelected ? '2.5px solid #20bd88' : '1px solid #cbd5e1',
                      background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${preset.url}) center/cover no-repeat`,
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 4,
                      textAlign: 'center',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                    }}
                  >
                    {preset.nombre}
                    {isSelected && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: '#20bd88',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Input manual de URL opcional */}
            <div style={{ marginTop: 4 }}>
              <input
                type="url"
                value={urlImagen.startsWith('data:') ? '' : urlImagen}
                onChange={e => setUrlImagen(e.target.value)}
                placeholder="O pega directamente un enlace de imagen (https://...)"
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: 12.5,
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              UBICACIÓN EN GOOGLE MAPS QUE FUNCIONE REALMENTE
             ══════════════════════════════════════════════════════════════════ */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
                  Ciudad
                </label>
                <input
                  type="text"
                  value={ciudad}
                  onChange={e => setCiudad(e.target.value)}
                  placeholder="Ciudad o localidad"
                  maxLength={100}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--bg-surface, #ffffff)',
                    color: 'var(--fg1, #0f172a)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
                  {modalidad === 'virtual' ? 'Enlace virtual (Zoom, Meet...)' : 'Dirección / Lugar físico *'}
                </label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={e => setUbicacion(e.target.value)}
                  placeholder={
                    modalidad === 'virtual'
                      ? 'https://meet.google.com/... o enlace de la reunión'
                      : 'Dirección o nombre del lugar'
                  }
                  maxLength={300}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--bg-surface, #ffffff)',
                    color: 'var(--fg1, #0f172a)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Mapa interactivo en tiempo real para presencial e híbrido */}
            {modalidad !== 'virtual' && (
              <div
                style={{
                  marginTop: 12,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                    <MapPin size={16} color="#20bd88" />
                    <span>Previsualización en Google Maps</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryDireccionParaMapa)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#20bd88',
                      textDecoration: 'none',
                    }}
                  >
                    Ver en Google Maps <ExternalLink size={12} />
                  </a>
                </div>

                {queryDireccionParaMapa ? (
                  <>
                    <div
                      style={{
                        width: '100%',
                        height: 200,
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: '#e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                    >
                      <iframe
                        title="Previsualización de mapa"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(queryDireccionParaMapa)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      />
                    </div>
                    <div style={{ fontSize: 11.5, color: '#10b981', fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={13} /> Ubicación localizada: {queryDireccionParaMapa}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      padding: '24px 16px',
                      background: '#ffffff',
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: 10,
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: 13,
                    }}
                  >
                    📍 Escribe arriba la dirección o lugar para centrar el mapa de Google Maps en tiempo real.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cupo máximo */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
              Cupo máximo (opcional)
            </label>
            <input
              type="number"
              min="1"
              value={cupoMaximo}
              onChange={e => setCupoMaximo(e.target.value)}
              placeholder="Ej. 40 personas (deja en blanco si es libre)"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--bg-surface, #ffffff)',
                color: 'var(--fg1, #0f172a)',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          {/* Etiquetas de accesibilidad */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 8 }}>
              Características de accesibilidad disponibles
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ETIQUETAS_ACCESIBILIDAD_DISPONIBLES.map(tag => {
                const seleccionada = etiquetasSeleccionadas.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleEtiqueta(tag)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: seleccionada ? '1px solid #20bd88' : '1px solid var(--border-color, #cbd5e1)',
                      background: seleccionada ? '#e8f8f2' : 'var(--bg-surface, #ffffff)',
                      color: seleccionada ? '#0f766e' : 'var(--fg2, #64748b)',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {tag}
                    {seleccionada && <span style={{ fontWeight: 800 }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
              Descripción detallada del evento
            </label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Explica de qué trata la actividad, qué deben traer los participantes y cualquier indicación importante..."
              rows={4}
              maxLength={2000}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--bg-surface, #ffffff)',
                color: 'var(--fg1, #0f172a)',
                fontSize: 14,
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Botones de acción */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 12,
              paddingTop: 12,
              borderTop: '1px solid var(--border-color, #e2e8f0)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={crearEventoMutation.isPending}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                border: '1px solid var(--border-color, #cbd5e1)',
                background: '#ffffff',
                color: '#475569',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={crearEventoMutation.isPending}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                borderRadius: 12,
                border: 'none',
                background: '#20bd88',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 800,
                cursor: crearEventoMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: crearEventoMutation.isPending ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(32, 189, 136, 0.35)',
              }}
            >
              {crearEventoMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creando evento...
                </>
              ) : (
                'Publicar Evento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
