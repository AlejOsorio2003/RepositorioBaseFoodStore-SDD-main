import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { CartPage } from '@/pages/CartPage'
import { CatalogPage } from '@/pages/CatalogPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { LoginPage } from '@/pages/LoginPage'
import { PaymentPage } from '@/pages/PaymentPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProductoDetailPage } from '@/pages/ProductoDetailPage'
import { AdminLayout } from '@/shared/ui/AdminLayout'
import { AdminRoute } from '@/shared/ui/AdminRoute'
import { useAuthStore } from '@/shared/store/auth.store'

const AdminDashboardPage = lazy(() =>
  import('@/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
)
const AdminPedidosPage = lazy(() =>
  import('@/pages/AdminPedidosPage').then((m) => ({ default: m.AdminPedidosPage }))
)
const AdminProductosPage = lazy(() =>
  import('@/pages/AdminProductosPage').then((m) => ({ default: m.AdminProductosPage }))
)
const AdminStockPage = lazy(() =>
  import('@/pages/AdminStockPage').then((m) => ({ default: m.AdminStockPage }))
)
const AdminUsuariosPage = lazy(() =>
  import('@/pages/AdminUsuariosPage').then((m) => ({ default: m.AdminUsuariosPage }))
)

function AdminIndexRedirect() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.roles.includes('ADMIN')) return <Navigate to="/admin/dashboard" replace />
  if (user.roles.includes('STOCK')) return <Navigate to="/admin/stock" replace />
  if (user.roles.includes('PEDIDOS')) return <Navigate to="/admin/pedidos" replace />
  return <Navigate to="/" replace />
}

function AdminSuspenseFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/catalog', element: <CatalogPage /> },
  { path: '/cart', element: <CartPage /> },
  { path: '/checkout', element: <CheckoutPage /> },
  { path: '/payment/:pedidoId', element: <PaymentPage /> },
  { path: '/orders', element: <OrdersPage /> },
  { path: '/productos/:id', element: <ProductoDetailPage /> },
  {
    path: '/admin',
    // Base guard: user must be authenticated and have at least one admin role
    element: <AdminRoute />,
    children: [
      {
        // AdminLayout wraps all child routes with sidebar + header
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminIndexRedirect /> },
          {
            path: 'dashboard',
            element: <AdminRoute roles={['ADMIN']} />,
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<AdminSuspenseFallback />}>
                    <AdminDashboardPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'pedidos',
            element: <AdminRoute roles={['ADMIN', 'PEDIDOS']} />,
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<AdminSuspenseFallback />}>
                    <AdminPedidosPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'productos',
            element: <AdminRoute roles={['ADMIN']} />,
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<AdminSuspenseFallback />}>
                    <AdminProductosPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'stock',
            element: <AdminRoute roles={['ADMIN', 'STOCK']} />,
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<AdminSuspenseFallback />}>
                    <AdminStockPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'usuarios',
            element: <AdminRoute roles={['ADMIN']} />,
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<AdminSuspenseFallback />}>
                    <AdminUsuariosPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
