import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

// Allows viewer, editor, admin — redirects superadmin to their home (/organisations).
export default function OrgUserRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (user?.role === 'superadmin') return <Navigate to="/organisations" replace />
  return <>{children}</>
}
