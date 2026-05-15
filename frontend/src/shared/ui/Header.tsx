import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export function Header() {
  const navigate = useNavigate()
  const authStore = useAuthStore()

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
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {authStore.user.nombre?.[0]?.toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-gray-700">
            {authStore.user.nombre} {authStore.user.apellido}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
