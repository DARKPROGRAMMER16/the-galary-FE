import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

// Allows editor and admin only — viewers and superadmins are redirected.
// Superadmin has their own /organisations flow and doesn't use /upload or /users.
export default function PrivilegedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user || user.role === 'viewer' || user.role === 'superadmin') {
    return <Navigate to="/library" replace />
  }
  return <>{children}</>
}
