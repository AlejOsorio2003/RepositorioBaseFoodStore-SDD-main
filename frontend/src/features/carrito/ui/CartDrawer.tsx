import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/shared/store'
import { useUiStore } from '@/shared/store'

export function CartDrawer() {
  const cartOpen = useUiStore((s) => s.cartOpen)
  const closeCart = useUiStore((s) => s.closeCart)
  const items = useCartStore((s) => s.items)
  const itemCount = useCartStore((s) => s.itemCount)
  const subtotal = useCartStore((s) => s.subtotal)
  const costoEnvio = useCartStore((s) => s.costoEnvio)
  const total = useCartStore((s) => s.total)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const navigate = useNavigate()

  if (!cartOpen) return null

  const formatPrice = (value: number) =>
    value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

  return (
    <div className="fixed inset-0 z-50" onClick={closeCart}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Drawer panel */}
      <div
        className="absolute right-0 top-0 h-full w-96 max-w-[90vw] bg-white shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Carrito {items.length > 0 && `(${itemCount()} items)`}
          </h2>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-light leading-none"
            aria-label="Cerrar carrito"
          >
            &times;
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-gray-400 text-center py-12">Tu carrito está vacío</p>
          ) : (
            items.map((item) => (
              <div key={item.productoId} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                {/* Imagen thumbnail */}
                {item.imagenUrl ? (
                  <img
                    src={item.imagenUrl}
                    alt={item.nombre}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-gray-400 text-xs font-bold">{item.nombre[0]}</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{item.nombre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatPrice(item.precioUnitario)} c/u</p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.productoId, Math.max(1, item.cantidad - 1))}
                      className="w-6 h-6 rounded border border-gray-300 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-100 transition-colors"
                      aria-label="Reducir cantidad"
                    >
                      &minus;
                    </button>
                    <span className="text-sm font-medium w-6 text-center tabular-nums">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productoId, item.cantidad + 1)}
                      className="w-6 h-6 rounded border border-gray-300 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-100 transition-colors"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtotal + remove */}
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-semibold text-gray-900 tabular-nums">
                    {formatPrice(item.precioUnitario * item.cantidad)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productoId)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    aria-label={`Eliminar ${item.nombre}`}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totales + acciones */}
        {items.length > 0 && (
          <>
            <div className="border-t border-gray-200 px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Costo de envío</span>
                <span className="tabular-nums">{formatPrice(costoEnvio())}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(total())}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 space-y-2">
              <button
                onClick={() => {
                  navigate('/cart')
                  closeCart()
                }}
                className="w-full py-2.5 px-4 bg-[#721016] hover:bg-[#5a0c11] text-white font-medium rounded-lg transition-colors"
              >
                Ver carrito completo
              </button>
              <button
                onClick={() => {
                  navigate('/checkout')
                  closeCart()
                }}
                className="w-full py-2.5 px-4 bg-[#D95D2B] hover:bg-[#c04d1e] text-white font-medium rounded-lg transition-colors"
              >
                Ir al checkout
              </button>
            </div>
          </>
        )}

        {/* Acción cuando está vacío */}
        {items.length === 0 && (
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={() => {
                navigate('/catalog')
                closeCart()
              }}
              className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Ver catálogo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
