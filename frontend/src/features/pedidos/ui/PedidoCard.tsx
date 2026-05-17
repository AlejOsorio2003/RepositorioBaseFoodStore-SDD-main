import type { PedidoRead } from '@/entities/pedido'

interface PedidoCardProps {
  pedido: PedidoRead
  onClick: (id: number) => void
}

const estadoColores: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  PREPARANDO: 'bg-indigo-100 text-indigo-800',
  ENVIADO: 'bg-purple-100 text-purple-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

export function PedidoCard({ pedido, onClick }: PedidoCardProps) {
  const formattedTotal = Number(pedido.total).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })

  const formattedDate = new Date(pedido.created_at).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const chipClass = estadoColores[pedido.estado_nombre] ?? 'bg-gray-100 text-gray-800'

  return (
    <div
      onClick={() => onClick(pedido.id)}
      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-headline font-semibold text-gray-800">
          Pedido #{pedido.id}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${chipClass}`}
        >
          {pedido.estado_nombre}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{formattedDate}</span>
        <span className="font-semibold text-gray-800">{formattedTotal}</span>
      </div>
    </div>
  )
}
