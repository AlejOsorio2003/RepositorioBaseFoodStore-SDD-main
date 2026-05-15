import { createBrowserRouter } from 'react-router-dom'
import { AdminPage } from '@/pages/AdminPage'
import { CartPage } from '@/pages/CartPage'
import { CatalogPage } from '@/pages/CatalogPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProductoDetailPage } from '@/pages/ProductoDetailPage'

export const router = createBrowserRouter([
  { path: '/', element: <CatalogPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/catalog', element: <CatalogPage /> },
  { path: '/cart', element: <CartPage /> },
  { path: '/checkout', element: <CheckoutPage /> },
  { path: '/orders', element: <OrdersPage /> },
  { path: '/admin', element: <AdminPage /> },
  { path: '/productos/:id', element: <ProductoDetailPage /> },
  { path: '*', element: <NotFoundPage /> },
])
