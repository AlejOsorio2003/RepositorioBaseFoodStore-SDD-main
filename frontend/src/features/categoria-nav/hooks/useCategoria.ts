import { useQuery } from '@tanstack/react-query'
import { fetchCategoria } from '@/entities/categoria'

export function useCategoria(id: number | null) {
  return useQuery({
    queryKey: ['categorias', id],
    queryFn: () => fetchCategoria(id!),
    enabled: id !== null,
  })
}
