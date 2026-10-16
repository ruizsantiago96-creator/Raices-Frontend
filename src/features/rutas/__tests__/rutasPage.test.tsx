import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@test/renderWithProviders'
import RutasPage from '../pages/RutasPage'
import {
  useRutas,
  useRutasSummary,
  useGenerarRutaPersonalizada,
  useUpdateRuta,
  useDeleteRuta,
  useRutaDetail,
  useAddPaso,
  useCompletarPaso,
  useDescompletarPaso,
  useMiRuta,
  useCreateRuta,
} from '../hooks/useRutas'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { useOnboardingStatus } from '@features/institutions/hooks/useRecommendations'
import { useUiStore } from '@shared/stores/uiStore'

vi.mock('../hooks/useRutas', () => ({
  useRutas: vi.fn(),
  useRutasSummary: vi.fn(),
  useGenerarRutaPersonalizada: vi.fn(),
  useUpdateRuta: vi.fn(),
  useDeleteRuta: vi.fn(),
  useRutaDetail: vi.fn(),
  useAddPaso: vi.fn(),
  useCompletarPaso: vi.fn(),
  useDescompletarPaso: vi.fn(),
  useMiRuta: vi.fn(),
  useCreateRuta: vi.fn(),
}))
vi.mock('@shared/hooks/useCatalogos', () => ({ useCatalogos: vi.fn() }))
vi.mock('@features/institutions/hooks/useRecommendations', () => ({ useOnboardingStatus: vi.fn() }))
vi.mock('@shared/stores/uiStore', () => ({ useUiStore: vi.fn() }))
// El selector custom no aporta a estos tests y evita dependencias de portales
vi.mock('@shared/components/CustomSelect', () => ({ CustomSelect: () => null }))

const generarMutate = vi.fn()
const addToast = vi.fn()

/** Devuelve el mock de `useGenerarRutaPersonalizada` para poder ajustar estados. */
function mockGenerar(estado: { isPending?: boolean; isError?: boolean } = {}) {
  vi.mocked(useGenerarRutaPersonalizada).mockReturnValue({
    mutate: generarMutate,
    isPending: estado.isPending ?? false,
    isError: estado.isError ?? false,
  } as never)
}

function mockRutas(rutas: unknown[], opciones: { isLoading?: boolean } = {}) {
  vi.mocked(useRutas).mockReturnValue({
    data: rutas,
    isLoading: opciones.isLoading ?? false,
  } as never)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useRutasSummary).mockReturnValue({ data: undefined, isLoading: false } as never)
  vi.mocked(useUpdateRuta).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never)
  vi.mocked(useDeleteRuta).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never)
  vi.mocked(useRutaDetail).mockReturnValue({ data: undefined, isLoading: false } as never)
  vi.mocked(useAddPaso).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never)
  vi.mocked(useCompletarPaso).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never)
  vi.mocked(useDescompletarPaso).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never)
  vi.mocked(useMiRuta).mockReturnValue({ data: undefined } as never)
  vi.mocked(useCatalogos).mockReturnValue({ data: undefined } as never)
  vi.mocked(useCreateRuta).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never)
  vi.mocked(useOnboardingStatus).mockReturnValue({ data: { onboardingCompleto: true } } as never)
  vi.mocked(useUiStore).mockReturnValue({ addToast } as never)
  mockGenerar()
})

describe('RutasPage — motor de recomendación automatizado', () => {
  it('genera la ruta automáticamente cuando el usuario no tiene rutas activas', () => {
    mockRutas([])

    renderWithProviders(<RutasPage />)

    expect(generarMutate).toHaveBeenCalledTimes(1)
  })

  it('no genera nada cuando ya existe una ruta activa', () => {
    mockRutas([
      { id: 'r1', nombre: 'Mi ruta de terapia', estado: 'activa', prioridad: 'media', areaInteres: 'salud', porcentajeProgreso: 40 },
    ])

    renderWithProviders(<RutasPage />)

    expect(generarMutate).not.toHaveBeenCalled()
    expect(screen.getByText('Mi ruta de terapia')).toBeInTheDocument()
  })

  it('espera a que el listado termine de cargar antes de decidir', () => {
    mockRutas([], { isLoading: true })

    renderWithProviders(<RutasPage />)

    expect(generarMutate).not.toHaveBeenCalled()
  })

  it('no dispara la generación si el perfil está incompleto (acceso restringido)', () => {
    vi.mocked(useOnboardingStatus).mockReturnValue({ data: { onboardingCompleto: false } } as never)
    mockRutas([])

    renderWithProviders(<RutasPage />)

    expect(generarMutate).not.toHaveBeenCalled()
  })

  it('muestra el estado de carga estratégico (sin empty state) mientras genera', () => {
    mockRutas([])
    mockGenerar({ isPending: true })

    renderWithProviders(<RutasPage />)

    expect(
      screen.getByText('Analizando tu perfil e integrando especialistas reales para tu ruta ideal...'),
    ).toBeInTheDocument()
    // El empty state tradicional queda oculto durante la generación
    expect(screen.queryByText('Aún no tienes rutas de desarrollo')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Crear mi primera ruta/ })).not.toBeInTheDocument()
  })

  it('no muestra el botón de creación manual "+ Nueva Ruta"', () => {
    mockRutas([
      { id: 'r1', nombre: 'Mi ruta', estado: 'activa', prioridad: 'media', areaInteres: 'salud', porcentajeProgreso: 10 },
    ])

    renderWithProviders(<RutasPage />)

    expect(screen.queryByRole('button', { name: /Nueva Ruta/ })).not.toBeInTheDocument()
  })

  it('permite reintentar la generación si el motor falla', () => {
    mockRutas([])
    mockGenerar({ isError: true })

    renderWithProviders(<RutasPage />)

    fireEvent.click(screen.getByRole('button', { name: /Reintentar generación/ }))

    // Una vez del auto-disparo + una del reintento
    expect(generarMutate).toHaveBeenCalledTimes(2)
    expect(screen.getByText('Aún no tienes rutas de desarrollo')).toBeInTheDocument()
  })

  it('muestra el encabezado "Mi Camino" y las actividades directamente en la pantalla sin modal', () => {
    mockRutas([
      {
        id: 'r1',
        nombre: 'Mi ruta de autonomía',
        estado: 'activa',
        prioridad: 'alta',
        areaInteres: 'salud',
        porcentajeProgreso: 50,
        metaFinal: 'Lograr desplazamiento independiente en transporte público',
      },
    ])
    vi.mocked(useRutaDetail).mockReturnValue({
      data: {
        id: 'r1',
        nombre: 'Mi ruta de autonomía',
        estado: 'activa',
        prioridad: 'alta',
        areaInteres: 'salud',
        porcentajeProgreso: 50,
        pasos: [
          { id: 'p1', titulo: 'Acudir a terapia física y rehabilitación', completado: false, tipo: 'institucion' },
          { id: 'p2', titulo: 'Completar perfil y apoyos diarios', completado: true },
        ],
      },
      isLoading: false,
    } as never)

    renderWithProviders(<RutasPage />)

    expect(screen.getByRole('heading', { level: 1, name: /Mi Camino/i })).toBeInTheDocument()
    expect(screen.getByText('Mi ruta de autonomía')).toBeInTheDocument()
    expect(screen.getByText(/Meta final del camino:/i)).toBeInTheDocument()
    expect(screen.getByText('Lograr desplazamiento independiente en transporte público')).toBeInTheDocument()
    // Las actividades se ven directamente en la pantalla
    expect(screen.getByText('Acudir a terapia física y rehabilitación')).toBeInTheDocument()
    expect(screen.getByText('Completar perfil y apoyos diarios')).toBeInTheDocument()
    // Se muestra el botón para guiar en el sistema
    expect(screen.getByRole('button', { name: /Explorar Instituciones y Especialistas/i })).toBeInTheDocument()
  })

  it('guía al usuario al hacer clic en la acción de una actividad y permite marcarla como realizada', () => {
    const completarMutate = vi.fn().mockResolvedValue({})
    vi.mocked(useCompletarPaso).mockReturnValue({ mutateAsync: completarMutate, isPending: false } as never)

    mockRutas([
      { id: 'r1', nombre: 'Ruta Laboral', estado: 'activa', prioridad: 'media', areaInteres: 'empleo' },
    ])
    vi.mocked(useRutaDetail).mockReturnValue({
      data: {
        id: 'r1',
        nombre: 'Ruta Laboral',
        estado: 'activa',
        prioridad: 'media',
        areaInteres: 'empleo',
        pasos: [
          { id: 'p1', titulo: 'Explorar vacantes adaptadas y postularme', completado: false, tipo: 'empleo' },
        ],
      },
      isLoading: false,
    } as never)

    renderWithProviders(<RutasPage />)

    // Guiar en el sistema
    const btnGuiar = screen.getByRole('button', { name: /Explorar Oportunidades laborales/i })
    expect(btnGuiar).toBeInTheDocument()
    fireEvent.click(btnGuiar)
    expect(addToast).toHaveBeenCalledWith(expect.stringContaining('Oportunidades laborales'), 'info')

    // Marcar como realizada
    const btnCompletar = screen.getByRole('button', { name: /Marcar como realizada/i })
    fireEvent.click(btnCompletar)
    expect(completarMutate).toHaveBeenCalledWith('p1')
  })
})
