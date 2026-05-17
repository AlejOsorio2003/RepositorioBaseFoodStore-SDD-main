import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelarPedido } from '@/entities/pedido'

export function useCancelarPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    },
  })
}
