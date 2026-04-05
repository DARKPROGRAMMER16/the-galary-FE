import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

// Allows editor and admin; redirects viewers back to /library
export default function PrivilegedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user || user.role === 'viewer') return <Navigate to="/library" replace />
  return <>{children}</>
}
