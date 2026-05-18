import {
  useAdminUsuarios,
  useToggleEstadoUsuario,
  useCambiarRol,
  type UsuarioAdmin,
} from '@/features/admin'

const ROL_OPTIONS = ['CLIENT', 'ADMIN', 'STOCK', 'PEDIDOS']

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
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

function RolSelect({ usuario }: { usuario: UsuarioAdmin }) {
  const cambiarRol = useCambiarRol()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRol = e.target.value
    if (newRol !== usuario.rol) {
      cambiarRol.mutate({ id: usuario.id, rol: newRol })
    }
  }

  return (
    <select
      value={usuario.rol}
      onChange={handleChange}
      disabled={cambiarRol.isPending}
      className="px-2 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#721016] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {ROL_OPTIONS.map((rol) => (
        <option key={rol} value={rol}>
          {rol}
        </option>
      ))}
    </select>
  )
}

function ActivoToggle({ usuario }: { usuario: UsuarioAdmin }) {
  const toggleEstado = useToggleEstadoUsuario()

  const handleChange = (newActivo: boolean) => {
    toggleEstado.mutate({ id: usuario.id, activo: newActivo })
  }

  return (
    <ToggleSwitch
      checked={usuario.activo}
      onChange={handleChange}
      disabled={toggleEstado.isPending}
    />
  )
}

export function AdminUsuariosPage() {
  const { data: usuarios, isLoading, isError } = useAdminUsuarios()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Usuarios</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#721016]" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-16 text-red-600 text-sm">
            Error al cargar usuarios.
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
                    Email
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Activo
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!usuarios || usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No hay usuarios
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ backgroundColor: '#721016' }}
                          >
                            {usuario.nombre?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">
                            {usuario.nombre} {usuario.apellido}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{usuario.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <RolSelect usuario={usuario} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <ActivoToggle usuario={usuario} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500 text-xs">
                        {formatDate(usuario.fecha_creacion)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
