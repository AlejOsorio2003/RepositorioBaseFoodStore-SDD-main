import { useState, useEffect, useRef } from 'react'
import { useProducto } from '@/features/producto-list'
import { useCartStore } from '@/shared/store'

interface ProductoDetailModalProps {
  productoId: number | null
  onClose: () => void
}

function ModalSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="w-full h-56 bg-surface-container rounded-lg" />
      <div className="h-6 bg-surface-container rounded w-2/3" />
      <div className="h-4 bg-surface-container rounded w-full" />
      <div className="h-4 bg-surface-container rounded w-5/6" />
      <div className="h-6 bg-surface-container rounded w-1/4" />
    </div>
  )
}

export function ProductoDetailModal({ productoId, onClose }: ProductoDetailModalProps) {
  if (!productoId) return null

  return <ProductoDetailModalInner productoId={productoId} onClose={onClose} />
}

function ProductoDetailModalInner({
  productoId,
  onClose,
}: {
  productoId: number
  onClose: () => void
}) {
  const { data: producto, isLoading } = useProducto(productoId)
  const [imgError, setImgError] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    }
  }, [])

  const handleAddToCart = () => {
    if (!producto) return
    useCartStore.getState().addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      precioUnitario: Number(producto.precio_base),
      cantidad: 1,
      imagenUrl: producto.imagen_url ?? undefined,
    })
    setAddedFeedback(true)
    feedbackTimer.current = setTimeout(() => {
      setAddedFeedback(false)
      onClose()
    }, 1500)
  }

  const initials = producto?.nombre
    ? producto.nombre
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
    : ''

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con botón cerrar */}
        <div className="flex items-center justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors text-2xl font-light leading-none"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        <div className="px-6 pb-6">
          {isLoading ? (
            <ModalSkeleton />
          ) : !producto ? (
            <p className="text-center text-on-surface-variant py-8">Producto no encontrado</p>
          ) : (
            <>
              {/* Imagen o placeholder */}
              {producto.imagen_url && !imgError ? (
                <img
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  onError={() => setImgError(true)}
                  className="w-full h-56 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-56 rounded-lg mb-4 flex items-center justify-center bg-secondary">
                  <span className="text-white text-4xl font-bold">{initials}</span>
                </div>
              )}

              {/* Nombre */}
              <h2 className="text-2xl font-bold text-primary mb-2">{producto.nombre}</h2>

              {/* Descripción */}
              {producto.descripcion && (
                <p className="text-on-surface-variant mb-4">{producto.descripcion}</p>
              )}

              {/* Precio */}
              <p className="text-xl font-semibold text-on-surface mb-4">
                {Number(producto.precio_base).toLocaleString('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                })}
              </p>

              {/* Agregar al carrito */}
              <button
                onClick={handleAddToCart}
                disabled={!producto.disponible || addedFeedback}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-base transition-all duration-200 mb-4 ${
                  addedFeedback
                    ? 'bg-green-600 text-white'
                    : producto.disponible
                      ? 'bg-secondary hover:bg-secondary/90 text-white active:scale-[0.98]'
                      : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                }`}
              >
                {addedFeedback ? '¡Agregado!' : 'Agregar al carrito'}
              </button>

              {/* Ingredientes */}
              {producto.ingredientes.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-on-surface mb-2">Ingredientes</h3>
                  <div className="flex flex-wrap gap-2">
                    {producto.ingredientes.map((ing) => (
                      <span
                        key={ing.id}
                        className={`px-3 py-1 rounded-full text-sm ${
                          ing.es_alergeno
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-surface-container-low text-on-surface'
                        }`}
                      >
                        {ing.nombre}
                        {ing.es_alergeno && (
                          <span className="ml-1 text-xs font-semibold">Alérgeno</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
