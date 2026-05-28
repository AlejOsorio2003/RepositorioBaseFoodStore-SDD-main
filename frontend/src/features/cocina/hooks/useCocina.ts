import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { avanzarEstadoCocina, listarPedidosCocina } from '@/entities/cocina'

export function useCocina() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['cocina', 'pedidos'],
    queryFn: listarPedidosCocina,
    staleTime: 30000,
  })

  const mutation = useMutation({
    mutationFn: ({ pedidoId, nuevoEstado }: { pedidoId: number; nuevoEstado: string }) =>
      avanzarEstadoCocina(pedidoId, nuevoEstado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cocina', 'pedidos'] })
    },
  })

  return { query, mutation }
}
