import { useQuery } from '@tanstack/react-query'
import { fetchProductos } from '@/entities/producto'

export interface UseProductosParams {
  page?: number
  size?: number
  categoria_id?: number | null
  search?: string
}

export function useProductos(params: UseProductosParams = {}) {
  const { page = 1, size = 12, categoria_id, search } = params
  return useQuery({
    queryKey: ['productos', { page, size, categoria_id, search }],
    queryFn: () => fetchProductos({ page, size, categoria_id, search, disponible: true }),
    staleTime: 60_000,
  })
}
