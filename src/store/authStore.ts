import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const ADMIN_PERMISSIONS = {
  READ: 'read',
  OVERVIEW: 'overview',
  USERS: 'users',
  MECHANICS: 'mechanics',
  BOOKINGS: 'bookings',
  PAYMENTS: 'payments',
  COMPLAINTS: 'complaints',
  ADMINS: 'admins',
  AUDIT: 'audit',
} as const

export type PermissionKey = (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS]

type User = { id: string; email: string; role: string; adminPermissions?: string[] | null }

type AuthState = {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'admin-auth' },
  ),
)

export function hasAdminPermission(user: User | null, ...required: PermissionKey[]) {
  if (!user || user.role !== 'ADMIN') return false
  if (!required.length) return true
  const perms = user.adminPermissions
  if (!Array.isArray(perms) || perms.length === 0) return true
  return required.some((p) => perms.includes(p))
}
