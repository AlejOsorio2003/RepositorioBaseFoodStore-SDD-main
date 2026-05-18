import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'

export interface PedidoAdmin {
  id: number
  estado_nombre: string
  total: string
  costo_envio: string
  created_at: string
}

export interface HistorialItem {
  estado_nombre: string
  creado_en: string
  notas?: string | null
}

async function fetchAdminPedidos(): Promise<PedidoAdmin[]> {
  const res = await api.get<{ items: PedidoAdmin[] }>('/pedidos/')
  return res.data.items ?? []
}

async function fetchHistorialPedido(pedidoId: number): Promise<HistorialItem[]> {
  const res = await api.get<HistorialItem[]>(`/pedidos/${pedidoId}/historial`)
  return res.data
}

async function avanzarEstadoPedido(params: { id: number; estado: string }): Promise<void> {
  await api.patch(`/pedidos/${params.id}/estado`, { nuevo_estado: params.estado })
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
