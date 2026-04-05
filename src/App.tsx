import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import LibraryPage from './pages/LibraryPage'
import UploadPage from './pages/UploadPage'
import UsersPage from './pages/UsersPage'
import OrganisationsPage from './pages/OrganisationsPage'
import OrgDetailPage from './pages/OrgDetailPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import SuperAdminRegisterPage from './pages/SuperAdminRegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import PrivilegedRoute from './components/PrivilegedRoute'
import SuperAdminRoute from './components/SuperAdminRoute'
import OrgUserRoute from './components/OrgUserRoute'
import { useAuth } from './contexts/AuthContext'

// After login, sends superadmin to /organisations, everyone else to /library
function DefaultRedirect() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={user?.role === 'superadmin' ? '/organisations' : '/library'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/superadmin-setup" element={<SuperAdminRegisterPage />} />

        {/* Protected dashboard */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Org-member routes — superadmin is redirected away */}
          <Route path="/library" element={<OrgUserRoute><LibraryPage /></OrgUserRoute>} />
          <Route path="/upload" element={<PrivilegedRoute><UploadPage /></PrivilegedRoute>} />
          <Route path="/users" element={<PrivilegedRoute><UsersPage /></PrivilegedRoute>} />

          {/* SuperAdmin only */}
          <Route path="/organisations" element={<SuperAdminRoute><OrganisationsPage /></SuperAdminRoute>} />
          <Route path="/organisations/:org" element={<SuperAdminRoute><OrgDetailPage /></SuperAdminRoute>} />
        </Route>

        {/* Catch-all — role-aware redirect */}
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
