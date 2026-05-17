import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { useAuthStore } from '@/shared/store/auth.store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})

function AuthInitializer({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const refreshTokenAction = useAuthStore((s) => s.refreshTokenAction)

  useEffect(() => {
    if (refreshToken) {
      refreshTokenAction().finally(() => setReady(true))
    } else {
      setReady(true)
    }
  }, [])

  if (!ready) return null

  return <>{children}</>
}

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
    </QueryClientProvider>
  )
}
