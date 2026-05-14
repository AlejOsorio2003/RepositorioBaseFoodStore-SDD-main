import { useQuery } from '@tanstack/react-query'
import { fetchCategorias } from '@/entities/categoria'

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: fetchCategorias,
  })
}
