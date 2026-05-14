export interface Categoria {
  id: number
  nombre: string
  slug: string
  parent_id: number | null
  created_at: string
}

export interface CategoriaWithChildren extends Categoria {
  hijos: Categoria[]
}
