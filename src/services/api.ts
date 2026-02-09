import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error || typeof error !== 'object') return fallback
  const ax = error as { response?: { data?: { message?: string | string[] }; status?: number }; message?: string }
  const data = ax.response?.data
  const msg = data?.message
  if (Array.isArray(msg) && msg.length) return msg.join('. ')
  if (typeof msg === 'string') return msg
  if (ax.response?.status === 401) return 'Session expired. Please log in again.'
  if (ax.response?.status === 403) return 'Access denied.'
  return (ax.message as string) || fallback
}

export const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export const adminAPI = {
  login: (email: string, password: string) => api.post<{ access_token: string; user: { id: string; email: string; role: string } }>('/auth/login/admin', { email, password }),
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: { page?: number; limit?: number; search?: string; emailVerified?: boolean }) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  getMechanics: (params?: { page?: number; limit?: number; search?: string; isVerified?: boolean }) => api.get('/admin/mechanics', { params }),
  getMechanic: (id: string) => api.get(`/admin/mechanics/${id}`),
  setMechanicVerified: (id: string, isVerified: boolean) => api.patch(`/admin/mechanics/${id}/verify`, { isVerified }),
  getBookings: (params?: { page?: number; limit?: number; status?: string; userId?: string; mechanicId?: string; dateFrom?: string; dateTo?: string; hasDispute?: boolean }) => api.get('/admin/bookings', { params }),
  getBooking: (id: string) => api.get(`/admin/bookings/${id}`),
  setBookingDispute: (id: string, body: { disputeReason?: string; resolve?: boolean }) => api.patch(`/admin/bookings/${id}/dispute`, body),
  getTransactions: (params?: { page?: number; limit?: number; type?: string; status?: string; userId?: string; mechanicId?: string; dateFrom?: string; dateTo?: string }) => api.get('/admin/transactions', { params }),
  getPayoutsMechanics: () => api.get('/admin/payouts/mechanics'),
  recordPayout: (mechanicId: string, amountMinor: number, reference?: string) => api.post('/admin/payouts', { mechanicId, amountMinor, reference }),
}
