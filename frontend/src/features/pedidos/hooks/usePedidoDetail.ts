import { useQuery } from '@tanstack/react-query'
import { getPedido, getHistorial } from '@/entities/pedido'

export function usePedidoDetail(id: number | null) {
  return useQuery({
    queryKey: ['pedido', id],
    queryFn: async () => {
      if (!id) throw new Error('ID requerido')
      const [pedido, historial] = await Promise.all([
        getPedido(id),
        getHistorial(id),
      ])
      return { pedido, historial }
    },
    enabled: !!id,
    refetchInterval: 30_000,
    staleTime: 10_000,
  })
}
