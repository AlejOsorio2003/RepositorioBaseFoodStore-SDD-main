import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

import { api } from '@/shared/api/axios'

export function RegisterPage() {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (data: {
      nombre: string
      apellido: string
      email: string
      password: string
      telefono?: string
    }) => api.post('/auth/register', data),
    onSuccess: () => navigate('/login'),
  })

  const form = useForm({
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      telefono: '',
    },
    onSubmit: async ({ value }) => {
      const { telefono, ...rest } = value
      mutation.mutate({
        ...rest,
        telefono: telefono || undefined,
      })
    },
  })

  const errorMessage = (() => {
    if (!mutation.isError) return null
    if (
      axios.isAxiosError(mutation.error) &&
      mutation.error.response?.status === 409
    ) {
      return 'Este email ya está registrado'
    }
    return 'Error al registrarse. Intentalo de nuevo.'
  })()

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center p-4">
      <div className="w-full rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center font-headline text-2xl font-bold text-gray-900">
          Crear Cuenta
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="nombre"
              validators={{
                onChange: ({ value }) =>
                  !value ? 'El nombre es requerido' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Nombre
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Juan"
                  />
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-xs text-red-600">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="apellido"
              validators={{
                onChange: ({ value }) =>
                  !value ? 'El apellido es requerido' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Apellido
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Pérez"
                  />
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-xs text-red-600">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    )}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !value ? 'El email es requerido' : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="tu@email.com"
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-600">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'La contraseña es requerida'
                  : value.length < 6
                    ? 'Mínimo 6 caracteres'
                    : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-600">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          <form.Field name="telefono">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Teléfono{' '}
                  <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="+54 11 5555-5555"
                />
              </div>
            )}
          </form.Field>

          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
