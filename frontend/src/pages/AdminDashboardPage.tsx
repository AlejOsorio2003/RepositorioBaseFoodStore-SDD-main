import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { useAdminMetricas } from '@/features/admin'

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: '#f59e0b',
  CONFIRMADO: '#3b82f6',
  EN_PREPARACION: '#8b5cf6',
  EN_CAMINO: '#06b6d4',
  ENTREGADO: '#22c55e',
  CANCELADO: '#ef4444',
}

const ESTADOS_ACTIVOS = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO']

function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-3/4" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="h-64 bg-gray-100 rounded" />
    </div>
  )
}

export function AdminDashboardPage() {
  const { data: metricas, isLoading, isError } = useAdminMetricas()

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    )
  }

  if (isError || !metricas) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          Error al cargar las métricas. Intentá recargar la página.
        </div>
      </div>
    )
  }

  const totalPedidosActivos = ESTADOS_ACTIVOS.reduce(
    (sum, estado) => sum + (metricas.pedidos_por_estado[estado] ?? 0),
    0
  )

  const pieData = Object.entries(metricas.pedidos_por_estado).map(([estado, value]) => ({
    name: estado,
    value,
  }))

  const barData = metricas.top_productos.map((p) => ({
    name: p.nombre.length > 15 ? p.nombre.substring(0, 15) + '…' : p.nombre,
    total: p.total_vendido,
  }))

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total ventas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Ventas</p>
          <p className="text-2xl font-bold text-gray-900">{formatARS(metricas.total_ventas)}</p>
        </div>

        {/* Stock bajo */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Productos Stock Bajo</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">{metricas.productos_stock_bajo}</p>
            {metricas.productos_stock_bajo > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                Alerta
              </span>
            )}
          </div>
        </div>

        {/* Pedidos activos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Pedidos Activos</p>
          <p className="text-2xl font-bold text-gray-900">{totalPedidosActivos}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart: top productos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Top Productos Vendidos</h2>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              Sin datos de ventas aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#721016" radius={[4, 4, 0, 0]} name="Vendidos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart: pedidos por estado */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Pedidos por Estado</h2>
          {pieData.length === 0 || pieData.every((d) => d.value === 0) ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              Sin pedidos registrados
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name.replace('_', ' ')} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={ESTADO_COLORS[entry.name] ?? '#9ca3af'}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [val, 'Pedidos']} />
                <Legend
                  formatter={(value) => value.replace(/_/g, ' ')}
                  iconSize={10}
                  wrapperStyle={{ fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
