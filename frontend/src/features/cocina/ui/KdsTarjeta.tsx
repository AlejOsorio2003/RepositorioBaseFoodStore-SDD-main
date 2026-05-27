import { useEffect, useState } from 'react'
import type { PedidoCocinaSummary } from '@/entities/cocina'

interface Props {
  pedido: PedidoCocinaSummary
  onAvanzar: (pedidoId: number, nuevoEstado: string) => void
  isPending: boolean
}

function formatTime(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function KdsTarjeta({ pedido, onAvanzar, isPending }: Props) {
  const [elapsed, setElapsed] = useState(pedido.tiempo_desde_confirmado)

  useEffect(() => {
    setElapsed(pedido.tiempo_desde_confirmado)
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(interval)
  }, [pedido.id, pedido.tiempo_desde_confirmado])

  const urgencyClass =
    elapsed >= 1200
      ? 'border-red-500 bg-red-50'
      : elapsed >= 600
        ? 'border-yellow-400 bg-yellow-50'
        : 'border-outline-variant bg-surface'

  const timerClass =
    elapsed >= 1200
      ? 'text-red-600 font-bold'
      : elapsed >= 600
        ? 'text-yellow-600 font-semibold'
        : 'text-on-surface-variant'

  const esConfirmado = pedido.estado_nombre === 'CONFIRMADO'
  const botonTexto = esConfirmado ? 'Iniciar preparación' : 'Listo para envío'
  const nuevoEstado = esConfirmado ? 'EN_PREP' : 'EN_CAMINO'

  return (
    <div className={`rounded-xl border-2 p-4 shadow-sm transition-colors ${urgencyClass}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-on-surface text-lg">#{pedido.id}</span>
        <span className={`text-sm font-mono ${timerClass}`}>{formatTime(elapsed)}</span>
      </div>

      <ul className="space-y-1 mb-4">
        {pedido.items.map((item, i) => (
          <li key={i} className="text-sm text-on-surface">
            <span className="font-medium">{item.cantidad}x</span> {item.nombre_snapshot}
            {item.personalizacion && item.personalizacion.length > 0 && (
              <span className="text-xs text-on-surface-variant block pl-4">
                Sin: IDs {item.personalizacion.join(', ')}
              </span>
            )}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onAvanzar(pedido.id, nuevoEstado)}
        disabled={isPending}
        className="w-full py-2 px-4 rounded-lg bg-primary text-white font-medium text-sm
                   hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2 transition-colors"
      >
        {isPending ? (
          <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          botonTexto
        )}
      </button>
    </div>
  )
}
