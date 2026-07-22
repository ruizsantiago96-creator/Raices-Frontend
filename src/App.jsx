import { useEffect } from 'react'
import { useSessionVerify } from '@features/auth'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { initScrollReveal } from '@shared/lib/scrollReveal'
import { queryClient } from '@shared/lib/queryClient'
import { ProtectedRoute } from '@features/auth'
import ToastContainer from '@shared/components/Toast'
import { AccessibilityBar } from '@features/a11y'
import LandingPage from '@features/landing/pages/LandingPage'
import AuthPage from '@features/auth/pages/AuthPage'
import OnboardingPage from '@features/profile/pages/OnboardingPage'
import DashboardPage from '@features/dashboard/pages/DashboardPage'
import ExplorePage from '@features/institutions/pages/ExplorePage'
import SocialPage from '@features/social/pages/SocialPage'
import FavoritesPage from '@features/favorites/pages/FavoritesPage'
import InstitutionPage from '@features/institutions/pages/InstitutionPage'
import AdminPage from '@features/admin/pages/AdminPage'
import ProfilePage from '@features/profile/pages/ProfilePage'
import TutorPage from '@features/tutor/pages/TutorPage'
import JobsPage from '@features/jobs/pages/JobsPage'
import AboutPage from '@features/about/pages/AboutPage'
import DesignPreview from '@features/landing/pages/DesignPreview'

/** Al cambiar de ruta, lleva el foco al contenido principal y sube el scroll
    — clave para que los lectores de pantalla anuncien la nueva página. */
function RouteFocus() {
  const { pathname } = useLocation()
  useEffect(() => {
    const main = document.querySelector('main')
    if (main) {
      main.setAttribute('tabindex', '-1')
      main.focus({ preventScroll: true })
    }
    window.scrollTo({ top: 0, left: 0 })
    // Init scroll reveal on route change
    requestAnimationFrame(() => initScrollReveal())
  }, [pathname])
  return null
}

/**
 * Pantalla de carga mostrada mientras se verifica la sesión del usuario
 * al iniciar la aplicación o al recargar la página.
 */
function SessionLoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid #e2e8f0',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ marginTop: 16, color: '#64748b', fontSize: 14 }}>
        Verificando sesión...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/**
 * Pantalla mostrada cuando la verificación de sesión falla.
 * Ofrece un botón para ir al login.
 */
function SessionErrorScreen({ error }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        padding: 24,
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 12,
        maxWidth: 400,
        textAlign: 'center',
      }}>
        <p style={{ color: '#991b1b', fontSize: 14, marginBottom: 16 }}>
          {error}
        </p>
        <a
          href="/auth"
          style={{
            display: 'inline-block',
            padding: '8px 24px',
            backgroundColor: '#6366f1',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Iniciar sesión
        </a>
      </div>
    </div>
  )
}

export default function App() {
  const { isChecking, error } = useSessionVerify()

  const skipToMain = (e) => {
    e.preventDefault()
    const main = document.querySelector('main')
    if (main) { main.setAttribute('tabindex', '-1'); main.focus() }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Pantalla de carga mientras se verifica la sesión */}
        {isChecking && <SessionLoadingScreen />}
        {/* Pantalla de error si la verificación falló */}
        {!isChecking && error && <SessionErrorScreen error={error} />}
        {/* Rutas de la aplicación (solo se renderizan cuando no hay carga ni error) */}
        {!isChecking && !error && (
          <>
            <RouteFocus />
            <a href="#main" className="skip-link" onClick={skipToMain}>Saltar al contenido principal</a>
            <div id="a11y-root">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/design-preview" element={<DesignPreview />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/social" element={<ProtectedRoute><SocialPage /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                <Route path="/institution/:id" element={<ProtectedRoute><InstitutionPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/familia" element={<ProtectedRoute><TutorPage /></ProtectedRoute>} />
                <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
                <Route path="/institution-portal" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <ToastContainer />
            <AccessibilityBar />
          </>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  )
}
