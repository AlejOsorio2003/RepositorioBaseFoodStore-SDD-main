import { api } from '@/shared/api'
import type { Categoria, CategoriaWithChildren } from './types'

export async function fetchCategorias(): Promise<Categoria[]> {
  const response = await api.get<Categoria[]>('/categorias/')
  return response.data
}

export async function fetchCategoria(id: number): Promise<CategoriaWithChildren> {
  const response = await api.get<CategoriaWithChildren>(`/categorias/${id}`)
  return response.data
}
