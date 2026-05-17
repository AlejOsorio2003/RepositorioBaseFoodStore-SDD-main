export interface ItemPedidoRequest {
  producto_id: number
  cantidad: number
  personalizacion?: number[] | null
}

export interface CrearPedidoRequest {
  items: ItemPedidoRequest[]
  direccion_id?: number | null
  notas?: string | null
}

export interface DetallePedidoRead {
  producto_id: number
  nombre_snapshot: string
  precio_snapshot: number
  cantidad: number
  personalizacion?: number[] | null
}

export interface HistorialRead {
  id: number
  estado_nombre: string
  estado_desde?: string | null
  usuario_id?: number | null
  notas?: string | null
  creado_en: string
}

export interface PedidoRead {
  id: number
  estado_nombre: string
  total: number
  costo_envio: number
  created_at: string
}

export interface PedidoDetail extends PedidoRead {
  items: DetallePedidoRead[]
  direccion_snapshot?: string | null
  notas?: string | null
}

export interface PaginatedPedidos {
  items: PedidoRead[]
  total: number
  page: number
  size: number
}
