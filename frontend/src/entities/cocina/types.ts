export interface ItemCocinaRead {
  nombre_snapshot: string
  cantidad: number
  personalizacion?: number[] | null
}

export interface PedidoCocinaSummary {
  id: number
  estado_nombre: string
  items: ItemCocinaRead[]
  created_at: string // ISO datetime
  tiempo_desde_confirmado: number // segundos
}

export interface CocinaEstadoRequest {
  nuevo_estado: string
}
