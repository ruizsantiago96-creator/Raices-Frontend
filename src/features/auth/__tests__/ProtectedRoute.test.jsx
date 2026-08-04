import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuthStore } from '../store/authStore'

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null, refreshToken: null })
})

function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>
  )
}

describe('features/auth/components/ProtectedRoute', () => {
  describe('unauthenticated (no token)', () => {
    it('redirects to "/" when no token', () => {
      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { route: '/protected' }
      )
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('does not render children when no token', () => {
      renderWithRouter(
        <ProtectedRoute>
          <div>Secret</div>
        </ProtectedRoute>,
        { route: '/secret' }
      )
      expect(screen.queryByText('Secret')).not.toBeInTheDocument()
    })
  })

  describe('authenticated (has token)', () => {
    beforeEach(() => {
      useAuthStore.setState({
        token: 'valid-token',
        user: { id: '1', role: 'pcd', full_name: 'Test User' },
      })
    })

    it('renders children when token is present', () => {
      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { route: '/protected' }
      )
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('does not redirect when token is present', () => {
      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { route: '/protected' }
      )
      expect(screen.queryByText('Home')).not.toBeInTheDocument()
    })
  })

  describe('role-based access', () => {
    beforeEach(() => {
      useAuthStore.setState({
        token: 'valid-token',
        user: { id: '1', role: 'pcd', full_name: 'Test User' },
      })
    })

    it('renders children when role matches', () => {
      renderWithRouter(
        <ProtectedRoute role="pcd">
          <div>PCD Content</div>
        </ProtectedRoute>,
        { route: '/pcd-page' }
      )
      expect(screen.getByText('PCD Content')).toBeInTheDocument()
    })

    it('redirects to /dashboard when role does not match', () => {
      renderWithRouter(
        <ProtectedRoute role="admin">
          <div>Admin Content</div>
        </ProtectedRoute>,
        { route: '/admin-page' }
      )
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    })

    it('redirects to /dashboard for tutor role when expecting pcd', () => {
      useAuthStore.setState({
        user: { id: '2', role: 'tutor', full_name: 'Tutor User' },
      })
      renderWithRouter(
        <ProtectedRoute role="pcd">
          <div>PCD Content</div>
        </ProtectedRoute>,
        { route: '/pcd-page' }
      )
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('renders children when no role is specified (any authenticated user)', () => {
      renderWithRouter(
        <ProtectedRoute>
          <div>Any Role Content</div>
        </ProtectedRoute>,
        { route: '/any' }
      )
      expect(screen.getByText('Any Role Content')).toBeInTheDocument()
    })

    it('allows admin role to access admin route', () => {
      useAuthStore.setState({
        user: { id: '3', role: 'admin', full_name: 'Admin User' },
      })
      renderWithRouter(
        <ProtectedRoute role="admin">
          <div>Admin Content</div>
        </ProtectedRoute>,
        { route: '/admin' }
      )
      expect(screen.getByText('Admin Content')).toBeInTheDocument()
    })

    it('allows institution role to access institution route', () => {
      useAuthStore.setState({
        user: { id: '4', role: 'institution', full_name: 'Institution User' },
      })
      renderWithRouter(
        <ProtectedRoute role="institution">
          <div>Institution Content</div>
        </ProtectedRoute>,
        { route: '/inst' }
      )
      expect(screen.getByText('Institution Content')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('redirects to "/" when token is empty string', () => {
      useAuthStore.setState({ token: '' })
      renderWithRouter(
        <ProtectedRoute>
          <div>Content</div>
        </ProtectedRoute>,
        { route: '/protected' }
      )
      expect(screen.getByText('Home')).toBeInTheDocument()
    })

    it('redirects when user is null but token exists', () => {
      useAuthStore.setState({ token: 'token', user: null })
      renderWithRouter(
        <ProtectedRoute role="pcd">
          <div>Content</div>
        </ProtectedRoute>,
        { route: '/protected' }
      )
      // Should redirect to /dashboard because user.role is undefined !== 'pcd'
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })
})
