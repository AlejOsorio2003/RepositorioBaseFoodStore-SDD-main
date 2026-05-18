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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isError || !producto) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-2xl text-on-surface-variant">Producto no encontrado</p>
        <Link to="/catalog" className="text-primary hover:underline">
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
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
          {producto.imagen_url && !imgError ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              onError={() => setImgError(true)}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          ) : (
            <div className="w-full h-64 rounded-lg mb-4 flex items-center justify-center bg-secondary">
              <span className="text-white text-4xl font-bold">{initials}</span>
            </div>
          )}

          <h1 className="text-3xl font-bold text-primary mb-2">{producto.nombre}</h1>

          {producto.descripcion && (
            <p className="text-on-surface-variant mb-4">{producto.descripcion}</p>
          )}

          <p className="text-2xl font-semibold text-on-surface mb-4">
            {Number(producto.precio_base).toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
            })}
          </p>

          {producto.ingredientes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-on-surface mb-2">Ingredientes</h2>
              <div className="flex flex-wrap gap-2">
                {producto.ingredientes.map((ing) => (
                  <span
                    key={ing.id}
                    className={`px-3 py-1 rounded-full text-sm ${
                      ing.es_alergeno
                        ? 'bg-red-100 text-red-700 border border-error/50'
                        : 'bg-surface-container-low text-on-surface'
                    }`}
                  >
                    {ing.nombre}
                    {ing.es_alergeno ? ' ⚠' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Link to="/catalog" className="inline-block mt-6 text-primary hover:underline">
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    </>
  )
}
