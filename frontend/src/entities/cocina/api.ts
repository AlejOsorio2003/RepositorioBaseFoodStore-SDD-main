import { api } from '@/shared/api/axios'
import type { PedidoCocinaSummary } from './types'

export async function listarPedidosCocina(): Promise<PedidoCocinaSummary[]> {
  const res = await api.get<PedidoCocinaSummary[]>('/cocina/pedidos')
  return res.data
}

export async function avanzarEstadoCocina(pedidoId: number, nuevoEstado: string): Promise<void> {
  await api.patch(`/cocina/pedidos/${pedidoId}/estado`, { nuevo_estado: nuevoEstado })
}
