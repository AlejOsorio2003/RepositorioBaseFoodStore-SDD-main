import type { Producto } from '@/entities/producto'
import { useProductos } from '../hooks/useProductos'
import type { UseProductosParams } from '../hooks/useProductos'
import { ProductoCard } from './ProductoCard'

interface ProductoGridProps {
  params: UseProductosParams
  onSelect: (p: Producto) => void
  onPageChange: (page: number) => void
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-outline-variant rounded-xl overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-surface-container" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-surface-container rounded w-3/4" />
        <div className="h-3 bg-surface-container rounded w-full" />
        <div className="h-3 bg-surface-container rounded w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-surface-container rounded w-20" />
          <div className="h-8 bg-surface-container rounded w-24" />
        </div>
      </div>
    </div>
  )
}

export function ProductoGrid({ params, onSelect, onPageChange }: ProductoGridProps) {
  const { page = 1, size = 12 } = params
  const { data, isLoading } = useProductos(params)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant text-lg">No se encontraron productos</p>
      </div>
    )
  }

  const totalPages = Math.ceil(data.total / size)

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.items.map((producto) => (
          <ProductoCard key={producto.id} producto={producto} onSelect={onSelect} />
        ))}
      </div>

      {data.total > size && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-medium text-on-surface hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>

          <span className="text-sm text-on-surface-variant">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-medium text-on-surface hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
