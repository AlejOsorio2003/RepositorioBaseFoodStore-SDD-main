import { useEffect, useRef, useState } from 'react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { crearPreferencia } from '@/entities/pago'

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY as string | undefined

if (MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY)
}

interface WalletPaymentFormProps {
  pedidoId: number
}

type WalletState = 'loading' | 'ready' | 'error'

export function WalletPaymentForm({ pedidoId }: WalletPaymentFormProps) {
  const [state, setState] = useState<WalletState>('loading')
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const hasFetched = useRef(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    // El re-mount de StrictMode resetea cancelled para que la respuesta del primer
    // fetch (que sigue in-flight) pueda actualizar el estado
    cancelledRef.current = false

    if (hasFetched.current) return
    hasFetched.current = true

    async function fetchPreference() {
      setState('loading')
      try {
        const res = await crearPreferencia({ pedido_id: pedidoId })
        if (!cancelledRef.current) {
          setPreferenceId(res.preference_id)
          setState('ready')
        }
      } catch (err: unknown) {
        if (!cancelledRef.current) {
          const error = err as { response?: { data?: { detail?: string } } }
          const detail = error?.response?.data?.detail
          const msg = typeof detail === 'string' ? detail : 'Error al crear la preferencia de pago'
          setErrorMsg(msg)
          setState('error')
        }
      }
    }

    fetchPreference()
    return () => { cancelledRef.current = true }
  }, [pedidoId])

  /* Mock mode: sin public key → botón simulado */
  if (!MP_PUBLIC_KEY) {
    return (
      <div className="space-y-4">
        <div className="bg-surface-container-low border border-outline text-tertiary px-4 py-3 rounded-lg text-sm">
          Pagos con Mercado Pago no disponibles en este entorno
        </div>
        <button
          onClick={() => {
            window.location.href = `?resultado=aprobado`
          }}
          className="w-full px-6 py-3 bg-secondary hover:bg-secondary-container text-white font-medium rounded-lg transition-colors"
        >
          Simular pago con MP
        </button>
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant py-8">
        <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Preparando pago con Mercado Pago...
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMsg}
        </div>
        <button
          onClick={() => window.history.back()}
          className="w-full px-6 py-3 bg-primary hover:bg-primary-container text-white font-medium rounded-lg transition-colors"
        >
          Volver
        </button>
      </div>
    )
  }

  /* state === 'ready' */
  return (
    <div className="wallet-brick-container">
      <Wallet initialization={{ preferenceId: preferenceId! }} />
    </div>
  )
}
