import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import UserDetail from './pages/UserDetail'
import Mechanics from './pages/Mechanics'
import MechanicDetail from './pages/MechanicDetail'
import Bookings from './pages/Bookings'
import BookingDetail from './pages/BookingDetail'
import Quotes from './pages/Quotes'
import Transactions from './pages/Transactions'
import TransactionDetail from './pages/TransactionDetail'
import Webhooks from './pages/Webhooks'
import Payouts from './pages/Payouts'
import Reports from './pages/Reports'
import ReportDetail from './pages/ReportDetail'
import Ratings from './pages/Ratings'
import Notifications from './pages/Notifications'
import AuditLogs from './pages/AuditLogs'
import AdminUsers from './pages/AdminUsers'
import { ADMIN_PERMISSIONS, PermissionGuard, ProtectedAdmin } from './components/PermissionGuard'

const protectedRoutes = [
  { path: 'dashboard', permission: ADMIN_PERMISSIONS.OVERVIEW, element: <Dashboard /> },
  { path: 'users', permission: ADMIN_PERMISSIONS.USERS, element: <Users /> },
  { path: 'users/:id', permission: ADMIN_PERMISSIONS.USERS, element: <UserDetail /> },
  { path: 'mechanics', permission: ADMIN_PERMISSIONS.MECHANICS, element: <Mechanics /> },
  { path: 'mechanics/:id', permission: ADMIN_PERMISSIONS.MECHANICS, element: <MechanicDetail /> },
  { path: 'bookings', permission: ADMIN_PERMISSIONS.BOOKINGS, element: <Bookings /> },
  { path: 'bookings/:id', permission: ADMIN_PERMISSIONS.BOOKINGS, element: <BookingDetail /> },
  { path: 'quotes', permission: ADMIN_PERMISSIONS.BOOKINGS, element: <Quotes /> },
  { path: 'transactions', permission: ADMIN_PERMISSIONS.PAYMENTS, element: <Transactions /> },
  { path: 'transactions/:id', permission: ADMIN_PERMISSIONS.PAYMENTS, element: <TransactionDetail /> },
  { path: 'webhooks', permission: ADMIN_PERMISSIONS.PAYMENTS, element: <Webhooks /> },
  { path: 'payouts', permission: ADMIN_PERMISSIONS.PAYMENTS, element: <Payouts /> },
  { path: 'reports', permission: ADMIN_PERMISSIONS.COMPLAINTS, element: <Reports /> },
  { path: 'reports/:id', permission: ADMIN_PERMISSIONS.COMPLAINTS, element: <ReportDetail /> },
  { path: 'ratings', permission: ADMIN_PERMISSIONS.BOOKINGS, element: <Ratings /> },
  { path: 'notifications', permission: ADMIN_PERMISSIONS.OVERVIEW, element: <Notifications /> },
  { path: 'audit', permission: ADMIN_PERMISSIONS.AUDIT, element: <AuditLogs /> },
  { path: 'admins', permission: ADMIN_PERMISSIONS.ADMINS, element: <AdminUsers /> },
] as const

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<PermissionGuard permission={route.permission}>{route.element}</PermissionGuard>}
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
