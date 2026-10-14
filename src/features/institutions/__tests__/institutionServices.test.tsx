import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@test/renderWithProviders'
import InstitutionServices from '../components/InstitutionServices'
import ServiciosInscripcionesModal from '../components/ServiciosInscripcionesModal'
import ServiciosTab from '../components/ServiciosTab'
import InstitutionPage from '../pages/InstitutionPage'
import type { Institution } from '@/types/institutions'

// ─── Dependencias de InstitutionPage (hooks + stores) ─────────────────────

vi.mock('../hooks/useInstitutions', () => ({
  useInstitution: vi.fn(),
  useMiInstitucion: vi.fn(),
  useUpdateMiInstitucion: vi.fn(),
}))
vi.mock('../hooks/useInscripcionesServicio', () => ({
  useMisInscripcionesServicio: vi.fn(),
  useInscribirServicio: vi.fn(),
  useCancelarInscripcionServicio: vi.fn(),
  useInscripcionesDeServicio: vi.fn(),
  useResolverInscripcionServicio: vi.fn(),
  useResumenInscripcionesServicio: vi.fn(),
}))
vi.mock('../hooks/useReviews', () => ({
  useReviews: vi.fn(),
  useSubmitReview: vi.fn(),
}))
vi.mock('../../favorites/hooks/useFavorites', () => ({
  useFavoriteIds: vi.fn(),
  useToggleFavorite: vi.fn(),
}))
vi.mock('../../tutor/hooks/useAI', () => ({ useChat: vi.fn() }))
vi.mock('@features/institutions/hooks/useRecommendations', () => ({
  useOnboardingStatus: vi.fn(),
}))
vi.mock('@features/auth', () => ({ useAuthStore: vi.fn() }))
vi.mock('@shared/stores/uiStore', () => ({ useUiStore: vi.fn() }))

import { useInstitution, useMiInstitucion, useUpdateMiInstitucion } from '../hooks/useInstitutions'
import {
  useMisInscripcionesServicio,
  useInscribirServicio,
  useCancelarInscripcionServicio,
  useInscripcionesDeServicio,
  useResolverInscripcionServicio,
  useResumenInscripcionesServicio,
} from '../hooks/useInscripcionesServicio'
import { useReviews, useSubmitReview } from '../hooks/useReviews'
import { useFavoriteIds, useToggleFavorite } from '../../favorites/hooks/useFavorites'
import { useChat } from '../../tutor/hooks/useAI'
import { useOnboardingStatus } from '@features/institutions/hooks/useRecommendations'
import { useAuthStore } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'

const addToast = vi.fn()
const inscribirMutate = vi.fn()
const cancelarMutate = vi.fn()
const resolverMutate = vi.fn()
const setForoBorradorMock = vi.fn()
const setInstPortalTabMock = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  // jsdom no implementa scrollIntoView (lo usa InstitutionAIChat)
  Object.defineProperty(Element.prototype, 'scrollIntoView', { value: vi.fn(), writable: true, configurable: true })

  // Los mutations simulados invocan los callbacks para poder verificar toasts
  inscribirMutate.mockImplementation((_id: string, cbs?: { onSuccess?: () => void }) => cbs?.onSuccess?.())
  cancelarMutate.mockImplementation((_id: string, cbs?: { onSuccess?: () => void }) => cbs?.onSuccess?.())
  resolverMutate.mockImplementation((_vars: unknown, cbs?: { onSuccess?: () => void }) => cbs?.onSuccess?.())

  vi.mocked(useOnboardingStatus).mockReturnValue({ data: { onboardingCompleto: true } } as never)
  vi.mocked(useAuthStore).mockReturnValue({ user: null } as never)
  // El store se usa tanto con selector (`useUiStore(s => s.x)`) como sin él
  vi.mocked(useUiStore).mockImplementation(((selector?: (s: never) => unknown) => (
    selector
      ? selector({ setInstPortalForoBorrador: setForoBorradorMock, setInstPortalTab: setInstPortalTabMock } as never)
      : { addToast }
  )) as never)
  vi.mocked(useFavoriteIds).mockReturnValue({ data: [] } as never)
  vi.mocked(useToggleFavorite).mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
  vi.mocked(useReviews).mockReturnValue({ data: [], isLoading: false } as never)
  vi.mocked(useSubmitReview).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never)
  vi.mocked(useChat).mockReturnValue({ mutateAsync: vi.fn(), isPending: false, error: undefined } as never)

  vi.mocked(useMisInscripcionesServicio).mockReturnValue({ data: { institucionId: 'inst-1', datos: [] } } as never)
  vi.mocked(useInscribirServicio).mockReturnValue({ mutate: inscribirMutate, isPending: false } as never)
  vi.mocked(useCancelarInscripcionServicio).mockReturnValue({ mutate: cancelarMutate, isPending: false } as never)
  vi.mocked(useInscripcionesDeServicio).mockReturnValue({ data: undefined, isLoading: false } as never)
  vi.mocked(useResolverInscripcionServicio).mockReturnValue({ mutate: resolverMutate, isPending: false } as never)
  vi.mocked(useResumenInscripcionesServicio).mockReturnValue({ data: { institucionId: 'inst-1', datos: [] } } as never)
  vi.mocked(useMiInstitucion).mockReturnValue({ data: null, isLoading: false } as never)
  vi.mocked(useUpdateMiInstitucion).mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
})

function baseInstitution(servicios: unknown): Institution {
  return { id: 'inst-1', name: 'Centro Demo', servicios } as Institution
}

// ─── InstitutionServices (tarjeta) ────────────────────────────────────────

describe('InstitutionServices', () => {
  it('muestra el empty state cuando no hay servicios', () => {
    renderWithProviders(<InstitutionServices institution={baseInstitution([])} />)

    expect(screen.getByText('Esta institución aún no ha publicado servicios')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Servicios y Programas/ })).toBeInTheDocument()
  })

  it('muestra el empty state cuando el campo servicios no existe', () => {
    renderWithProviders(<InstitutionServices institution={{ id: 'i', name: 'Centro' } as Institution} />)

    expect(screen.getByText('Esta institución aún no ha publicado servicios')).toBeInTheDocument()
  })

  it('mapea los servicios con título, descripción, precio y horario', () => {
    renderWithProviders(
      <InstitutionServices
        institution={baseInstitution([
          {
            id: 's-1',
            nombre: 'Terapia del habla',
            categoria: 'Salud y Terapia',
            descripcion: 'Sesiones individuales para niños.',
            costo: '$250',
            horario: 'Lunes a Viernes de 9:00 a 14:00 hrs',
            accesibilidad: ['Intérprete LSM'],
            estado: 'Activo',
          },
          {
            id: 's-2',
            nombre: 'Taller de lectoescritura',
            descripcion: 'Grupo reducido.',
            costo: 'Gratuito',
            horario: 'Martes y jueves 10:00 hrs',
            estado: 'Activo',
          },
        ])}
      />,
    )

    expect(screen.getByText('Terapia del habla')).toBeInTheDocument()
    expect(screen.getByText('Sesiones individuales para niños.')).toBeInTheDocument()
    expect(screen.getByText(/Lunes a Viernes de 9:00 a 14:00 hrs/)).toBeInTheDocument()
    expect(screen.getByText('Taller de lectoescritura')).toBeInTheDocument()
    expect(screen.getByText(/Martes y jueves 10:00 hrs/)).toBeInTheDocument()
    expect(screen.getAllByText('Precio:')).toHaveLength(2)
    expect(screen.getByText('♿ Intérprete LSM')).toBeInTheDocument()
    expect(screen.queryByText('Esta institución aún no ha publicado servicios')).not.toBeInTheDocument()
  })

  it('descarta los servicios inactivos (activo: false o estado distinto de Activo)', () => {
    renderWithProviders(
      <InstitutionServices
        institution={baseInstitution([
          JSON.stringify({ nombre: 'Servicio oculto', activo: false }),
          JSON.stringify({ nombre: 'Otro oculto', estado: 'Inactivo' }),
        ])}
      />,
    )

    expect(screen.queryByText('Servicio oculto')).not.toBeInTheDocument()
    expect(screen.queryByText('Otro oculto')).not.toBeInTheDocument()
    expect(screen.getByText('Esta institución aún no ha publicado servicios')).toBeInTheDocument()
  })

  it('acepta el formato legado (string con JSON o etiqueta de texto)', () => {
    renderWithProviders(
      <InstitutionServices
        institution={baseInstitution([
          JSON.stringify({ nombre: 'Fisioterapia', costo: 'Gratuito', horario: 'Lun a Vie', activo: true }),
          'Educación especial',
        ])}
      />,
    )

    expect(screen.getByText('Fisioterapia')).toBeInTheDocument()
    expect(screen.getByText('Lun a Vie')).toBeInTheDocument()
    expect(screen.getByText('Educación especial')).toBeInTheDocument()
  })
})

// ─── Botón de inscripción (flujo con aprobación) ──────────────────────────

describe('InstitutionServices — botón de inscripción', () => {
  const servicio = {
    id: 's-1', nombre: 'Terapia ABA', categoria: 'Salud y Terapia',
    descripcion: 'Sesiones individuales.', costo: 'Gratuito', horario: 'Lun-Vie', estado: 'Activo',
  }

  it('sin sesión: muestra "Inscribirme" y pide iniciar sesión al hacer clic', () => {
    vi.mocked(useAuthStore).mockReturnValue({ user: null } as never)
    renderWithProviders(<InstitutionServices institution={baseInstitution([servicio])} />)

    fireEvent.click(screen.getByRole('button', { name: /Inscribirme/ }))

    expect(addToast).toHaveBeenCalledWith('Inicia sesión para inscribirte a este servicio', 'warning')
    expect(inscribirMutate).not.toHaveBeenCalled()
    expect(screen.getByText('Requiere aprobación de la institución')).toBeInTheDocument()
  })

  it('con sesión: envía la solicitud y muestra "Solicitud enviada"', () => {
    vi.mocked(useAuthStore).mockReturnValue({ user: { id: 'user-1' } } as never)
    vi.mocked(useMisInscripcionesServicio).mockReturnValue({
      data: { institucionId: 'inst-1', datos: [{ institucionId: 'inst-1', servicioId: 's-1', estado: 'pendiente' }] },
    } as never)

    renderWithProviders(<InstitutionServices institution={baseInstitution([servicio])} />)

    const boton = screen.getByRole('button', { name: /Solicitud enviada/ })
    expect(boton).toBeInTheDocument()

    fireEvent.click(boton)
    expect(cancelarMutate).toHaveBeenCalledWith('s-1', expect.any(Object))
    expect(addToast).toHaveBeenCalledWith('Solicitud de inscripción cancelada', 'info')
  })

  it('muestra "Inscrito" cuando la inscripción está activa y permite cancelarla', () => {
    vi.mocked(useAuthStore).mockReturnValue({ user: { id: 'user-1' } } as never)
    vi.mocked(useMisInscripcionesServicio).mockReturnValue({
      data: { institucionId: 'inst-1', datos: [{ institucionId: 'inst-1', servicioId: 's-1', estado: 'activa' }] },
    } as never)

    renderWithProviders(<InstitutionServices institution={baseInstitution([servicio])} />)

    fireEvent.click(screen.getByRole('button', { name: /Inscrito/ }))

    expect(cancelarMutate).toHaveBeenCalledWith('s-1', expect.any(Object))
    expect(addToast).toHaveBeenCalledWith('Inscripción cancelada', 'info')
  })

  it('envía la solicitud al hacer clic cuando aún no está inscrito', () => {
    vi.mocked(useAuthStore).mockReturnValue({ user: { id: 'user-1' } } as never)

    renderWithProviders(<InstitutionServices institution={baseInstitution([servicio])} />)

    fireEvent.click(screen.getByRole('button', { name: /Inscribirme/ }))

    expect(inscribirMutate).toHaveBeenCalledWith('s-1', expect.any(Object))
    expect(addToast).toHaveBeenCalledWith('Solicitud enviada: la institución revisará tu inscripción', 'success')
  })
})

// ─── ServiciosInscripcionesModal (panel de la institución) ───────────────

describe('ServiciosInscripcionesModal', () => {
  const listado = {
    institucionId: 'inst-1',
    servicioId: 's-1',
    total: 2,
    pendientes: 1,
    activas: 1,
    rechazadas: 0,
    datos: [
      {
        id: 's-1__u1', institucionId: 'inst-1', servicioId: 's-1', usuarioId: 'u1',
        estado: 'pendiente', fechaCreacion: '2026-10-01T00:00:00.000Z',
        usuario: { id: 'u1', nombre: 'María López', email: 'maria@correo.mx' },
      },
      {
        id: 's-1__u2', institucionId: 'inst-1', servicioId: 's-1', usuarioId: 'u2',
        estado: 'activa', fechaCreacion: '2026-10-02T00:00:00.000Z',
        usuario: { id: 'u2', nombre: 'Juan Pérez', email: 'juan@correo.mx', urlAvatar: 'https://img/u2.jpg' },
      },
    ],
  }

  function renderModal(overrides: { datos?: unknown[] } = {}) {
    vi.mocked(useInscripcionesDeServicio).mockReturnValue({
      data: { ...listado, datos: overrides.datos ?? listado.datos },
    } as never)

    const props = {
      institucionId: 'inst-1',
      servicioId: 's-1',
      servicioNombre: 'Terapia ABA',
      onCrearPublicacion: vi.fn(),
      onCrearForo: vi.fn(),
      onClose: vi.fn(),
    }
    renderWithProviders(<ServiciosInscripcionesModal {...props} />)
    return props
  }

  it('lista a las personas inscritas con nombre, correo y fecha', () => {
    renderModal()

    expect(screen.getByText('María López')).toBeInTheDocument()
    expect(screen.getByText(/maria@correo\.mx/)).toBeInTheDocument()
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText(/juan@correo\.mx/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Pendientes \(1\)/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Inscritos \(1\)/ })).toBeInTheDocument()
  })

  it('aprueba una solicitud pendiente', () => {
    renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Aprobar' }))

    expect(resolverMutate).toHaveBeenCalledWith(
      { servicioId: 's-1', inscripcionId: 's-1__u1', accion: 'aprobar' },
      expect.any(Object),
    )
    expect(addToast).toHaveBeenCalledWith('Inscripción aprobada', 'success')
  })

  it('rechaza una solicitud pendiente', () => {
    renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }))

    expect(resolverMutate).toHaveBeenCalledWith(
      { servicioId: 's-1', inscripcionId: 's-1__u1', accion: 'rechazar' },
      expect.any(Object),
    )
  })

  it('copia la lista de correos al portapapeles', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', { value: { writeText }, configurable: true })

    renderModal()

    fireEvent.click(screen.getByRole('button', { name: /Copiar correos/ }))

    expect(writeText).toHaveBeenCalledWith('maria@correo.mx, juan@correo.mx')
    // copiarCorreos es async: el toast llega en el siguiente microtask
    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith('2 correos copiados al portapapeles', 'success')
    })
  })

  it('abre los atajos de crear publicación y crear foro', () => {
    const props = renderModal()

    fireEvent.click(screen.getByRole('button', { name: /Crear publicación/ }))
    expect(props.onCrearPublicacion).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /Crear foro/ }))
    expect(props.onCrearForo).toHaveBeenCalledTimes(1)
  })

  it('muestra empty state y deshabilita los atajos sin inscritos', () => {
    const props = renderModal({ datos: [] })

    expect(screen.getByText('Aún no hay personas inscritas a este servicio')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Crear publicación/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Crear foro/ })).toBeDisabled()
    expect(props.onCrearPublicacion).not.toHaveBeenCalled()
  })
})

// ─── ServiciosTab (panel de la institución) ───────────────────────────

describe('ServiciosTab — badge de inscritos y atajos', () => {
  it('muestra el conteo, abre el modal y el atajo a foro precarga el borrador', () => {
    vi.mocked(useMiInstitucion).mockReturnValue({
      data: {
        id: 'inst-1', name: 'Centro Demo',
        servicios: [JSON.stringify({ id: 's-1', nombre: 'Terapia ABA', costo: 'Gratuito', activo: true })],
      },
      isLoading: false,
    } as never)
    vi.mocked(useResumenInscripcionesServicio).mockReturnValue({
      data: {
        institucionId: 'inst-1',
        datos: [{ servicioId: 's-1', servicioNombre: 'Terapia ABA', pendientes: 2, activas: 5, rechazadas: 0, total: 7 }],
      },
    } as never)
    vi.mocked(useInscripcionesDeServicio).mockReturnValue({
      data: {
        institucionId: 'inst-1', servicioId: 's-1', total: 1, pendientes: 1, activas: 0, rechazadas: 0,
        datos: [{
          id: 's-1__u1', institucionId: 'inst-1', servicioId: 's-1', usuarioId: 'u1', estado: 'pendiente',
          usuario: { id: 'u1', nombre: 'María López', email: 'maria@correo.mx' },
        }],
      },
    } as never)

    renderWithProviders(<ServiciosTab />)

    // Badge con el conteo de inscritos y pendientes
    const boton = screen.getByRole('button', { name: /Inscritos 5/ })
    expect(boton).toBeInTheDocument()
    expect(screen.getByText('2 pend.')).toBeInTheDocument()

    // Abre el modal de inscritos
    fireEvent.click(boton)
    expect(screen.getByText(/Personas inscritas/)).toBeInTheDocument()
    expect(screen.getByText('María López')).toBeInTheDocument()

    // Atajo "Crear foro": precarga el borrador y cambia a la pestaña de foros
    fireEvent.click(screen.getByRole('button', { name: /Crear foro/ }))
    expect(setForoBorradorMock).toHaveBeenCalledWith({
      titulo: 'Foro: Terapia ABA',
      descripcion: expect.stringContaining('Terapia ABA'),
    })
    expect(setInstPortalTabMock).toHaveBeenCalledWith('foros')
    expect(screen.queryByText(/Personas inscritas/)).not.toBeInTheDocument()
  })
})

// ─── InstitutionPage (orden y estilo de las secciones) ────────────────────

describe('InstitutionPage (sección Servicios y Programas)', () => {
  function renderPage() {
    vi.mocked(useInstitution).mockReturnValue({
      data: baseInstitution([
        { id: 's-1', nombre: 'Terapia ABA', costo: 'Gratuito', horario: 'Lun-Vie 9:00-14:00', estado: 'Activo' },
      ]),
      isLoading: false,
    } as never)

    return renderWithProviders(<InstitutionPage />)
  }

  it('inserta el bloque debajo de Información General/Ubicación y arriba del Asistente IA', () => {
    renderPage()

    const main = screen.getByRole('main')
    const hijos = Array.from(main.children)

    const idxNombre = hijos.findIndex(h => h.querySelector('h1')) // tarjeta de Información General
    const idxServicios = hijos.findIndex(h => h.textContent?.includes('Servicios y Programas'))
    const idxAsistente = hijos.findIndex(h => h.textContent?.includes('Asistente IA'))
    const idxResenas = hijos.findIndex(h => h.textContent?.includes('Reseñas'))

    expect(idxNombre).toBeGreaterThanOrEqual(0)
    // Información General → Servicios y Programas → Asistente IA → Reseñas
    expect(idxServicios).toBe(idxNombre + 1)
    expect(idxAsistente).toBe(idxServicios + 1)
    expect(idxResenas).toBe(idxAsistente + 1)
  })

  it('usa la misma tarjeta blanca (fondo, borde, radio y padding) que el bloque del Asistente IA', () => {
    renderPage()

    const hijos = Array.from(screen.getByRole('main').children)
    const tarjetaServicios = hijos.find(h => h.textContent?.includes('Servicios y Programas')) as HTMLElement
    const tarjetaAsistente = hijos.find(h => h.textContent?.includes('Asistente IA')) as HTMLElement

    expect(tarjetaServicios.style.background).toBe(tarjetaAsistente.style.background)
    expect(tarjetaServicios.style.border).toBe(tarjetaAsistente.style.border)
    expect(tarjetaServicios.style.borderRadius).toBe(tarjetaAsistente.style.borderRadius)
    expect(tarjetaServicios.style.padding).toBe(tarjetaAsistente.style.padding)
    expect(tarjetaServicios.style.boxShadow).toBe(tarjetaAsistente.style.boxShadow)
    expect(tarjetaServicios.style.marginBottom).toBe(tarjetaAsistente.style.marginBottom)
  })

  it('renderiza los servicios activos dentro de la sección', () => {
    renderPage()

    expect(screen.getByText('Terapia ABA')).toBeInTheDocument()
    expect(screen.getByText(/Lun-Vie 9:00-14:00/)).toBeInTheDocument()
  })

  it('muestra el empty state cuando la institución no tiene servicios publicados', () => {
    vi.mocked(useInstitution).mockReturnValue({
      data: baseInstitution([]),
      isLoading: false,
    } as never)

    renderWithProviders(<InstitutionPage />)

    expect(screen.getByText('Esta institución aún no ha publicado servicios')).toBeInTheDocument()
  })
})
