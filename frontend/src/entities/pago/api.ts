import { api } from '@/shared/api'
import type { CrearPagoRequest, PagoResponse } from './types'

export async function crearPago(data: CrearPagoRequest): Promise<PagoResponse> {
  const response = await api.post<PagoResponse>('/pagos/crear', data)
  return response.data
}
