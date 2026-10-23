import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useEventos, useCrearEvento, useToggleAsistenciaEvento } from '../hooks/useEventos'
import api from '@shared/lib/api'

vi.mock('@shared/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const apiMock = api as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useEventos hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('llama a GET /eventos con filtros limpios y normaliza la respuesta', async () => {
    const mockApiResponse = {
      data: {
        datos: [
          {
            id: 'ev-1',
            titulo: 'Taller de Pintura Inclusiva',
            categoria: 'cultural',
            modalidad: 'presencial',
            ciudad: 'Mérida',
            fechaInicio: '2026-11-10T10:00:00.000Z',
            cantidadAsistentes: 5,
            asisto: false,
          },
        ],
        meta: {
          total: 1,
          pagina: 1,
          limite: 12,
          totalPaginas: 1,
          tieneMas: false,
        },
      },
    }

    apiMock.get.mockResolvedValueOnce(mockApiResponse)

    const { result } = renderHook(
      () =>
        useEventos({
          pagina: 1,
          limite: 12,
          ciudad: 'Mérida',
          categoria: 'cultural',
          modalidad: 'presencial',
          buscar: 'pintura',
          proximos: true,
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiMock.get).toHaveBeenCalledWith('/eventos', {
      params: {
        pagina: 1,
        limite: 12,
        ciudad: 'Mérida',
        categoria: 'cultural',
        modalidad: 'presencial',
        buscar: 'pintura',
        proximos: true,
      },
    })

    expect(result.current.data?.datos).toHaveLength(1)
    expect(result.current.data?.datos[0].titulo).toBe('Taller de Pintura Inclusiva')
    expect(result.current.data?.meta.total).toBe(1)
  })

  it('crea un nuevo evento mediante useCrearEvento invocando POST /eventos', async () => {
    const payload = {
      titulo: 'Encuentro Deportivo Adaptado',
      categoria: 'deporte',
      modalidad: 'presencial' as const,
      fechaInicio: '2026-11-15T09:00:00.000Z',
      ciudad: 'Monterrey',
    }

    const mockResponse = {
      data: {
        id: 'ev-new',
        ...payload,
        cantidadAsistentes: 0,
      },
    }

    apiMock.post.mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useCrearEvento(), { wrapper: createWrapper() })

    await act(async () => {
      const res = await result.current.mutateAsync(payload)
      expect(res.id).toBe('ev-new')
    })

    expect(apiMock.post).toHaveBeenCalledWith('/eventos', payload)
  })

  it('alterna la asistencia a un evento mediante useToggleAsistenciaEvento invocando POST /eventos/:id/asistir', async () => {
    apiMock.post.mockResolvedValueOnce({
      data: { asistiendo: true, cantidadAsistentes: 6 },
    })

    const { result } = renderHook(() => useToggleAsistenciaEvento(), { wrapper: createWrapper() })

    await act(async () => {
      const res = await result.current.mutateAsync('ev-1')
      expect(res.asistiendo).toBe(true)
      expect(res.cantidadAsistentes).toBe(6)
    })

    expect(apiMock.post).toHaveBeenCalledWith('/eventos/ev-1/asistir')
  })
})
