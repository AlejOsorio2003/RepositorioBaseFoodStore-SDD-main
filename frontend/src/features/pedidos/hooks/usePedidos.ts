import { useQuery } from '@tanstack/react-query'
import { listarPedidos } from '@/entities/pedido'

export function usePedidos() {
  return useQuery({
    queryKey: ['pedidos'],
    queryFn: () => listarPedidos({ page: 1, size: 50 }),
    refetchInterval: 30_000,
    staleTime: 10_000,
  })
}
