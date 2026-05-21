import { api } from '@/shared/api'
import type { CrearPagoRequest, CrearPreferenciaRequest, PreferenciaResponse, PagoResponse } from './types'

export async function crearPreferencia(data: CrearPreferenciaRequest): Promise<PreferenciaResponse> {
  const response = await api.post<PreferenciaResponse>('/pagos/preferencia', data)
  return response.data
}

export async function crearPago(data: CrearPagoRequest): Promise<PagoResponse> {
  const response = await api.post<PagoResponse>('/pagos/crear', data)
  return response.data
}
