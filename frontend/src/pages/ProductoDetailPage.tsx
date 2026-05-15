import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Header } from '@/shared/ui'
import { useProducto } from '@/features/producto-list'

export function ProductoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: producto, isLoading, isError } = useProducto(id ? Number(id) : null)
  const [imgError, setImgError] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fef9ef] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#721016] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isError || !producto) {
    return (
      <div className="min-h-screen bg-[#fef9ef] flex flex-col items-center justify-center gap-4">
        <p className="text-2xl text-gray-500">Producto no encontrado</p>
        <Link to="/catalog" className="text-[#721016] hover:underline">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  const initials = producto.nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#fef9ef] p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
          {producto.imagen_url && !imgError ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              onError={() => setImgError(true)}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          ) : (
            <div className="w-full h-64 rounded-lg mb-4 flex items-center justify-center bg-[#D95D2B]">
              <span className="text-white text-4xl font-bold">{initials}</span>
            </div>
          )}

          <h1 className="text-3xl font-bold text-[#721016] mb-2">{producto.nombre}</h1>

          {producto.descripcion && (
            <p className="text-gray-600 mb-4">{producto.descripcion}</p>
          )}

          <p className="text-2xl font-semibold text-gray-800 mb-4">
            {Number(producto.precio_base).toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
            })}
          </p>

          {producto.ingredientes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Ingredientes</h2>
              <div className="flex flex-wrap gap-2">
                {producto.ingredientes.map((ing) => (
                  <span
                    key={ing.id}
                    className={`px-3 py-1 rounded-full text-sm ${
                      ing.es_alergeno
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {ing.nombre}
                    {ing.es_alergeno ? ' ⚠' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Link to="/catalog" className="inline-block mt-6 text-[#721016] hover:underline">
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    </>
  )
}
