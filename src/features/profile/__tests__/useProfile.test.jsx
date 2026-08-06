import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@test/renderWithProviders'
import { useProfile, useUpdateProfile, useSaveProfiling } from '../hooks/useProfile'
import userEvent from '@testing-library/user-event'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'

vi.mock('@shared/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({
    token: 'test-token',
    user: { id: '1', role: 'pcd', full_name: 'Test User' },
  })
})

function ProfileTestComponent() {
  const { data, isLoading, isError, error } = useProfile()
  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error: {error?.message}</div>
  return (
    <div>
      <span data-testid="name">{data?.nombreCompleto ?? 'N/A'}</span>
      <span data-testid="email">{data?.email ?? 'N/A'}</span>
      <span data-testid="rol">{data?.rol ?? 'N/A'}</span>
    </div>
  )
}

describe('features/profile/hooks/useProfile', () => {
  describe('useProfile', () => {
    it('fetches profile data', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: {
          nombreCompleto: 'Test User',
          email: 'test@test.com',
          rol: 'pcd',
          ciudad: 'CDMX',
        },
      })

      renderWithProviders(<ProfileTestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveTextContent('Test User')
      })

      expect(screen.getByTestId('email')).toHaveTextContent('test@test.com')
      expect(api.get).toHaveBeenCalledWith('/usuarios/perfil')
    })

    it('does not fetch when there is no token', async () => {
      useAuthStore.setState({ token: null })

      renderWithProviders(<ProfileTestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveTextContent('N/A')
      })

      expect(api.get).not.toHaveBeenCalled()
    })

    it('handles API error gracefully', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'))

      renderWithProviders(<ProfileTestComponent />)

      await waitFor(() => {
        expect(screen.getByText(/Error/)).toBeInTheDocument()
      })
    })
  })

  describe('useUpdateProfile', () => {
    it('updates profile via PUT', async () => {
      vi.mocked(api.put).mockResolvedValue({ data: { nombreCompleto: 'Updated' } })

      function UpdateButton() {
        const { mutate } = useUpdateProfile()
        return <button onClick={() => mutate({ nombreCompleto: 'Updated' })}>Update</button>
      }

      const user = userEvent.setup()
      renderWithProviders(<UpdateButton />)
      await user.click(screen.getByText('Update'))

      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith('/usuarios/perfil', { nombreCompleto: 'Updated' })
      })
    })
  })

  describe('useSaveProfiling', () => {
    it('saves profiling data via POST', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { exito: true } })

      function SaveButton() {
        const { mutate } = useSaveProfiling()
        return <button onClick={() => mutate({ needs: ['test'] })}>Save</button>
      }

      const user = userEvent.setup()
      renderWithProviders(<SaveButton />)
      await user.click(screen.getByText('Save'))

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/usuarios/perfil-necesidades', {
          tiposDiscapacidad: [],
          severidadDiscapacidad: null,
          modosComunicacion: [],
          necesidadesMovilidad: [],
          accesoTecnologia: [],
          zonasPreferidas: [],
          necesidades: ['test'],
          metasActuales: [],
          areasApoyo: [],
          historialEducacion: [],
          historialTerapia: [],
          etapaVida: null,
          preocupacionesActuales: null,
          nivelApoyo: null,
          edad: null,
          experienciaLaboral: null,
          experienciaSocial: null,
          fechaNacimiento: null,
        })
      })
    })
  })
})
