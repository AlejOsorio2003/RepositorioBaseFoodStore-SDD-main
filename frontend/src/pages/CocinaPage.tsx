import { useState } from 'react'
import { KdsColumna, useCocina, useCocinaWs } from '@/features/cocina'

export function CocinaPage() {
  const { query, mutation } = useCocina()
  const { wsStatus } = useCocinaWs()
  const [pendingId, setPendingId] = useState<number | null>(null)

  const handleAvanzar = (pedidoId: number, nuevoEstado: string) => {
    setPendingId(pedidoId)
    mutation.mutate(
      { pedidoId, nuevoEstado },
      {
        onSettled: () => setPendingId(null),
      },
    )
  }

  const pedidos = query.data ?? []
  const porPreparar = pedidos.filter((p) => p.estado_nombre === 'CONFIRMADO')
  const enPreparacion = pedidos.filter((p) => p.estado_nombre === 'EN_PREP')

  if (query.isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-7 bg-surface-variant rounded animate-pulse w-40" />
              {[0, 1, 2].map((j) => (
                <div key={j} className="h-36 bg-surface-variant rounded-xl animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-error font-medium">Error al cargar pedidos</p>
          <button
            onClick={() => query.refetch()}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-4 border-b border-outline-variant bg-surface flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface">Display de Cocina</h1>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`h-2 w-2 rounded-full ${
              wsStatus === 'connected'
                ? 'bg-green-500'
                : wsStatus === 'polling'
                  ? 'bg-yellow-400'
                  : 'bg-red-500'
            }`}
          />
          <span className="text-on-surface-variant">
            {wsStatus === 'connected'
              ? 'En línea'
              : wsStatus === 'polling'
                ? 'Modo offline (actualizando cada 30 s)'
                : 'Error de conexión'}
          </span>
        </div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <KdsColumna
          titulo="Por preparar"
          pedidos={porPreparar}
          onAvanzar={handleAvanzar}
          pendingId={pendingId}
        />
        <KdsColumna
          titulo="En preparación"
          pedidos={enPreparacion}
          onAvanzar={handleAvanzar}
          pendingId={pendingId}
        />
      </div>
    </div>
  )
}
