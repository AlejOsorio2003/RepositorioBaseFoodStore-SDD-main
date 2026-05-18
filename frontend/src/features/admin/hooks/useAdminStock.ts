import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'

async function updateStock(params: { id: number; stock_cantidad: number }): Promise<void> {
  await api.patch(`/api/v1/admin/productos/${params.id}/stock`, {
    stock_cantidad: params.stock_cantidad,
  })
}

export function useUpdateStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'productos'] })
    },
  })
}
