import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import {
  useAdminProductos,
  useCrearProducto,
  useUpdateProducto,
  useDeleteProducto,
  useToggleDisponibilidad,
  type ProductoAdmin,
  type ProductoCreatePayload,
} from '@/features/admin'
import { api } from '@/shared/api/axios'

interface CategoriaOption {
  id: number
  nombre: string
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#721016]',
        checked ? 'bg-[#721016]' : 'bg-gray-200',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  )
}

interface ProductoFormValues {
  nombre: string
  descripcion: string
  precio_base: string
  stock_cantidad: string
  categoria_id: string
  disponible: boolean
}

function ProductoModal({
  producto,
  onClose,
}: {
  producto: ProductoAdmin | null
  onClose: () => void
}) {
  const crearProducto = useCrearProducto()
  const updateProducto = useUpdateProducto()

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () =>
      api.get<CategoriaOption[]>('/api/v1/categorias').then((r) => r.data),
  })

  const isEdit = producto !== null

  const form = useForm<ProductoFormValues>({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base?.toString() ?? '',
      stock_cantidad: producto?.stock_cantidad?.toString() ?? '0',
      categoria_id:
        producto?.categorias?.[0]?.id?.toString() ?? '',
      disponible: producto?.disponible ?? true,
    },
    onSubmit: async ({ value }) => {
      const payload: ProductoCreatePayload = {
        nombre: value.nombre,
        descripcion: value.descripcion || undefined,
        precio_base: parseFloat(value.precio_base),
        stock_cantidad: parseInt(value.stock_cantidad) || 0,
        categoria_id: value.categoria_id ? parseInt(value.categoria_id) : undefined,
        disponible: value.disponible,
      }

      if (isEdit) {
        await updateProducto.mutateAsync({ id: producto.id, payload })
      } else {
        await crearProducto.mutateAsync(payload)
      }
      onClose()
    },
  })

  const isPending = crearProducto.isPending || updateProducto.isPending
  const mutError = crearProducto.error || updateProducto.error

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="p-6 space-y-4"
        >
          {/* Nombre */}
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) => (!value.trim() ? 'El nombre es requerido' : undefined),
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#721016] focus:border-transparent"
                  placeholder="Nombre del producto"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-xs text-red-600">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Descripción */}
          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#721016] focus:border-transparent resize-none"
                  placeholder="Descripción opcional"
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            {/* Precio */}
            <form.Field
              name="precio_base"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'El precio es requerido'
                  if (isNaN(parseFloat(value)) || parseFloat(value) < 0)
                    return 'Precio inválido'
                  return undefined
                },
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#721016] focus:border-transparent"
                    placeholder="0.00"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Stock */}
            <form.Field name="stock_cantidad">
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#721016] focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* Categoría */}
          <form.Field name="categoria_id">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#721016] focus:border-transparent bg-white"
                >
                  <option value="">Sin categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          {/* Disponible */}
          <form.Field name="disponible">
            {(field) => (
              <div className="flex items-center gap-3">
                <ToggleSwitch
                  checked={field.state.value}
                  onChange={field.handleChange}
                />
                <label className="text-sm text-gray-700 font-medium">Disponible</label>
              </div>
            )}
          </form.Field>

          {mutError && (
            <p className="text-xs text-red-600">
              Error al guardar el producto. Intentá de nuevo.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-[#721016] hover:bg-[#5a0c11] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function AdminProductosPage() {
  const { data: productos, isLoading, isError } = useAdminProductos()
  const deleteProducto = useDeleteProducto()
  const toggleDisponibilidad = useToggleDisponibilidad()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProducto, setEditingProducto] = useState<ProductoAdmin | null>(null)

  const handleOpenNew = () => {
    setEditingProducto(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (producto: ProductoAdmin) => {
    setEditingProducto(producto)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingProducto(null)
  }

  const handleDelete = (producto: ProductoAdmin) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que querés eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`
    )
    if (confirmed) {
      deleteProducto.mutate(producto.id)
    }
  }

  const handleToggleDisponible = (producto: ProductoAdmin) => {
    toggleDisponibilidad.mutate({ id: producto.id, disponible: !producto.disponible })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <button
          onClick={handleOpenNew}
          className="px-4 py-2 bg-[#721016] hover:bg-[#5a0c11] text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nuevo Producto
        </button>
      </div>

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
                    Precio
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Disponible
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!productos || productos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
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
                      <td className="px-4 py-3 text-right text-gray-900">
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: 'ARS',
                          minimumFractionDigits: 0,
                        }).format(producto.precio_base)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={[
                            'font-medium',
                            producto.stock_cantidad < 5
                              ? 'text-red-600'
                              : 'text-gray-900',
                          ].join(' ')}
                        >
                          {producto.stock_cantidad}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            checked={producto.disponible}
                            onChange={() => handleToggleDisponible(producto)}
                            disabled={toggleDisponibilidad.isPending}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(producto)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(producto)}
                            disabled={deleteProducto.isPending}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <ProductoModal producto={editingProducto} onClose={handleCloseModal} />
      )}
    </div>
  )
}
