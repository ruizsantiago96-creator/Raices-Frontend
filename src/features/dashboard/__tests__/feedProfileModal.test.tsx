import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

vi.mock('@shared/lib/api', () => ({ default: mockApi }))
vi.mock('@features/notifications', () => ({
  closeNotificationStream: vi.fn(),
  suspendStream: vi.fn(),
  resumeStream: vi.fn(),
}))

import FeedPage from '../pages/FeedPage'
import { useAuthStore, } from '@features/auth/store/authStore'
import { useOnboardingStatus, fetchOnboardingStatus } from '@features/institutions/hooks/useRecommendations'
import { preloadSessionState } from '@features/auth/hooks/useAuth'
import { queryClient as singletonClient } from '@shared/lib/queryClient'

const ONBOARDING_INCOMPLETO = {
  onboardingCompleto: false,
  porcentajeProgreso: 33,
  porcentaje: 33,
  ultimoPasoCompletado: 2,
  pasosPendientes: ['datosIdentidad', 'perfilNecesidades'],
  seccionesFaltantes: [],
  destinatarioPerfil: 'PARA_MI',
  nombrePcd: null,
}

const RESPUESTAS: Record<string, unknown> = {
  '/onboarding/estado': ONBOARDING_INCOMPLETO,
  '/usuarios/onboarding': ONBOARDING_INCOMPLETO,
  '/usuarios/estado-validacion-identidad': { estado: 'no_subido' },
  '/autenticacion/yo': { id: 'u1', email: 'ana@example.com', rol: 'pcd', nombreCompleto: 'Ana Pérez', verificado: false, features: {} },
  '/usuarios/perfil': { id: 'u1', email: 'ana@example.com', rol: 'pcd', nombreCompleto: 'Ana Pérez', features: {} },
  '/usuarios/recomendaciones': { datos: [] },
  '/usuarios/especialistas': { datos: [] },
  '/instituciones': { datos: [] },
  '/publicaciones': [],
  '/foros': { foros: [] },
}

let failAuth = false

function installApiMock() {
  mockApi.get.mockImplementation((url: string) => {
    if (failAuth) return Promise.reject({ response: { status: 401 } })
    if (RESPUESTAS[url] !== undefined) return Promise.resolve({ data: RESPUESTAS[url] })
    return Promise.resolve({ data: {} })
  })
  mockApi.post.mockResolvedValue({ data: {} })
  mockApi.put.mockResolvedValue({ data: {} })
  mockApi.delete.mockResolvedValue({ data: {} })
}

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 5 * 60 * 1000 } },
  })
}

function Wrapper({ client, children }: { client: QueryClient; children: ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/feed']}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

const autoLogin = () => {
  act(() => {
    useAuthStore.getState().setAuth(
      'tk-auto',
      { id: 'u1', email: 'ana@example.com', role: 'pcd', full_name: 'Ana Pérez' } as never,
      null,
      true,
    )
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  failAuth = false
  installApiMock()
  useAuthStore.setState({ token: null, user: null, refreshToken: null })
})

afterEach(() => {
  singletonClient.removeQueries({ queryKey: ['me'] })
  singletonClient.removeQueries({ queryKey: ['profile'] })
  singletonClient.removeQueries({ queryKey: ['onboarding-status'] })
  singletonClient.removeQueries({ queryKey: ['documento-identidad'] })
})

describe('Modal "Completa tu perfil" en el Feed tras auto-login', () => {
  it('A) con sesión creada por registro + datos de onboarding, el modal renderiza', async () => {
    autoLogin()

    const client = makeClient()
    render(<Wrapper client={client}><FeedPage /></Wrapper>)

    await waitFor(() => expect(document.querySelector('main')).toBeTruthy(), { timeout: 5000 })
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument(), { timeout: 5000 })
    expect(screen.getByText('Completa tu perfil')).toBeInTheDocument()
  }, 20000)

  it('B) sin sesión NO se consulta ni se cachea estado de onboarding (evita el "{}" que oculta el modal)', async () => {
    failAuth = true
    const client = makeClient()
    function PreAuth() {
      const { data, isFetching } = useOnboardingStatus()
      return <div data-testid="preauth">{isFetching ? 'fetching' : data ? 'data' : 'idle'}</div>
    }
    const first = render(<Wrapper client={client}><PreAuth /></Wrapper>)

    // Sin token: la query queda deshabilitada → ningún request, ninguna caché vacía
    await waitFor(() => expect(screen.getByTestId('preauth').textContent).toBe('idle'), { timeout: 3000 })
    expect(mockApi.get).not.toHaveBeenCalledWith('/onboarding/estado')
    expect(client.getQueryData(['onboarding-status', false])).toBeUndefined()
    first.unmount()

    // Con sesión, el Feed sí debe mostrar el modal
    failAuth = false
    autoLogin()
    render(<Wrapper client={client}><FeedPage /></Wrapper>)

    await waitFor(() => expect(document.querySelector('main')).toBeTruthy(), { timeout: 5000 })
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument(), { timeout: 5000 })
    expect(screen.getByText('Completa tu perfil')).toBeInTheDocument()
  }, 20000)

  it('C) setAuth invalida las cachés de sesión (perfil/onboarding) al crear la sesión', async () => {
    singletonClient.setQueryData(['onboarding-status', false], { camposFaltantes: [] })
    singletonClient.setQueryData(['me'], { id: 'anterior' })

    autoLogin()

    expect(singletonClient.getQueryState(['onboarding-status', false])?.isInvalidated).toBe(true)
    expect(singletonClient.getQueryState(['me'])?.isInvalidated).toBe(true)
  }, 20000)

  it('D) preloadSessionState trae perfil y progreso de onboarding ANTES de redirigir', async () => {
    const client = makeClient()

    await preloadSessionState(client, { rol: 'pcd' })

    expect(client.getQueryData(['me'])).toMatchObject({ id: 'u1' })
    expect(client.getQueryData(['onboarding-status', false])).toMatchObject({
      onboardingCompleto: false,
      porcentajeProgreso: 33,
      camposFaltantes: ['datosIdentidad', 'perfilNecesidades'],
    })
  }, 20000)

  it('E) si el backend falla por completo, no se cachea un estado vacío como si fuera válido', async () => {
    failAuth = true
    await expect(fetchOnboardingStatus({ rol: 'pcd' })).rejects.toBeTruthy()
  }, 20000)

  it('F) "Más tarde" solo oculta en la vista activa: al remontar el Feed el modal vuelve a aparecer', async () => {
    autoLogin()

    const client = makeClient()
    const first = render(<Wrapper client={client}><FeedPage /></Wrapper>)

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument(), { timeout: 5000 })

    // El usuario cierra con "Más tarde": debe ocultarse solo en esta vista
    fireEvent.click(screen.getByRole('button', { name: 'Más tarde' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 5000 })

    // Salir y volver al Feed (remontar el componente): el modal reaparece,
    // porque la bandera de descarte vive solo en memoria y no persiste
    first.unmount()
    render(<Wrapper client={client}><FeedPage /></Wrapper>)

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument(), { timeout: 5000 })
    expect(screen.getByText('Completa tu perfil')).toBeInTheDocument()
  }, 20000)

  it('G) una bandera residual de onboarding en localStorage NO oculta el modal (la validación es del backend)', async () => {
    localStorage.setItem('raices_onboarding_completed_pcd', 'true')
    localStorage.setItem('raices_onboarding_completed_tutor', 'true')

    try {
      autoLogin()
      const client = makeClient()
      render(<Wrapper client={client}><FeedPage /></Wrapper>)

      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument(), { timeout: 5000 })
      expect(screen.getByText('Completa tu perfil')).toBeInTheDocument()
    } finally {
      localStorage.removeItem('raices_onboarding_completed_pcd')
      localStorage.removeItem('raices_onboarding_completed_tutor')
    }
  }, 20000)
})
