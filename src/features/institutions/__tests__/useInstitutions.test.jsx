import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@test/renderWithProviders'
import { useInstitutions } from '../hooks/useInstitutions'
import api from '@shared/lib/api'

vi.mock('@shared/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function InstitutionsTestComponent({ filters = {} }) {
  const { data, isLoading, isError } = useInstitutions(filters)
  if (isLoading) return <div data-testid="loading">Loading...</div>
  if (isError) return <div data-testid="error">Error</div>
  const items = Array.isArray(data) ? data : []
  return (
    <div>
      <span data-testid="count">{items.length}</span>
      {items.map(inst => (
        <div key={inst.id} data-testid={`inst-${inst.id}`}>
          <span>{inst.name ?? inst.nombre}</span>
          <span>{inst.category ?? inst.categoria}</span>
        </div>
      ))}
    </div>
  )
}

describe('features/institutions/hooks/useInstitutions', () => {
  it('fetches institutions list', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        datos: [
          { id: 'i1', nombre: 'Centro de Salud', categoria: 'funcional', ciudad: 'CDMX' },
        ],
        total: 1,
        paginas: 1,
      },
    })

    renderWithProviders(<InstitutionsTestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })

    expect(screen.getByText('Centro de Salud')).toBeInTheDocument()
    expect(screen.getByText('funcional')).toBeInTheDocument()
  })

  it('handles empty results', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { datos: [] },
    })

    renderWithProviders(<InstitutionsTestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('0')
    })
  })

  it('passes filters to the API call', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { datos: [] },
    })

    renderWithProviders(<InstitutionsTestComponent filters={{ busqueda: 'salud', categoria: 'funcional' }} />)

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled()
    })

    const callUrl = vi.mocked(api.get).mock.calls[0][0]
    expect(callUrl).toContain('/instituciones')
  })

  it('handles pagination parameters', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { datos: [], total: 50, paginas: 5 },
    })

    renderWithProviders(<InstitutionsTestComponent filters={{ pagina: 2, limite: 10 }} />)

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled()
    })
  })
})
