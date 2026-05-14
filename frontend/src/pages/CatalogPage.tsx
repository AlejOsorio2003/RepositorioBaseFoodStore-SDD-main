import { useSearchParams } from 'react-router-dom'
import { CategorySidebar } from '@/features/categoria-nav'
import { useCategorias } from '@/features/categoria-nav'

export function CatalogPage() {
  const [searchParams] = useSearchParams()
  const categoriaIdParam = searchParams.get('categoria')
  const categoriaId = categoriaIdParam ? Number(categoriaIdParam) : null

  const { data: categorias } = useCategorias()
  const categoriaActiva = categorias?.find(c => c.id === categoriaId)

  return (
    <div className="flex min-h-screen bg-[#fef9ef]">
      <aside className="w-64 shrink-0 border-r border-gray-200 p-4">
        <CategorySidebar />
      </aside>

      <main className="flex-1 p-8">
        {categoriaActiva ? (
          <div>
            <h1 className="text-3xl font-bold text-[#721016] mb-2">
              {categoriaActiva.nombre}
            </h1>
            <p className="text-gray-500 text-sm">
              Explorando productos en esta categoría
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-2xl text-gray-400 font-medium mb-2">
              Seleccioná una categoría
            </p>
            <p className="text-gray-400 text-sm">
              para explorar el menú
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
