import { useState } from 'react'
import {
  useAdminPedidos,
  useHistorialPedido,
  useAvanzarEstado,
  type PedidoAdmin,
} from '@/features/admin'

const ESTADO_BADGE: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  EN_PREP: 'bg-purple-100 text-purple-800',
  EN_PREPARACION: 'bg-purple-100 text-purple-800',
  EN_CAMINO: 'bg-cyan-100 text-cyan-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

const FSM_NEXT: Record<string, string> = {
  PENDIENTE: 'CONFIRMADO',
  CONFIRMADO: 'EN_PREP',
  EN_PREP: 'EN_CAMINO',
  EN_CAMINO: 'ENTREGADO',
}

const ESTADOS_FINALES = ['ENTREGADO', 'CANCELADO']
const PAGE_SIZE = 10

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount)
}

function EstadoBadge({ estado }: { estado: string }) {
  const cls = ESTADO_BADGE[estado] ?? 'bg-gray-100 text-gray-800'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {estado.replace(/_/g, ' ')}
    </span>
  )
}

function DetailPanel({
  pedido,
  onClose,
}: {
  pedido: PedidoAdmin
  onClose: () => void
}) {
  const { data: historial, isLoading: histLoading } = useHistorialPedido(pedido.id)
  const avanzarEstado = useAvanzarEstado()
  const nextEstado = FSM_NEXT[pedido.estado_nombre]
  const isFinal = ESTADOS_FINALES.includes(pedido.estado_nombre)

  const handleAvanzar = () => {
    if (!nextEstado) return
    avanzarEstado.mutate({ id: pedido.id, estado: nextEstado })
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Pedido #{pedido.id}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar panel"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Details */}
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">Cliente:</span>{' '}
            <span className="font-medium text-gray-900">{pedido.usuario_nombre}</span>
          </div>
          <div>
            <span className="text-gray-500">Estado:</span>{' '}
            <EstadoBadge estado={pedido.estado_nombre} />
          </div>
          <div>
            <span className="text-gray-500">Fecha:</span>{' '}
            <span className="text-gray-900">{formatDate(pedido.created_at)}</span>
          </div>
          <div>
            <span className="text-gray-500">Total:</span>{' '}
            <span className="font-semibold text-gray-900">{formatARS(parseFloat(pedido.total))}</span>
          </div>
        </div>

        {/* Avanzar estado */}
        <div>
          <div className="relative">
            <button
              onClick={handleAvanzar}
              disabled={isFinal || !nextEstado || avanzarEstado.isPending}
              title={isFinal ? 'Estado final' : undefined}
              className={[
                'w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isFinal || !nextEstado
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#721016] hover:bg-[#5a0c11] text-white',
              ].join(' ')}
            >
              {avanzarEstado.isPending
                ? 'Procesando…'
                : isFinal
                ? 'Estado final'
                : nextEstado
                ? `Avanzar a ${nextEstado.replace('EN_PREP', 'EN PREPARACIÓN').replace(/_/g, ' ')}`
                : 'Sin siguiente estado'}
            </button>
          </div>
          {avanzarEstado.isError && (
            <p className="mt-1 text-xs text-red-600">Error al avanzar estado. Intentá de nuevo.</p>
          )}
        </div>

        {/* Historial timeline */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Historial de estados</h4>
          {histLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-3 w-3 mt-0.5 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : historial && historial.length > 0 ? (
            <ol className="relative border-l border-gray-200 ml-1.5 space-y-4">
              {historial.map((item, idx) => (
                <li key={idx} className="ml-4">
                  <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white bg-[#721016]" />
                  <div>
                    <EstadoBadge estado={item.estado_nombre} />
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(item.creado_en)}</p>
                    {item.notas && (
                      <p className="text-xs text-gray-600 mt-0.5">{item.notas}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-gray-400">Sin historial disponible</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function AdminPedidosPage() {
  const { data: pedidos, isLoading, isError } = useAdminPedidos()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const totalPages = pedidos ? Math.ceil(pedidos.length / PAGE_SIZE) : 1
  const paginatedPedidos = pedidos
    ? pedidos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : []

  // Siempre leer de la query en vivo para que refleje el estado actualizado tras avanzar
  const selectedPedido = pedidos?.find((p) => p.id === selectedId) ?? null

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedidos</h1>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Table area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#721016]" />
              </div>
            ) : isError ? (
              <div className="flex-1 flex items-center justify-center text-red-600 text-sm p-8">
                Error al cargar pedidos.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedPedidos.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                            No hay pedidos
                          </td>
                        </tr>
                      ) : (
                        paginatedPedidos.map((pedido) => (
                          <tr
                            key={pedido.id}
                            onClick={() =>
                              setSelectedId(selectedId === pedido.id ? null : pedido.id)
                            }
                            className={[
                              'cursor-pointer transition-colors',
                              selectedPedido?.id === pedido.id
                                ? 'bg-red-50'
                                : 'hover:bg-gray-50',
                            ].join(' ')}
                          >
                            <td className="px-4 py-3 font-mono text-gray-600">#{pedido.id}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">Cliente #{pedido.id}</td>
                            <td className="px-4 py-3">
                              <EstadoBadge estado={pedido.estado_nombre} />
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {formatDate(pedido.created_at)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">
                              {formatARS(parseFloat(pedido.total))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Página {page} de {totalPages} · {pedidos?.length ?? 0} pedidos
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedPedido && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full" style={{ minWidth: '20rem', maxWidth: '20rem' }}>
            <DetailPanel
              pedido={selectedPedido}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
