import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { api } from '@/shared/api/axios'
import { useCartStore } from './cart.store'

export interface AuthUser {
  id: number
  email: string
  nombre: string
  apellido: string
  roles: string[]
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshTokenAction: () => Promise<void>
  setAuth: (token: string, refreshToken: string, user: AuthUser) => void
  clearAuth: () => void
}

function parseJwt(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: Number(payload.sub),
      email: payload.email ?? '',
      nombre: payload.nombre ?? '',
      apellido: payload.apellido ?? '',
      roles: payload.roles ?? [],
    }
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      login: async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password })
        const { access_token, refresh_token } = res.data
        const user = parseJwt(access_token)
        if (!user) throw new Error('Error al decodificar el token')
        // Restaurar carrito guardado del usuario que inicia sesión
        const savedCart = localStorage.getItem(`cart-${user.id}`)
        if (savedCart) {
          try {
            useCartStore.setState({ items: JSON.parse(savedCart) })
          } catch {
            // ignorar cart corrupto
          }
        }
        set({ accessToken: access_token, refreshToken: refresh_token, user })
      },

      logout: async () => {
        const currentUser = get().user
        const refreshToken = get().refreshToken
        // Guardar carrito del usuario antes de limpiar
        if (currentUser) {
          const items = useCartStore.getState().items
          if (items.length > 0) {
            localStorage.setItem(`cart-${currentUser.id}`, JSON.stringify(items))
          } else {
            localStorage.removeItem(`cart-${currentUser.id}`)
          }
        }
        if (refreshToken) {
          try {
            await api.post('/auth/logout', { refresh_token: refreshToken })
          } catch {
            // Idempotente — ignorar errores
          }
        }
        useCartStore.getState().clearCart()
        set({ accessToken: null, refreshToken: null, user: null })
      },

      refreshTokenAction: async () => {
        const refreshToken = get().refreshToken
        if (!refreshToken) throw new Error('No hay refresh token')
        const res = await api.post('/auth/refresh', { refresh_token: refreshToken })
        const { access_token, refresh_token } = res.data
        const user = parseJwt(access_token)
        if (!user) throw new Error('Error al decodificar el token')
        set({ accessToken: access_token, refreshToken: refresh_token, user })
      },

      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user }),

      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'auth',
      partialize: (state) => ({ refreshToken: state.refreshToken }),
    },
  ),
)
