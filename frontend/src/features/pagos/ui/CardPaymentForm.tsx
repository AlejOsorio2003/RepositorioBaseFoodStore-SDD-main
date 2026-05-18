import { Payment } from '@mercadopago/sdk-react'

interface CardPaymentFormProps {
  onSubmit: (token: string, paymentMethodId: string) => void
}

export function CardPaymentForm({ onSubmit }: CardPaymentFormProps) {
  const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY as string | undefined

  if (!publicKey) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
        Pagos no disponibles en este entorno
      </div>
    )
  }

  return (
    <Payment
      initialization={{ publicKey }}
      onSubmit={async (param) => {
        const { formData } = param as unknown as {
          formData: { token: string; payment_method_id: string }
        }
        onSubmit(formData.token, formData.payment_method_id)
      }}
    />
  )
}
