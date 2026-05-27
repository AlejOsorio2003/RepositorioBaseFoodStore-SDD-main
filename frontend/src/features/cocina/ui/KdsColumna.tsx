import type { PedidoCocinaSummary } from '@/entities/cocina'
import { KdsTarjeta } from './KdsTarjeta'

interface Props {
  titulo: string
  pedidos: PedidoCocinaSummary[]
  onAvanzar: (pedidoId: number, nuevoEstado: string) => void
  pendingId: number | null
}

export function KdsColumna({ titulo, pedidos, onAvanzar, pendingId }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface">{titulo}</h2>
        <span className="text-sm text-on-surface-variant bg-surface-variant rounded-full px-3 py-0.5">
          {pedidos.length}
        </span>
      </div>
      {pedidos.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant text-sm border-2 border-dashed border-outline-variant rounded-xl">
          Sin pedidos
        </div>
      ) : (
        pedidos.map((p) => (
          <KdsTarjeta
            key={p.id}
            pedido={p}
            onAvanzar={onAvanzar}
            isPending={pendingId === p.id}
          />
        ))
      )}
    </div>
  )
}
