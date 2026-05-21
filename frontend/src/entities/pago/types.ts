export interface PagoResponse {
  id: number
  pedido_id: number
  mp_payment_id: string
  mp_status: string
  mp_status_detail: string | null
  external_reference: string
  monto: number
  created_at: string
}

export interface PreferenciaResponse {
  preference_id: string
}

export interface CrearPreferenciaRequest {
  pedido_id: number
}

export interface CrearPagoRequest {
  pedido_id: number
  token: string
  forma_pago_codigo: string
  issuer_id?: string
}
