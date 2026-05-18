import { useQuery } from '@tanstack/react-query'
import { getMetricas } from '@/entities/admin'

export function useAdminMetricas() {
  return useQuery({
    queryKey: ['admin', 'metricas'],
    queryFn: getMetricas,
    staleTime: 60_000,
  })
}
