import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'
import { Header } from '@/shared/ui'
import { useAuthStore } from '@/shared/store/auth.store'
import { usePaymentStore } from '@/shared/store/payment.store'
import { CardPaymentForm, WalletPaymentForm } from '@/features/pagos'
import { usePedidoDetail } from '@/features/pedidos'
import { crearPago } from '@/entities/pago'

type PaymentView = 'idle' | 'processing' | 'approved' | 'rejected' | 'pending' | 'error'
type PaymentMethod = 'card' | 'wallet' | null

export function PaymentPage() {
  const navigate = useNavigate()
  const { pedidoId } = useParams<{ pedidoId: string }>()
  const [searchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const paymentStore = usePaymentStore()
  const [view, setView] = useState<PaymentView>('idle')
  const [method, setMethod] = useState<PaymentMethod>(null)
  const { data: pedidoData } = usePedidoDetail(pedidoId ? Number(pedidoId) : null)
  const amount = pedidoData?.pedido ? Number(pedidoData.pedido.total) : 0

  /* Redirigir si no autenticado */
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  /* Al montar: leer ?resultado= y resetaer store */
  useEffect(() => {
    paymentStore.reset()
    setView('idle')
    setMethod(null)

    const resultado = searchParams.get('resultado')
    if (resultado === 'aprobado') {
      setView('approved')
      paymentStore.setPaymentStatus('approved')
    } else if (resultado === 'rechazado') {
      setView('rejected')
      paymentStore.setPaymentStatus('rejected')
    } else if (resultado === 'pendiente') {
      setView('pending')
      paymentStore.setPaymentStatus('pending')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCardSubmit = async (token: string, paymentMethodId: string, issuerId?: string) => {
    if (!pedidoId) return

    setView('processing')
    paymentStore.setPaymentStatus('processing')

    try {
      const pago = await crearPago({
        pedido_id: Number(pedidoId),
        token,
        forma_pago_codigo: paymentMethodId,
        issuer_id: issuerId,
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
      paymentStore.setPaymentStatus('error')
      setView('error')
    }
  }

  const handleRetry = () => {
    paymentStore.reset()
    setMethod(null)
    setView('idle')
  }

  if (!user) return null

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <Link
          to="/"
          className="inline-block text-sm text-on-surface-variant hover:text-primary transition-colors mb-2"
        >
          ← Volver al catálogo
        </Link>
        <h1 className="font-headline text-2xl font-bold text-on-surface mb-6">
          Pagar Pedido
        </h1>

        {/* ── Selector de método (cuando no hay resultado ni método elegido) ── */}
        {view === 'idle' && method === null && (
          <div className="space-y-4">
            <p className="text-on-surface-variant text-sm mb-2">
              Elegí cómo querés pagar tu pedido:
            </p>

            <button
              onClick={() => setMethod('card')}
              className="w-full flex items-center gap-4 bg-white border border-outline-variant rounded-xl p-5 hover:border-primary hover:shadow-sm transition-all text-left"
            >
              <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <span className="font-headline font-semibold text-on-surface block">
                  Tarjeta de crédito o débito
                </span>
                <span className="text-sm text-on-surface-variant">
                  Visa, Mastercard, American Express y más
                </span>
              </div>
            </button>

            <button
              onClick={() => setMethod('wallet')}
              className="w-full flex items-center gap-4 bg-white border border-outline-variant rounded-xl p-5 hover:border-primary hover:shadow-sm transition-all text-left"
            >
              <div className="w-12 h-12 bg-[#E6F2FF] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#009EE3]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
                </svg>
              </div>
              <div>
                <span className="font-headline font-semibold text-on-surface block">
                  Pagar con Mercado Pago
                </span>
                <span className="text-sm text-on-surface-variant">
                  Usá tu cuenta de Mercado Pago o dinero disponible
                </span>
              </div>
            </button>
          </div>
        )}

        {/* ── Formulario tarjeta ── */}
        {method === 'card' && (view === 'idle' || view === 'processing') && (
          <div className="bg-white border border-outline-variant rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline font-semibold text-on-surface">
                Tarjeta de crédito o débito
              </h2>
              <button
                onClick={handleRetry}
                className="text-sm text-primary hover:text-primary-container transition-colors"
              >
                Cambiar método
              </button>
            </div>

            {view === 'processing' && (
              <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
                <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Procesando pago...
              </div>
            )}

            <CardPaymentForm onSubmit={handleCardSubmit} amount={amount} />
          </div>
        )}

        {/* ── Formulario Wallet ── */}
        {method === 'wallet' && view === 'idle' && (
          <div className="bg-white border border-outline-variant rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline font-semibold text-on-surface">
                Pagar con Mercado Pago
              </h2>
              <button
                onClick={handleRetry}
                className="text-sm text-primary hover:text-primary-container transition-colors"
              >
                Cambiar método
              </button>
            </div>
            <WalletPaymentForm pedidoId={Number(pedidoId!)} />
          </div>
        )}

        {/* ── Estado approved ── */}
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
            <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
              ¡Tu pago fue aprobado!
            </h2>
            <p className="text-on-surface-variant text-sm mb-6">
              {paymentStore.statusDetail
                ? `Detalle: ${paymentStore.statusDetail}`
                : 'El pago se procesó correctamente.'}
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-primary hover:bg-primary-container text-white font-medium rounded-lg transition-colors"
            >
              Ver mi pedido
            </button>
          </div>
        )}

        {/* ── Estado rejected ── */}
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
            <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
              Pago rechazado
            </h2>
            <p className="text-on-surface-variant text-sm mb-6">
              {paymentStore.statusDetail
                ? `Motivo: ${paymentStore.statusDetail}`
                : 'El pago fue rechazado. Intentá con otro método.'}
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-primary hover:bg-primary-container text-white font-medium rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* ── Estado pending ── */}
        {view === 'pending' && (
          <div className="bg-white border border-amber-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
              Tu pago está siendo procesado
            </h2>
            <p className="text-on-surface-variant text-sm mb-6">
               Generalmente se acredita en unos minutos. Revisá el estado de tu pedido para confirmar.
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-primary hover:bg-primary-container text-white font-medium rounded-lg transition-colors"
            >
              Ver mi pedido
            </button>
          </div>
        )}

        {/* ── Estado error ── */}
        {view === 'error' && (
          <div className="bg-white border border-outline-variant rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
              Error al procesar el pago
            </h2>
            <p className="text-on-surface-variant text-sm mb-6">
              El sistema de pagos no está disponible en este momento. Intentá de nuevo más tarde.
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-primary hover:bg-primary-container text-white font-medium rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </>
  )
}
