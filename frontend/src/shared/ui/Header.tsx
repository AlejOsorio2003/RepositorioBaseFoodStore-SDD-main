import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { useCartStore } from '../store/cart.store'
import { useUiStore } from '../store/ui.store'
import { CartDrawer } from '../../features/carrito/ui/CartDrawer'

export function Header() {
  const navigate = useNavigate()
  const authStore = useAuthStore()
  const count = useCartStore((s) => s.itemCount())
  const openCart = useUiStore((s) => s.openCart)

  const handleLogout = async () => {
    try {
      await authStore.logout()
      navigate('/login')
    } catch (error) {
      console.error('Error durante logout:', error)
    }
  }

  if (!authStore.user) {
    return null
  }

  return (
    <header className="bg-white border-b border-outline-variant shadow-sm">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {authStore.user.nombre?.[0]?.toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-on-surface">
            {authStore.user.nombre} {authStore.user.apellido}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Cart icon with badge */}
          <button
            onClick={openCart}
            className="relative p-2 text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Abrir carrito"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-primary hover:bg-primary-container text-white font-medium rounded-lg transition-colors duration-200"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* CartDrawer montado al final del header */}
      <CartDrawer />
    </header>
  )
}
