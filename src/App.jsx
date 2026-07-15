import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import ProtectedRoute from './components/ProtectedRoute'
import ToastContainer from './components/Toast'
import AccessibilityBar from './components/AccessibilityBar'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import ExplorePage from './pages/ExplorePage'
import SocialPage from './pages/SocialPage'
import FavoritesPage from './pages/FavoritesPage'
import InstitutionPage from './pages/InstitutionPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'
import TutorPage from './pages/TutorPage'
import JobsPage from './pages/JobsPage'
import AboutPage from './pages/AboutPage'

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
  }, [pathname])
  return null
}

export default function App() {
  const skipToMain = (e) => {
    e.preventDefault()
    const main = document.querySelector('main')
    if (main) { main.setAttribute('tabindex', '-1'); main.focus() }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouteFocus />
        <a href="#main" className="skip-link" onClick={skipToMain}>Saltar al contenido principal</a>
        <div id="a11y-root">
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
      </BrowserRouter>
    </QueryClientProvider>
  )
}
