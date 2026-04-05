import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import LibraryPage from './pages/LibraryPage'
import UploadPage from './pages/UploadPage'
import UsersPage from './pages/UsersPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import ProtectedRoute from './components/ProtectedRoute'
import PrivilegedRoute from './components/PrivilegedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected dashboard */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/library" element={<LibraryPage />} />
          <Route
            path="/upload"
            element={
              <PrivilegedRoute>
                <UploadPage />
              </PrivilegedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivilegedRoute>
                <UsersPage />
              </PrivilegedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/library" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
