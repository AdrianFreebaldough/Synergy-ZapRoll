import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { authState } = useAuth()

  if (!authState?.token) {
    return <Navigate to="/auth/login" replace />
  }

  return children
}
