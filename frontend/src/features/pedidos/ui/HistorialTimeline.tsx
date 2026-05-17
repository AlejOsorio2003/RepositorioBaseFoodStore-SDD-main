import type { HistorialRead } from '@/entities/pedido'

interface HistorialTimelineProps {
  historial: HistorialRead[]
}

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  EN_PREP: 'bg-orange-100 text-orange-800',
  EN_CAMINO: 'bg-purple-100 text-purple-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

const ESTADO_DOT_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-yellow-400',
  CONFIRMADO: 'bg-blue-400',
  EN_PREP: 'bg-orange-400',
  EN_CAMINO: 'bg-purple-400',
  ENTREGADO: 'bg-green-400',
  CANCELADO: 'bg-red-400',
}

/**
 * Timeline vertical del historial de estados de un pedido.
 */
export function HistorialTimeline({ historial }: HistorialTimelineProps) {
  if (historial.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">Sin historial disponible</p>
  }

  return (
    <div className="relative pl-8 space-y-6">
      {historial.map((entry, index) => {
        const badgeColor = ESTADO_COLORS[entry.estado_nombre] ?? 'bg-gray-100 text-gray-800'
        const dotColor = ESTADO_DOT_COLORS[entry.estado_nombre] ?? 'bg-gray-400'
        const isLast = index === historial.length - 1

        return (
          <div key={entry.id} className="relative">
            {/* Línea vertical conectora */}
            {!isLast && (
              <div className="absolute left-[11px] top-3 bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Punto del timeline */}
            <div
              className={`absolute -left-8 top-1 w-[26px] h-[26px] rounded-full border-2 border-white ${dotColor} flex items-center justify-center shadow-sm`}
            >
              <span className="text-white text-[10px] font-bold">{index + 1}</span>
            </div>

            {/* Contenido */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>
                  {entry.estado_nombre}
                </span>
                <span className="text-[11px] text-gray-400">
                  {new Date(entry.creado_en).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {entry.notas && (
                <p className="text-sm text-gray-600 mt-1 italic">
                  &ldquo;{entry.notas}&rdquo;
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
