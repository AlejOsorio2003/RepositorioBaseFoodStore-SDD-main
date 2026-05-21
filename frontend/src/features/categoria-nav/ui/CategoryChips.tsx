import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCategorias } from '../hooks'
import type { Categoria } from '@/entities/categoria'

export function CategoryChips() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoriaIdParam = searchParams.get('categoria')
  const categoriaId = categoriaIdParam ? Number(categoriaIdParam) : null

  const { data: categorias, isLoading, isError } = useCategorias()

  /* Limpiar ?categoria si el id no existe */
  useEffect(() => {
    if (!categorias || categoriaId === null) return
    const exists = categorias.some((c) => c.id === categoriaId)
    if (!exists) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('categoria')
        return next
      })
    }
  }, [categorias, categoriaId, setSearchParams])

  function handleSelect(id: number | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (id === null) {
        next.delete('categoria')
      } else {
        next.set('categoria', String(id))
      }
      return next
    })
  }

  function isActive(id: number | null) {
    return categoriaId === id
  }

  /* ─── Loading skeleton ─── */
  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-9 w-24 rounded-full bg-surface-container animate-pulse shrink-0"
          />
        ))}
      </div>
    )
  }

  /* ─── Error ─── */
  if (isError) {
    return <p className="text-error text-sm">Error al cargar categorías</p>
  }

  const allCategories: Categoria[] = categorias ?? []

  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-none pb-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Chip "Todas" */}
      <button
        onClick={() => handleSelect(null)}
        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          isActive(null)
            ? 'bg-primary text-white'
            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
        }`}
      >
        Todas
      </button>

      {/* Chips por cada categoría */}
      {allCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.id)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            isActive(cat.id)
              ? 'bg-primary text-white'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  )
}
