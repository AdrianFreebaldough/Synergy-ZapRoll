import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function RoleRoute({ allowedRoles, children }) {
  const { authState } = useAuth()

  if (!allowedRoles.includes(authState?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
