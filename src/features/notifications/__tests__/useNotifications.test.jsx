import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@test/renderWithProviders'
import { useNotifications, useMarkRead, useMarkAllRead } from '../hooks/useNotifications'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'

// Mock API
vi.mock('@shared/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

// Mock notification stream
vi.mock('../lib/notificationStream', () => ({
  setActiveEventSource: vi.fn(),
  closeNotificationStream: vi.fn(),
  isStreamSuspended: vi.fn(() => false),
}))

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({
    token: 'test-token',
    user: { id: '1', role: 'pcd', full_name: 'Test User' },
  })
})

function TestComponent() {
  const { data, isLoading, isError } = useNotifications()
  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error</div>
  return (
    <div>
      <span data-testid="count">{data?.length ?? 0}</span>
      {data?.map(n => (
        <div key={n.id} data-testid={`notif-${n.id}`}>
          <span>{n.title}</span>
          <span>{n.body}</span>
        </div>
      ))}
    </div>
  )
}

describe('features/notifications/hooks/useNotifications', () => {
  describe('useNotifications', () => {
    it('fetches and normalizes notifications', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [
          { id: '1', titulo: 'Test', mensaje: 'Body text', leido: false, tipo: 'info', fecha: '2026-01-01' },
        ],
      })

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1')
      })

      expect(screen.getByText('Test')).toBeInTheDocument()
      expect(screen.getByText('Body text')).toBeInTheDocument()
    })

    it('handles empty response', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [] })

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('0')
      })
    })

    it('normalizes Spanish field names', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [
          { id: '1', titulo: 'Hola', mensaje: 'Mundo', leido: true, tipo: 'success' },
        ],
      })

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByText('Hola')).toBeInTheDocument()
        expect(screen.getByText('Mundo')).toBeInTheDocument()
      })
    })

    it('detects notification URL from title keywords', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [
          { id: '1', titulo: 'Nueva vacante de empleo disponible', mensaje: '' },
        ],
      })

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1')
      })
    })

    it('does not make API call when there is no token', async () => {
      useAuthStore.setState({ token: null, user: null })

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('0')
      })

      expect(api.get).not.toHaveBeenCalled()
    })
  })

  describe('useMarkRead', () => {
    it('calls PATCH endpoint to mark notification as read', async () => {
      vi.mocked(api.patch).mockResolvedValue({ data: { exito: true } })
      const user = userEvent.setup()

      function MarkReadButton() {
        const { mutate } = useMarkRead()
        return <button onClick={() => mutate('123')}>Mark Read</button>
      }

      renderWithProviders(<MarkReadButton />)
      await user.click(screen.getByText('Mark Read'))

      expect(api.patch).toHaveBeenCalledWith('/notificaciones/123/leer')
    })
  })

  describe('useMarkAllRead', () => {
    it('calls PATCH endpoint to mark all notifications as read', async () => {
      vi.mocked(api.patch).mockResolvedValue({ data: { exito: true } })
      const user = userEvent.setup()

      function MarkAllButton() {
        const { mutate } = useMarkAllRead()
        return <button onClick={() => mutate()}>Mark All</button>
      }

      renderWithProviders(<MarkAllButton />)
      await user.click(screen.getByText('Mark All'))

      expect(api.patch).toHaveBeenCalledWith('/notificaciones/leer-todas')
    })
  })
})
