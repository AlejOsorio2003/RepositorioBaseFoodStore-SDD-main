import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/auth.store'

const ADMIN_ROLES = ['ADMIN', 'STOCK', 'PEDIDOS']

interface AdminRouteProps {
  roles?: string[]
}

export function AdminRoute({ roles }: AdminRouteProps) {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const hasAdminAccess = user.roles.some((r) => ADMIN_ROLES.includes(r))
  if (!hasAdminAccess) {
    return <Navigate to="/" replace />
  }

  if (roles && roles.length > 0) {
    const hasRequiredRole = user.roles.some((r) => roles.includes(r))
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}
