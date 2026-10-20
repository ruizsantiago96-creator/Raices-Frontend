import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useFeedMixto } from '../hooks/useCommunity'
import api from '@shared/lib/api'

vi.mock('@shared/lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

const apiMock = api as unknown as {
  get: ReturnType<typeof vi.fn>
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useFeedMixto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('llama a GET /comunidad/feed-mixto con los parámetros correctos y retorna los items combinados', async () => {
    const mockResponse = {
      items: [
        {
          tipo: 'publicacion',
          id: 'pub-1',
          titulo: 'Hola comunidad',
          contenido: 'Hola a todos',
          autor: 'Carlos López',
          autorId: 'u-1',
          fuenteRuta: false,
        },
        {
          tipo: 'institucion',
          id: 'inst-1',
          titulo: 'Centro de Rehabilitación Integral',
          categoria: 'funcional',
          categoriaLabel: 'Desarrollo Funcional',
          distancia: 'en tu ciudad',
          fuenteRuta: true,
          pasoActualTitulo: 'Evaluación inicial',
        },
        {
          tipo: 'vacante',
          id: 'vac-1',
          titulo: 'Auxiliar Administrativo',
          modalidad: 'presencial',
          ciudad: 'Mérida',
          fuenteRuta: true,
          pasoActualTitulo: 'Integración laboral',
        },
      ],
      pagina: 1,
      limite: 12,
      total: 3,
      totalPublicaciones: 1,
      totalEntidades: 2,
    }

    apiMock.get.mockResolvedValueOnce({ data: mockResponse })

    const { result } = renderHook(() => useFeedMixto({ pagina: 1, limite: 12 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiMock.get).toHaveBeenCalledWith('/comunidad/feed-mixto', {
      params: {},
    })

    expect(result.current.data?.items).toHaveLength(3)
    expect(result.current.data?.items[0].tipo).toBe('publicacion')
    expect(result.current.data?.items[1].tipo).toBe('institucion')
    expect(result.current.data?.items[2].tipo).toBe('vacante')
    expect(result.current.data?.totalPublicaciones).toBe(1)
    expect(result.current.data?.totalEntidades).toBe(2)
  })

  it('no ejecuta la query si enabled es false', async () => {
    const { result } = renderHook(() => useFeedMixto({ enabled: false }), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(apiMock.get).not.toHaveBeenCalled()
  })
})
