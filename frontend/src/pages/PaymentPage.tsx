import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/shared/ui'
import { useAuthStore } from '@/shared/store/auth.store'
import { usePaymentStore } from '@/shared/store/payment.store'
import { CardPaymentForm } from '@/features/pagos'
import { crearPago } from '@/entities/pago'

type PaymentView = 'idle' | 'processing' | 'approved' | 'rejected' | 'error'

export function PaymentPage() {
  const navigate = useNavigate()
  const { pedidoId } = useParams<{ pedidoId: string }>()
  const user = useAuthStore((s) => s.user)
  const paymentStore = usePaymentStore()
  const [view, setView] = useState<PaymentView>('idle')

  /* Redirigir si no autenticado */
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  /* Resetear store al montar */
  useEffect(() => {
    paymentStore.reset()
    setView('idle')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (token: string, paymentMethodId: string) => {
    if (!pedidoId) return

    setView('processing')
    paymentStore.setPaymentStatus('processing')

    try {
      const pago = await crearPago({
        pedido_id: Number(pedidoId),
        token,
        forma_pago_codigo: paymentMethodId,
      })

      if (pago.mp_status === 'approved') {
        setView('approved')
        paymentStore.setPaymentStatus('approved', pago.mp_payment_id, pago.mp_status_detail)
      } else if (pago.mp_status === 'rejected') {
        setView('rejected')
        paymentStore.setPaymentStatus('rejected', pago.mp_payment_id, pago.mp_status_detail)
      } else {
        /* pending u otros — lo tratamos como aprobado a la espera de webhook */
        setView('approved')
        paymentStore.setPaymentStatus('approved', pago.mp_payment_id, pago.mp_status_detail)
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } }
      if (error?.response?.status === 503) {
        setView('error')
        paymentStore.setPaymentStatus('error')
      } else {
        setView('error')
        paymentStore.setPaymentStatus('error')
      }
    }
  }

  const handleRetry = () => {
    paymentStore.reset()
    setView('idle')
  }

  if (!user) return null

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <h1 className="font-headline text-2xl font-bold text-gray-800 mb-6">
          Pagar Pedido
        </h1>

        {/* Estado idle / processing → mostrar formulario */}
        {(view === 'idle' || view === 'processing') && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-headline font-semibold text-gray-800 mb-4">
              Tarjeta de crédito o débito
            </h2>

            {view === 'processing' && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <span className="inline-block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                Procesando pago...
              </div>
            )}

            <CardPaymentForm onSubmit={handleSubmit} />
          </div>
        )}

        {/* Estado approved */}
        {view === 'approved' && (
          <div className="bg-white border border-green-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-headline text-xl font-bold text-gray-800 mb-2">
              ¡Tu pago fue aprobado!
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              {paymentStore.statusDetail
                ? `Detalle: ${paymentStore.statusDetail}`
                : 'El pago se procesó correctamente.'}
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Ver mi pedido
            </button>
          </div>
        )}

        {/* Estado rejected */}
        {view === 'rejected' && (
          <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="font-headline text-xl font-bold text-gray-800 mb-2">
              Pago rechazado
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              {paymentStore.statusDetail
                ? `Motivo: ${paymentStore.statusDetail}`
                : 'La tarjeta fue rechazada. Intentá con otra.'}
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Intentar con otra tarjeta
            </button>
          </div>
        )}

        {/* Estado error (503 u otro error de red) */}
        {view === 'error' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
            El sistema de pagos no está disponible en este momento
          </div>
        )}
      </div>
    </>
  )
}
