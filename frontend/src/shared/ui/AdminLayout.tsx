import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/auth.store'

interface NavItem {
  label: string
  path: string
  icon: string
  roles: string[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊', roles: ['ADMIN'] },
  { label: 'Pedidos', path: '/admin/pedidos', icon: '📦', roles: ['ADMIN', 'PEDIDOS'] },
  { label: 'Productos', path: '/admin/productos', icon: '🛒', roles: ['ADMIN'] },
  { label: 'Stock', path: '/admin/stock', icon: '🏪', roles: ['ADMIN', 'STOCK'] },
  { label: 'Usuarios', path: '/admin/usuarios', icon: '👥', roles: ['ADMIN'] },
]

export function AdminLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const filteredNavItems = NAV_ITEMS.filter((item) =>
    user?.roles.some((r) => item.roles.includes(r))
  )

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
      navigate('/login')
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 flex flex-col">
        {/* Logo / Brand */}
        <div className="px-6 py-5 border-b border-gray-700">
          <h1 className="text-xl font-bold" style={{ color: '#D95D2B' }}>
            Food Store
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Panel Administrativo</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-red-900/30 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                ].join(' ')
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="px-4 py-4 border-t border-gray-700">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                style={{ backgroundColor: '#721016' }}
              >
                {user.nombre?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-150 text-left"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
