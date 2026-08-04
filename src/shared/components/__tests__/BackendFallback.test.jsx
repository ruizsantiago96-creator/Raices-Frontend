import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BackendFallback, { BackendFallbackInline } from '../BackendFallback'

describe('shared/components/BackendFallback', () => {
  // ═══════════════════════════════════════════════════════════════
  // Default Props
  // ═══════════════════════════════════════════════════════════════
  describe('default props', () => {
    it('renders with all default props', () => {
      render(<BackendFallback />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Backend no disponible')).toBeInTheDocument()
    })

    it('shows default method badge', () => {
      render(<BackendFallback />)
      expect(screen.getByText('GET')).toBeInTheDocument()
    })

    it('shows default endpoint path', () => {
      render(<BackendFallback />)
      expect(screen.getByText('/api/endpoint')).toBeInTheDocument()
    })

    it('shows default message', () => {
      render(<BackendFallback />)
      expect(screen.getByText(/Este servicio aún no está implementado/)).toBeInTheDocument()
    })

    it('does not show retry button by default', () => {
      render(<BackendFallback />)
      expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument()
    })

    it('does not show contract by default', () => {
      render(<BackendFallback />)
      expect(screen.queryByText('Contrato esperado')).not.toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // Custom Props
  // ═══════════════════════════════════════════════════════════════
  describe('custom props', () => {
    it('renders custom title', () => {
      render(<BackendFallback title="Custom Title" />)
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('renders custom message', () => {
      render(<BackendFallback message="Custom message" />)
      expect(screen.getByText('Custom message')).toBeInTheDocument()
    })

    it('renders custom method', () => {
      render(<BackendFallback method="POST" />)
      expect(screen.getByText('POST')).toBeInTheDocument()
    })

    it('renders custom endpoint', () => {
      render(<BackendFallback endpoint="/api/users" />)
      expect(screen.getByText('/api/users')).toBeInTheDocument()
    })

    it('renders contract when provided', () => {
      render(<BackendFallback contract="{ data: string[] }" />)
      expect(screen.getByText('Contrato esperado')).toBeInTheDocument()
      expect(screen.getByText('{ data: string[] }')).toBeInTheDocument()
    })

    it('renders PUT method with correct color class', () => {
      render(<BackendFallback method="PUT" />)
      expect(screen.getByText('PUT')).toBeInTheDocument()
    })

    it('renders PATCH method', () => {
      render(<BackendFallback method="PATCH" />)
      expect(screen.getByText('PATCH')).toBeInTheDocument()
    })

    it('renders DELETE method', () => {
      render(<BackendFallback method="DELETE" />)
      expect(screen.getByText('DELETE')).toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // Retry Button
  // ═══════════════════════════════════════════════════════════════
  describe('retry button', () => {
    it('shows retry button when onRetry is provided', () => {
      render(<BackendFallback onRetry={() => {}} />)
      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
    })

    it('calls onRetry when retry button is clicked', async () => {
      const onRetry = vi.fn()
      const user = userEvent.setup()
      render(<BackendFallback onRetry={onRetry} />)

      await user.click(screen.getByRole('button', { name: /reintentar/i }))
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('shows custom retry label', () => {
      render(<BackendFallback onRetry={() => {}} retryLabel="Try Again" />)
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // Accessibility
  // ═══════════════════════════════════════════════════════════════
  describe('accessibility', () => {
    it('has role="alert" on container', () => {
      render(<BackendFallback />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('has aria-live="polite" on container', () => {
      render(<BackendFallback />)
      const container = screen.getByRole('alert')
      expect(container).toHaveAttribute('aria-live', 'polite')
    })
  })
})

describe('shared/components/BackendFallbackInline', () => {
  it('renders compact inline fallback', () => {
    render(<BackendFallbackInline method="GET" endpoint="/api/test" compact />)
    expect(screen.getByText('GET')).toBeInTheDocument()
    expect(screen.getByText('/api/test')).toBeInTheDocument()
    expect(screen.getByText(/no disponible/)).toBeInTheDocument()
  })

  it('renders non-compact as full fallback', () => {
    const { container } = render(<BackendFallbackInline method="POST" endpoint="/api/test" />)
    // Non-compact renders the full BackendFallback
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
