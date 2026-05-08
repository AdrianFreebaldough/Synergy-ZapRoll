import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import RoleRoute from '../components/common/RoleRoute'
import LoginPage from '../pages/auth/LoginPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import StaffDashboardPage from '../pages/staff/StaffDashboardPage'
import ParticipantDashboardPage from '../pages/participant/ParticipantDashboardPage'
import HomePage from '../pages/landing/HomePage'
import UnauthorizedPage from '../pages/landing/UnauthorizedPage'
import CategoryRegistrationPage from '../pages/registration/CategoryRegistrationPage'
import { ROLES } from '../utils/roles'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/register/:category" element={<CategoryRegistrationPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboardPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.STAFF]}>
              <StaffDashboardPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/participant"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.PARTICIPANT]}>
              <ParticipantDashboardPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
