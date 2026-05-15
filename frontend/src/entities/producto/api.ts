import { api } from '@/shared/api'
import type { Producto, ProductoDetail, PaginatedProductos } from './types'

export async function fetchProductos(params: {
  page?: number
  size?: number
  categoria_id?: number | null
  search?: string
  disponible?: boolean
}): Promise<PaginatedProductos> {
  const { page = 1, size = 20, categoria_id, search, disponible } = params
  const query: Record<string, string | number | boolean> = { page, size }
  if (disponible !== undefined) query.disponible = disponible
  if (categoria_id) query.categoria_id = categoria_id
  if (search) query.search = search
  const response = await api.get<PaginatedProductos>('/productos', { params: query })
  return response.data
}

export async function fetchProducto(id: number): Promise<ProductoDetail> {
  const response = await api.get<ProductoDetail>(`/productos/${id}`)
  return response.data
}
