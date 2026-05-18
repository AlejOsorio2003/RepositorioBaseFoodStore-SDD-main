import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCategorias } from '../hooks'
import type { Categoria } from '@/entities/categoria'

export function CategorySidebar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoriaIdParam = searchParams.get('categoria')
  const categoriaId = categoriaIdParam ? Number(categoriaIdParam) : null

  const { data: categorias, isLoading, isError } = useCategorias()

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

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 rounded bg-surface-container animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className="text-error text-sm">Error al cargar categorías</p>
  }

  const raices: Categoria[] = (categorias ?? []).filter((c) => c.parent_id === null)

  function isActive(id: number | null) {
    return categoriaId === id
  }

  function itemClass(id: number | null) {
    const base = 'w-full text-left px-3 py-2 rounded cursor-pointer text-sm transition-colors'
    if (isActive(id)) return `${base} bg-primary text-white`
    return `${base} text-on-surface hover:bg-surface-container-low`
  }

  return (
    <div className="w-64 shrink-0">
      <p className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant mb-3">
        Categorías
      </p>

      <button className={itemClass(null)} onClick={() => handleSelect(null)}>
        Todas las categorías
      </button>

      <div className="mt-1 space-y-0.5">
        {raices.map((raiz) => {
          const hijos = (categorias ?? []).filter((c) => c.parent_id === raiz.id)
          return (
            <div key={raiz.id}>
              <button className={itemClass(raiz.id)} onClick={() => handleSelect(raiz.id)}>
                {raiz.nombre}
              </button>
              {hijos.length > 0 && (
                <div className="pl-4 mt-0.5 space-y-0.5">
                  {hijos.map((hijo) => (
                    <button
                      key={hijo.id}
                      className={itemClass(hijo.id)}
                      onClick={() => handleSelect(hijo.id)}
                    >
                      {hijo.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
