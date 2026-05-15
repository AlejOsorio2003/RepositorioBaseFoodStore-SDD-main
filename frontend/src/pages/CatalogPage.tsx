import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '@/shared/ui'
import { CategorySidebar } from '@/features/categoria-nav'
import { ProductoGrid } from '@/features/producto-list'
import { ProductoDetailModal } from '@/features/producto-detail'
import type { Producto } from '@/entities/producto'

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoriaIdParam = searchParams.get('categoria')
  const categoriaId = categoriaIdParam ? Number(categoriaIdParam) : null
  const pageParam = searchParams.get('page')
  const page = pageParam ? Number(pageParam) : 1
  const searchParam = searchParams.get('q') ?? ''

  // Estado local del input (para debounce)
  const [inputValue, setInputValue] = useState(searchParam)

  // Debounce: actualiza ?q después de 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (inputValue) {
          next.set('q', inputValue)
        } else {
          next.delete('q')
        }
        next.delete('page') // reset page on search change
        return next
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset page y q cuando cambia la categoría
  const prevCategoriaRef = useRef<number | null>(categoriaId)
  useEffect(() => {
    if (prevCategoriaRef.current !== categoriaId) {
      prevCategoriaRef.current = categoriaId
      setInputValue('')
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('q')
        next.delete('page')
        return next
      })
    }
  }, [categoriaId]) // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null)

  function handlePageChange(newPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-[#fef9ef]">
        <aside className="w-64 shrink-0 border-r border-gray-200 p-4">
          <CategorySidebar />
        </aside>

        <main className="flex-1 p-8">
          {/* Barra de búsqueda */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#721016] bg-white"
            />
          </div>

          <ProductoGrid
            params={{ page, size: 12, categoria_id: categoriaId, search: searchParam || undefined }}
            onSelect={(p: Producto) => setSelectedProductoId(p.id)}
            onPageChange={handlePageChange}
          />
        </main>

        <ProductoDetailModal
          productoId={selectedProductoId}
          onClose={() => setSelectedProductoId(null)}
        />
      </div>
    </>
  )
}
