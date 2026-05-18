import { useNavigate, Link } from 'react-router-dom'
import { Header } from '@/shared/ui'
import { useAuthStore } from '@/shared/store/auth.store'
import { useCart } from '@/features/carrito'

export function CartPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const {
    items,
    subtotal,
    costoEnvio,
    total,
    itemCount,
    removeItem,
    updateQuantity,
  } = useCart()

  function handleQuantityChange(productoId: number, qty: number) {
    if (qty < 1) return
    updateQuantity(productoId, qty)
  }

  function handleCheckout() {
    if (!user) {
      navigate('/login?redirect=/checkout')
    } else {
      navigate('/checkout')
    }
  }

  const formatPrice = (value: number) =>
    value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

  /* ─── Carrito vacío ─── */
  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-on-surface-variant"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
          </div>
          <h2 className="font-headline text-2xl font-semibold text-on-surface mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-on-surface-variant mb-6">
            Agregá productos desde el catálogo
          </p>
          <Link
            to="/catalog"
            className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white font-medium rounded-lg transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      </>
    )
  }

  /* ─── Carrito con items ─── */
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <h1 className="font-headline text-2xl font-bold text-on-surface mb-6">
          Tu Carrito ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 5.1 — Lista de items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.productoId}
                className="bg-white border border-outline-variant rounded-xl p-4 flex items-center gap-4"
              >
                {/* Thumbnail */}
                {item.imagenUrl ? (
                  <img
                    src={item.imagenUrl}
                    alt={item.nombre}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-surface-container-low rounded-lg flex items-center justify-center text-on-surface-variant font-bold text-lg shrink-0">
                    {item.nombre[0]?.toUpperCase() ?? '?'}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-on-surface truncate">
                    {item.nombre}
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    {formatPrice(item.precioUnitario)} c/u
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.productoId, item.cantidad - 1)
                    }
                    disabled={item.cantidad <= 1}
                    className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Reducir cantidad"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium text-on-surface tabular-nums">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.productoId, item.cantidad + 1)
                    }
                    className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>

                {/* Line subtotal */}
                <div className="text-right min-w-[5rem]">
                  <p className="font-semibold text-on-surface">
                    {formatPrice(item.precioUnitario * item.cantidad)}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => removeItem(item.productoId)}
                  className="text-on-surface-variant hover:text-red-600 transition-colors p-1"
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* 5.2 — Panel de totales */}
          <div className="w-full lg:w-80">
            <div className="bg-white border border-outline-variant rounded-xl p-6 space-y-3 sticky top-8">
              <h2 className="font-headline font-semibold text-on-surface">
                Resumen
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Costo de envío</span>
                  <span>{formatPrice(costoEnvio)}</span>
                </div>
                <div className="flex justify-between font-semibold text-on-surface pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* 5.3 — Ir al checkout */}
              <button
                onClick={handleCheckout}
                disabled={items.length === 0}
                className="w-full px-4 py-2.5 bg-primary hover:bg-primary-container disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Ir al Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
