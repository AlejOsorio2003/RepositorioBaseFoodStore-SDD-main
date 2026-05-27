import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/shared/store/auth.store'

export type WsStatus = 'connected' | 'polling' | 'error'

export function useCocinaWs() {
  const [wsStatus, setWsStatus] = useState<WsStatus>('polling')
  const queryClient = useQueryClient()
  const token = useAuthStore((s) => s.accessToken)
  const wsRef = useRef<WebSocket | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['cocina', 'pedidos'] })
  }

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  const startPolling = () => {
    stopPolling()
    setWsStatus('polling')
    pollingRef.current = setInterval(invalidate, 30000)
  }

  const connect = () => {
    if (!token) return
    try {
      // Derive WS host from VITE_API_URL (e.g. http://localhost:8000/api/v1)
      const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'
      const host = apiUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
      const protocol = apiUrl.startsWith('https') ? 'wss' : 'ws'
      const ws = new WebSocket(`${protocol}://${host}/api/v1/cocina/ws`)
      wsRef.current = ws

      ws.onopen = () => {
        ws.send(token)
        stopPolling()
        setWsStatus('connected')
      }

      ws.onmessage = () => {
        invalidate()
      }

      ws.onclose = (e) => {
        if (e.code === 4001) {
          setWsStatus('error')
          return
        }
        startPolling()
        // Intentar reconectar después de 5 s
        setTimeout(connect, 5000)
      }

      ws.onerror = () => {
        startPolling()
      }
    } catch {
      startPolling()
    }
  }

  useEffect(() => {
    startPolling() // siempre arrancar con polling inicial
    connect()
    return () => {
      stopPolling()
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return { wsStatus }
}
