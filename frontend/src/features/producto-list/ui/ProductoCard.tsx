import { useState } from 'react'
import type { Producto } from '@/entities/producto'

interface ProductoCardProps {
  producto: Producto
  onSelect: (p: Producto) => void
}

export function ProductoCard({ producto, onSelect }: ProductoCardProps) {
  const [imgError, setImgError] = useState(false)

  const initials = producto.nombre
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')

  const formattedPrice = Number(producto.precio_base).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Imagen o placeholder */}
      {producto.imagen_url && !imgError ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          onError={() => setImgError(true)}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-[#D95D2B]">
          <span className="text-white text-3xl font-bold">{initials}</span>
        </div>
      )}

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 text-base leading-snug line-clamp-2 mb-1">
          {producto.nombre}
        </h3>

        {producto.descripcion && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-2 flex-1">
            {producto.descripcion}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-800">{formattedPrice}</span>
          <button
            onClick={() => onSelect(producto)}
            className="px-4 py-1.5 text-sm font-medium text-white rounded-lg bg-[#721016] hover:bg-[#5a0c11] transition-colors"
          >
            Ver detalle
          </button>
        </div>
      </div>
    </div>
  )
}
