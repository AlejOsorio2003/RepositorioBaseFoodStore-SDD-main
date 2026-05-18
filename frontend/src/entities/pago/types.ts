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

export interface CrearPagoRequest {
  pedido_id: number
  token: string
  forma_pago_codigo: string
}
