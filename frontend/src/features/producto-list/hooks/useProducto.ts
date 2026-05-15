import { useQuery } from '@tanstack/react-query'
import { fetchProducto } from '@/entities/producto'

export function useProducto(id: number | null) {
  return useQuery({
    queryKey: ['producto', id],
    queryFn: () => fetchProducto(id!),
    enabled: !!id,
    staleTime: 60_000,
  })
}
