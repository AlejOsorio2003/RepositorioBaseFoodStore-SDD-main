import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Header } from '@/shared/ui'
import { useAuthStore } from '@/shared/store/auth.store'
import { usePedidos, PedidoCard, PedidoDetailPanel } from '@/features/pedidos'

export function OrdersPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = usePedidos()
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null)

  /* 7.1 — Ruta protegida */
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (!user) return null

  /* 7.7 — Empty state */
  const pedidos = data?.items ?? []

  /* ─── Loading skeleton ─── */
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          <h1 className="font-headline text-2xl font-bold text-gray-800 mb-6">
            Mis Pedidos
          </h1>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse"
              >
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  /* ─── Empty state ─── */
  if (pedidos.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <h2 className="font-headline text-2xl font-semibold text-gray-800 mb-2">
            No tenés pedidos aún
          </h2>
          <p className="text-gray-500 mb-6">
            Hacé tu primer pedido desde el catálogo
          </p>
          <Link
            to="/catalog"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Ir al catálogo
          </Link>
        </div>
      </>
    )
  }

  /* ─── Lista de pedidos ─── */
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <h1 className="font-headline text-2xl font-bold text-gray-800 mb-6">
          Mis Pedidos
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 7.2 + 7.3 — Lista con PedidoCard */}
          <div className="flex-1 space-y-3">
            {pedidos.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                onClick={setSelectedPedidoId}
              />
            ))}
          </div>

          {/* 7.4 + 7.5 + 7.6 — Panel de detalle */}
          {selectedPedidoId && (
            <div className="w-full lg:w-96">
              <PedidoDetailPanel
                pedidoId={selectedPedidoId}
                onClose={() => setSelectedPedidoId(null)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
