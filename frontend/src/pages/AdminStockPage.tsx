import { useState, useRef } from 'react'
import { useAdminProductos, useUpdateStock, type ProductoAdmin } from '@/features/admin'

function StockInput({
  producto,
}: {
  producto: ProductoAdmin
}) {
  const updateStock = useUpdateStock()
  const [value, setValue] = useState(producto.stock_cantidad.toString())
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const commit = () => {
    const parsed = parseInt(value, 10)
    if (isNaN(parsed) || parsed < 0) {
      setError('El stock no puede ser negativo')
      return
    }
    setError(null)
    if (parsed !== producto.stock_cantidad) {
      updateStock.mutate({ id: producto.id, stock_cantidad: parsed })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="number"
        min="0"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setError(null)
        }}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        disabled={updateStock.isPending}
        className={[
          'w-24 px-2 py-1 border rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#721016] focus:border-transparent transition-colors',
          error ? 'border-red-400 bg-red-50' : 'border-gray-300',
          updateStock.isPending ? 'opacity-60 cursor-not-allowed' : '',
        ].join(' ')}
      />
      {error && (
        <p className="mt-0.5 text-xs text-red-600 whitespace-nowrap">{error}</p>
      )}
    </div>
  )
}

export function AdminStockPage() {
  const { data: productos, isLoading, isError } = useAdminProductos()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Stock</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#721016]" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-16 text-red-600 text-sm">
            Error al cargar productos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Disponible
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!productos || productos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No hay productos
                    </td>
                  </tr>
                ) : (
                  productos.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{producto.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {producto.categorias?.[0]?.nombre ?? (
                          <span className="text-gray-400 italic">Sin categoría</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <StockInput producto={producto} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {producto.stock_cantidad < 5 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              Stock bajo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              Normal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={[
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                            producto.disponible
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-500',
                          ].join(' ')}
                        >
                          {producto.disponible ? 'Sí' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
