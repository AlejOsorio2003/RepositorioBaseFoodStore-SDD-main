import { api } from '@/shared/api'
import type { CrearPedidoRequest, PedidoRead, PedidoDetail, HistorialRead, PaginatedPedidos } from './types'

export async function crearPedido(data: CrearPedidoRequest): Promise<PedidoRead> {
  const response = await api.post<PedidoRead>('/pedidos/', data)
  return response.data
}

export async function listarPedidos(params?: {
  page?: number
  size?: number
  estado?: string
}): Promise<PaginatedPedidos> {
  const { page = 1, size = 20, estado } = params ?? {}
  const query: Record<string, string | number> = { page, size }
  if (estado) query.estado = estado
  const response = await api.get<PaginatedPedidos>('/pedidos/', { params: query })
  return response.data
}

export async function getPedido(id: number): Promise<PedidoDetail> {
  const response = await api.get<PedidoDetail>(`/pedidos/${id}`)
  return response.data
}

export async function getHistorial(id: number): Promise<HistorialRead[]> {
  const response = await api.get<HistorialRead[]>(`/pedidos/${id}/historial`)
  return response.data
}

export async function cancelarPedido(id: number): Promise<PedidoRead> {
  const response = await api.delete<PedidoRead>(`/pedidos/${id}`)
  return response.data
}
