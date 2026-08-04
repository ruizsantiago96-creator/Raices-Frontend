import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@test/renderWithProviders'
import { useDependientes, useAddDependiente, useDeleteDependent } from '../hooks/useDependientes'
import userEvent from '@testing-library/user-event'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'

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
  useAuthStore.setState({
    token: 'test-token',
    user: { id: '1', role: 'tutor', full_name: 'Tutor User' },
  })
})

function DependientesTestComponent() {
  const { data, isLoading, isError } = useDependientes()
  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error</div>
  return (
    <div>
      <span data-testid="count">{data?.length ?? 0}</span>
      {data?.map(d => (
        <div key={d.id} data-testid={`dep-${d.id}`}>
          <span>{d.nombreCompleto}</span>
          <span>{d.parentesco}</span>
        </div>
      ))}
    </div>
  )
}

describe('features/tutor/hooks/useDependientes', () => {
  describe('useDependientes', () => {
    it('fetches dependientes list', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [
          { id: 'd1', nombreCompleto: 'Juan', parentesco: 'Hijo/a', etapaVida: 'infancia', necesidades: [] },
        ],
      })

      renderWithProviders(<DependientesTestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1')
      })

      expect(screen.getByText('Juan')).toBeInTheDocument()
      expect(screen.getByText('Hijo/a')).toBeInTheDocument()
    })

    it('handles empty list', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [] })

      renderWithProviders(<DependientesTestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('0')
      })
    })

    it('does not fetch when there is no token', async () => {
      useAuthStore.setState({ token: null })

      renderWithProviders(<DependientesTestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('0')
      })

      expect(api.get).not.toHaveBeenCalled()
    })
  })

  describe('useCrearDependiente', () => {
    it('creates a dependiente via POST', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { id: 'd2', nombreCompleto: 'Maria', parentesco: 'Hermano/a' },
      })

      function CreateButton() {
        const { mutate } = useAddDependiente()
        return (
          <button onClick={() => mutate({ nombreCompleto: 'Maria', parentesco: 'Hermano/a', etapaVida: 'infancia', necesidades: [] })}>
            Create
          </button>
        )
      }

      const user = userEvent.setup()
      renderWithProviders(<CreateButton />)
      await user.click(screen.getByText('Create'))

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/usuarios/dependientes', expect.objectContaining({
          nombreCompleto: 'Maria',
          parentesco: 'Hermano/a',
        }))
      })
    })
  })

  describe('useEliminarDependiente', () => {
    it('deletes a dependiente via DELETE', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: { exito: true } })

      function DeleteButton() {
        const { mutate } = useDeleteDependent()
        return <button onClick={() => mutate('d1')}>Delete</button>
      }

      const user = userEvent.setup()
      renderWithProviders(<DeleteButton />)
      await user.click(screen.getByText('Delete'))

      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith('/usuarios/dependientes/d1')
      })
    })
  })
})
