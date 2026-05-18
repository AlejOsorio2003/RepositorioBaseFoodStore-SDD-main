import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Header } from '@/shared/ui'
import { useAuthStore } from '@/shared/store/auth.store'
import { useCart } from '@/features/carrito'
import { crearPedido } from '@/entities/pedido'
import type { CrearPedidoRequest } from '@/entities/pedido'

export function CheckoutPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { items, subtotal, costoEnvio, total, clearCart } = useCart()

  /* 6.1 — Ruta protegida */
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  /* 6.3 — Mutation */
  const mutation = useMutation({
    mutationFn: () => {
      const payload: CrearPedidoRequest = {
        items: items.map((i) => ({
          producto_id: i.productoId,
          cantidad: i.cantidad,
          personalizacion: i.ingredientesRemovidos ?? null,
        })),
      }
      return crearPedido(payload)
    },
    onSuccess: (data) => {
      clearCart()
      navigate(`/payment/${data.id}`)
    },
    /* 6.3 — onError: no limpiar carrito */
    onError: () => {
      /* no-op */
    },
  })

  /* 6.5 — Error handling */
  const errorMessage = (() => {
    if (!mutation.isError) return null
    const err = mutation.error as { response?: { data?: { detail?: string } } }
    const detail = err?.response?.data?.detail ?? ''
    if (typeof detail === 'string' && detail.includes('PRODUCTO_NO_DISPONIBLE')) {
      return 'Uno o más productos ya no están disponibles. Revisá tu carrito.'
    }
    return 'Ocurrió un error al procesar el pedido. Intentalo de nuevo.'
  })()

  if (!user) return null

  const formatPrice = (value: number) =>
    value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <h1 className="font-headline text-2xl font-bold text-gray-800 mb-6">
          Confirmar Pedido
        </h1>

        {/* 6.2 — Resumen del pedido */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 mb-6">
          <h2 className="font-headline font-semibold text-gray-800">
            Resumen del pedido
          </h2>

          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div
                key={item.productoId}
                className="flex justify-between py-2 text-sm"
              >
                <span className="text-gray-700">
                  {item.nombre} x {item.cantidad}
                </span>
                <span className="font-medium text-gray-800">
                  {formatPrice(item.precioUnitario * item.cantidad)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Costo de envío</span>
              <span>{formatPrice(costoEnvio)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t border-gray-200 text-base">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* 6.5 — Error alert */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {errorMessage}
          </div>
        )}

        {/* 6.4 — Botón Confirmar */}
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || items.length === 0}
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            'Confirmar pedido'
          )}
        </button>
      </div>
    </>
  )
}
