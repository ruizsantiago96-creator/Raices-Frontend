import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function ProtectedRoute({ children, role }) {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/" replace />
  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />
  return children
}
