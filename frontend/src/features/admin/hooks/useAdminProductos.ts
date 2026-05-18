import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'

export interface ProductoAdmin {
  id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  stock_cantidad: number
  disponible: boolean
  imagen_url: string | null
  categorias: { id: number; nombre: string }[]
}

export interface ProductoCreatePayload {
  nombre: string
  descripcion?: string
  precio_base: number
  stock_cantidad?: number
  categoria_id?: number
  disponible?: boolean
}

export interface ProductoUpdatePayload extends Partial<ProductoCreatePayload> {}

async function fetchAdminProductos(): Promise<ProductoAdmin[]> {
  const res = await api.get('/api/v1/productos')
  // The endpoint may return paginated or array. Handle both.
  const data = res.data
  return Array.isArray(data) ? data : data.items ?? []
}

async function crearProducto(payload: ProductoCreatePayload): Promise<ProductoAdmin> {
  const res = await api.post<ProductoAdmin>('/api/v1/productos', payload)
  return res.data
}

async function updateProducto(params: {
  id: number
  payload: ProductoUpdatePayload
}): Promise<ProductoAdmin> {
  const res = await api.put<ProductoAdmin>(`/api/v1/productos/${params.id}`, params.payload)
  return res.data
}

async function deleteProducto(id: number): Promise<void> {
  await api.delete(`/api/v1/productos/${id}`)
}

async function toggleDisponibilidad(params: {
  id: number
  disponible: boolean
}): Promise<ProductoAdmin> {
  const res = await api.patch<ProductoAdmin>(`/api/v1/productos/${params.id}/disponibilidad`, {
    disponible: params.disponible,
  })
  return res.data
}

export function useAdminProductos() {
  return useQuery({
    queryKey: ['admin', 'productos'],
    queryFn: fetchAdminProductos,
  })
}

export function useCrearProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'productos'] })
    },
  })
}

export function useUpdateProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'productos'] })
    },
  })
}

export function useDeleteProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'productos'] })
    },
  })
}

export function useToggleDisponibilidad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleDisponibilidad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'productos'] })
    },
  })
}
