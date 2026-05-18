import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { useAuthStore } from '@/shared/store/auth.store'

const ADMIN_ROLES = ['ADMIN', 'STOCK', 'PEDIDOS']

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((s) => s.login)

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => {
      const redirect = searchParams.get('redirect')
      if (redirect) return navigate(redirect)
      const user = useAuthStore.getState().user
      if (user?.roles.some((r) => ADMIN_ROLES.includes(r))) {
        navigate('/admin')
      } else {
        navigate('/catalog')
      }
    },
  })

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      mutation.mutate(value)
    },
  })

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center p-4">
      <div className="w-full rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center font-headline text-2xl font-bold text-on-surface">
          Iniciar Sesión
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
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
                  className="mb-1 block text-sm font-medium text-on-surface"
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
                  className="w-full rounded-md border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="tu@email.com"
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-error">
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
                !value ? 'La contraseña es requerida' : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-1 block text-sm font-medium text-on-surface"
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
                  className="w-full rounded-md border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-error">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          {mutation.isError && (
            <p className="text-sm text-error">
              {(() => {
                const err = mutation.error as any
                const msg = err?.response?.data?.detail || err?.response?.data?.error || err?.message
                if (msg?.includes('Rate limit') || msg?.includes('rate limit')) return 'Demasiados intentos. Esperá unos minutos.'
                if (msg?.includes('Credenciales') || err?.response?.status === 401) return 'Credenciales inválidas. Verificá tu email y contraseña.'
                return msg || 'Error al iniciar sesión. Intentá de nuevo.'
              })()}
            </p>
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
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-on-surface-variant">
          ¿No tenés cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:text-primary"
          >
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
