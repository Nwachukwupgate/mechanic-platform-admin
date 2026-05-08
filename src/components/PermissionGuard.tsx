import { Navigate } from 'react-router-dom'
import { ADMIN_PERMISSIONS, hasAdminPermission, type PermissionKey, useAuthStore } from '../store/authStore'

export function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  if (!token || !user || user.role !== 'ADMIN') return <Navigate to="/login" replace />
  return <>{children}</>
}

export function PermissionGuard({
  permission,
  children,
  fallbackPath = '/dashboard',
}: {
  permission: PermissionKey
  children: React.ReactNode
  fallbackPath?: string
}) {
  const user = useAuthStore((s) => s.user)
  if (!hasAdminPermission(user, permission)) return <Navigate to={fallbackPath} replace />
  return <>{children}</>
}

export function canAccess(permission: PermissionKey) {
  return hasAdminPermission(useAuthStore.getState().user, permission)
}

export { ADMIN_PERMISSIONS }
