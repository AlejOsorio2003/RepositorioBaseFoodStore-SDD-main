export interface CategoriaEnProducto {
  id: number
  nombre: string
}

export interface IngredienteEnProducto {
  id: number
  nombre: string
  es_alergeno: boolean
  es_removible: boolean
}

export interface Producto {
  id: number
  nombre: string
  slug: string
  descripcion: string | null
  precio_base: number
  stock_cantidad: number
  disponible: boolean
  imagen_url: string | null
  created_at: string
}

export interface ProductoDetail extends Producto {
  categorias: CategoriaEnProducto[]
  ingredientes: IngredienteEnProducto[]
}

export interface PaginatedProductos {
  items: Producto[]
  total: number
  page: number
  size: number
}
