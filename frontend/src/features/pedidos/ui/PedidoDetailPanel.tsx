import { usePedidoDetail, useCancelarPedido } from '../hooks'
import { HistorialTimeline } from './HistorialTimeline'

interface PedidoDetailPanelProps {
  pedidoId: number | null
  onClose: () => void
}

/* ───────── Skeletons / Error ───────── */

function SkeletonPanel() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </div>
  )
}

function ErrorPanel() {
  return (
    <div className="bg-white border border-red-200 rounded-xl p-6">
      <p className="text-red-600 text-sm">Error al cargar el pedido.</p>
    </div>
  )
}

/* ───────── PedidoDetailPanel ───────── */

export function PedidoDetailPanel({
  pedidoId,
  onClose,
}: PedidoDetailPanelProps) {
  const { data, isLoading, isError } = usePedidoDetail(pedidoId)
  const cancelMutation = useCancelarPedido()

  if (!pedidoId) return null
  if (isLoading) return <SkeletonPanel />
  if (isError || !data) return <ErrorPanel />

  const { pedido, historial } = data

  const formattedTotal = Number(pedido.total).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })

  const canCancel =
    pedido.estado_nombre === 'PENDIENTE' ||
    pedido.estado_nombre === 'CONFIRMADO'

  function handleCancel() {
    if (window.confirm('¿Estás seguro de cancelar este pedido?')) {
      cancelMutation.mutate(pedido.id)
    }
  }

  const estadoColores: Record<string, string> = {
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    CONFIRMADO: 'bg-blue-100 text-blue-800',
    PREPARANDO: 'bg-indigo-100 text-indigo-800',
    ENVIADO: 'bg-purple-100 text-purple-800',
    ENTREGADO: 'bg-green-100 text-green-800',
    CANCELADO: 'bg-red-100 text-red-800',
  }
  const chipClass =
    estadoColores[pedido.estado_nombre] ?? 'bg-gray-100 text-gray-800'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-lg font-semibold text-gray-800">
          Pedido #{pedido.id}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Estado + fecha */}
      <div className="flex items-center gap-2">
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${chipClass}`}
        >
          {pedido.estado_nombre}
        </span>
        <span className="text-sm text-gray-500">
          {new Date(pedido.created_at).toLocaleDateString('es-AR')}
        </span>
      </div>

      {/* Items */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Items</h4>
        <div className="space-y-2">
          {pedido.items.map((item, idx) => {
            const itemSubtotal = item.precio_snapshot * item.cantidad
            return (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">
                  {item.nombre_snapshot} x {item.cantidad}
                </span>
                <span className="font-medium text-gray-800">
                  {itemSubtotal.toLocaleString('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                  })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Totales */}
      <div className="border-t pt-3 space-y-1 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>
            {(pedido.total - pedido.costo_envio).toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
            })}
          </span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Costo de envío</span>
          <span>
            {pedido.costo_envio.toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
            })}
          </span>
        </div>
        <div className="flex justify-between font-semibold text-gray-800 pt-1 border-t">
          <span>Total</span>
          <span>{formattedTotal}</span>
        </div>
      </div>

      {/* Dirección y notas */}
      {pedido.direccion_snapshot && (
        <p className="text-sm text-gray-600">
          <span className="font-medium">Dirección:</span>{' '}
          {pedido.direccion_snapshot}
        </p>
      )}
      {pedido.notas && (
        <p className="text-sm text-gray-600">
          <span className="font-medium">Notas:</span> {pedido.notas}
        </p>
      )}

      {/* Timeline */}
      <HistorialTimeline historial={historial} />

      {/* Cancelar — solo si PENDIENTE o CONFIRMADO */}
      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelMutation.isPending}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
        >
          {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar pedido'}
        </button>
      )}
    </div>
  )
}
