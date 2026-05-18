import { api } from '@/shared/api/axios'

export interface TopProductoRead {
  producto_id: number
  nombre: string
  total_vendido: number
}

export interface MetricasRead {
  total_ventas: number
  productos_stock_bajo: number
  pedidos_por_estado: Record<string, number>
  top_productos: TopProductoRead[]
}

export async function getMetricas(): Promise<MetricasRead> {
  const res = await api.get<MetricasRead>('/api/v1/admin/metricas')
  return res.data
}
