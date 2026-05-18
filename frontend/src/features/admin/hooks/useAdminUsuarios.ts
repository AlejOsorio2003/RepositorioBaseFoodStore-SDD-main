import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'

export interface UsuarioAdmin {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: string
  activo: boolean
  fecha_creacion: string
}

async function fetchAdminUsuarios(): Promise<UsuarioAdmin[]> {
  const res = await api.get<UsuarioAdmin[]>('/api/v1/usuarios')
  return res.data
}

async function toggleEstadoUsuario(params: {
  id: number
  activo: boolean
}): Promise<UsuarioAdmin> {
  const res = await api.patch<UsuarioAdmin>(`/api/v1/usuarios/${params.id}/estado`, {
    activo: params.activo,
  })
  return res.data
}

async function cambiarRol(params: { id: number; rol: string }): Promise<UsuarioAdmin> {
  const res = await api.put<UsuarioAdmin>(`/api/v1/usuarios/${params.id}`, {
    rol: params.rol,
  })
  return res.data
}

export function useAdminUsuarios() {
  return useQuery({
    queryKey: ['admin', 'usuarios'],
    queryFn: fetchAdminUsuarios,
  })
}

export function useToggleEstadoUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleEstadoUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] })
    },
  })
}

export function useCambiarRol() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cambiarRol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] })
    },
  })
}
