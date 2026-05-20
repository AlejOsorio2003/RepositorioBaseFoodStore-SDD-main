import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react'

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY as string | undefined

if (MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY)
}

interface CardPaymentFormProps {
  onSubmit: (token: string, paymentMethodId: string, issuerId?: string) => void
  amount: number
}

export function CardPaymentForm({ onSubmit, amount }: CardPaymentFormProps) {
  if (!MP_PUBLIC_KEY) {
    return (
      <div className="bg-surface-container-low border border-outline text-tertiary px-4 py-3 rounded-lg text-sm">
        Pagos no disponibles en este entorno
      </div>
    )
  }

  return (
    <CardPayment
      initialization={{ amount }}
      onSubmit={async (formData) => {
        const data = formData as unknown as { token: string; payment_method_id: string; issuer_id?: string }
        onSubmit(data.token, data.payment_method_id, data.issuer_id)
      }}
    />
  )
}
