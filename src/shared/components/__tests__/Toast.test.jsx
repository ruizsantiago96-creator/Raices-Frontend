import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToastContainer from '../Toast'
import { useUiStore } from '../../stores/uiStore'

let idCounter = 0
beforeEach(() => {
  idCounter = 0
  vi.spyOn(Date, 'now').mockImplementation(() => ++idCounter)
  useUiStore.setState({ toasts: [] })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('shared/components/Toast', () => {
  // ═══════════════════════════════════════════════════════════════
  // Rendering
  // ═══════════════════════════════════════════════════════════════
  describe('rendering', () => {
    it('renders container with no toast children when empty', () => {
      const { container } = render(<ToastContainer />)
      // Container div is always rendered (for aria-live), but has no toast role children
      expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
      expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument()
    })

    it('renders a toast message', () => {
      act(() => { useUiStore.getState().addToast('Hello World') })
      render(<ToastContainer />)
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('renders multiple toasts', () => {
      act(() => {
        useUiStore.getState().addToast('First')
        useUiStore.getState().addToast('Second')
      })
      render(<ToastContainer />)
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // Accessibility
  // ═══════════════════════════════════════════════════════════════
  describe('accessibility', () => {
    it('container has aria-live="polite"', () => {
      act(() => { useUiStore.getState().addToast('Test') })
      render(<ToastContainer />)
      const container = screen.getByText('Test').closest('[aria-live]')
      expect(container).toHaveAttribute('aria-live', 'polite')
    })

    it('error toast has role="alert"', () => {
      act(() => { useUiStore.getState().addToast('Error!', 'error') })
      render(<ToastContainer />)
      expect(screen.getByRole('alert')).toHaveTextContent('Error!')
    })

    it('info toast has role="status"', () => {
      act(() => { useUiStore.getState().addToast('Info', 'info') })
      render(<ToastContainer />)
      expect(screen.getByRole('status')).toHaveTextContent('Info')
    })

    it('success toast has role="status"', () => {
      act(() => { useUiStore.getState().addToast('Done!', 'success') })
      render(<ToastContainer />)
      expect(screen.getByRole('status')).toHaveTextContent('Done!')
    })

    it('warning toast has role="status"', () => {
      act(() => { useUiStore.getState().addToast('Watch out', 'warning') })
      render(<ToastContainer />)
      expect(screen.getByRole('status')).toHaveTextContent('Watch out')
    })

    it('dismiss button has accessible label', () => {
      act(() => { useUiStore.getState().addToast('Test') })
      render(<ToastContainer />)
      const closeBtn = screen.getByRole('button', { name: /cerrar notificación/i })
      expect(closeBtn).toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // Dismiss
  // ═══════════════════════════════════════════════════════════════
  describe('dismiss', () => {
    it('removes toast when close button is clicked', async () => {
      const user = userEvent.setup()
      act(() => { useUiStore.getState().addToast('Dismissible') })
      render(<ToastContainer />)

      const closeBtn = screen.getByRole('button', { name: /cerrar notificación/i })
      await user.click(closeBtn)

      expect(screen.queryByText('Dismissible')).not.toBeInTheDocument()
    })

    it('removes only the clicked toast, not others', async () => {
      const user = userEvent.setup()
      act(() => {
        useUiStore.getState().addToast('Keep me')
        useUiStore.getState().addToast('Remove me')
      })
      render(<ToastContainer />)

      const closeButtons = screen.getAllByRole('button', { name: /cerrar notificación/i })
      // Click the second toast's close button (index 1)
      await user.click(closeButtons[1])

      expect(screen.getByText('Keep me')).toBeInTheDocument()
      expect(screen.queryByText('Remove me')).not.toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // Styling / Visual
  // ═══════════════════════════════════════════════════════════════
  describe('styling', () => {
    it('container is fixed position at bottom-left', () => {
      act(() => { useUiStore.getState().addToast('Styled') })
      render(<ToastContainer />)
      const container = screen.getByText('Styled').closest('[aria-live]')
      expect(container.style.position).toBe('fixed')
      expect(container.style.bottom).toBe('24px')
      expect(container.style.left).toBe('24px')
    })
  })
})
