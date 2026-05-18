import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'

export interface PedidoAdmin {
  id: number
  usuario_nombre: string
  estado: string
  fecha_creacion: string
  total: number
}

export interface HistorialItem {
  estado: string
  timestamp: string
  descripcion?: string
}

async function fetchAdminPedidos(): Promise<PedidoAdmin[]> {
  const res = await api.get<PedidoAdmin[]>('/api/v1/pedidos')
  return res.data
}

async function fetchHistorialPedido(pedidoId: number): Promise<HistorialItem[]> {
  const res = await api.get<HistorialItem[]>(`/api/v1/pedidos/${pedidoId}/historial`)
  return res.data
}

async function avanzarEstadoPedido(params: { id: number; estado: string }): Promise<void> {
  await api.patch(`/api/v1/pedidos/${params.id}/estado`, { estado: params.estado })
}

export function useAdminPedidos() {
  return useQuery({
    queryKey: ['admin', 'pedidos'],
    queryFn: fetchAdminPedidos,
  })
}

export function useHistorialPedido(pedidoId: number | null) {
  return useQuery({
    queryKey: ['admin', 'pedidos', pedidoId, 'historial'],
    queryFn: () => fetchHistorialPedido(pedidoId!),
    enabled: pedidoId !== null,
  })
}

export function useAvanzarEstado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: avanzarEstadoPedido,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pedidos'] })
    },
  })
}
