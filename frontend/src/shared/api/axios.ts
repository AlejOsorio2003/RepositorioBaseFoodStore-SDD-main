import axios from 'axios'
import { useAuthStore } from '@/shared/store/auth.store'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const originalRequest = error.config
    if (!originalRequest) return Promise.reject(error)

    // Evitar ciclo infinito: no reintentar el propio refresh
    if (originalRequest.url?.includes('/auth/refresh')) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    const authStore = useAuthStore.getState()

    if (!authStore.refreshToken) {
      authStore.clearAuth()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Cola: esperar a que termine el refresh en curso
      return new Promise((resolve) => {
        pendingRequests.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(api(originalRequest))
        })
      })
    }

    isRefreshing = true

    try {
      await authStore.refreshTokenAction()
      const newToken = useAuthStore.getState().accessToken

      // Reintentar peticiones en cola
      pendingRequests.forEach((cb) => cb(newToken!))
      pendingRequests = []

      // Reintentar request original
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)
    } catch {
      pendingRequests.forEach((cb) => cb(''))
      pendingRequests = []
      authStore.clearAuth()
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  },
)
