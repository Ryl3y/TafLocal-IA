import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { FormField, FormGroup, FormRow } from '../../../components/forms/FormField'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { ROLES } from '../../../constants/roles'
import { ROUTES } from '../../../constants/routes'
import { useAuth } from '../../../context'

const loginSchema = z.object({
  email: z.string().min(1, 'L’email est requis').email('Veuillez saisir un email valide.'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
})

const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis.'),
  lastName: z.string().min(2, 'Le nom est requis.'),
  email: z.string().min(1, 'L’email est requis').email('Veuillez saisir un email valide.'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
    .refine((value) => !/^\d+$/.test(value), 'Le mot de passe ne peut pas être uniquement numérique.'),
  role: z.enum([ROLES.CANDIDATE, ROLES.COMPANY] as const),
  companyName: z.string().optional(),
}).superRefine((values, ctx) => {
  if (values.role === ROLES.COMPANY && (!values.companyName || values.companyName.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Le nom de l\'entreprise est requis.',
      path: ['companyName'],
    })
  }
})

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const { login, register: registerUser, isAuthenticated, user, error, clearError } = useAuth()
  const navigate = useNavigate()

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: ROLES.CANDIDATE,
      companyName: '',
    },
  })

  const selectedRole = useWatch({ control: registerForm.control, name: 'role' })

  useEffect(() => {
    if (isAuthenticated && user) {
      const destination =
        user.role === ROLES.COMPANY
          ? ROUTES.COMPANY_DASHBOARD
          : user.role === ROLES.ADMIN
            ? ROUTES.ADMIN_DASHBOARD
            : ROUTES.DASHBOARD
      navigate(destination, { replace: true })
    }
  }, [isAuthenticated, navigate, user])

  useEffect(() => {
    clearError()
  }, [clearError, mode])

  const handleLogin = async (values: LoginFormValues) => {
    await login(values)
  }

  const handleRegister = async (values: RegisterFormValues) => {
    await registerUser({
      email: values.email,
      password: values.password,
      passwordConfirm: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      role: values.role,
      companyName: values.companyName,
    })
  }

  return (
    <PageShell
      eyebrow="Accès sécurisé"
      title={mode === 'login' ? 'Connexion à votre espace' : 'Créer votre compte'}
      description="Accédez à votre tableau de bord, analysez votre CV et préparez vos prochaines opportunités."
      className="mx-auto max-w-5xl"
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-primary-light/70 to-surface p-6">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em]">Bienvenue</span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-foreground">TafLocal AI vous accompagne à chaque étape.</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Analyse de CV, matching d’offres, préparation d’entretien et suivi de candidature : tout est centralisé dans un espace premium.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-foreground">
            <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Analyse IA en quelques minutes</li>
            <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Recommandations d’offres qualifiées</li>
            <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Feedback d’entretien personnalisé</li>
          </ul>
        </Card>

        <Card padding="lg" className="bg-surface">
          <CardHeader>
            <div className="flex rounded-full border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  loginForm.clearErrors()
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted'}`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  registerForm.clearErrors()
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === 'register' ? 'bg-primary text-primary-foreground' : 'text-muted'}`}
              >
                Inscription
              </button>
            </div>
            <CardTitle>{mode === 'login' ? 'Ravi de vous revoir' : 'Créer votre espace'}</CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Saisissez vos identifiants pour reprendre votre parcours.'
                : 'Choisissez votre profil et accédez à l’expérience adaptée.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
                {error}
              </div>
            )}

            {mode === 'login' ? (
              <form className="space-y-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
                <FormGroup>
                  <FormField label="Email" htmlFor="login-email" error={loginForm.formState.errors.email?.message}>
                    <Input id="login-email" type="email" placeholder="vous@exemple.com" {...loginForm.register('email')} />
                  </FormField>
                  <FormField label="Mot de passe" htmlFor="login-password" error={loginForm.formState.errors.password?.message}>
                    <Input id="login-password" type="password" placeholder="••••••••" {...loginForm.register('password')} />
                  </FormField>
                </FormGroup>
                <Button type="submit" fullWidth isLoading={loginForm.formState.isSubmitting}>
                  Se connecter <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={registerForm.handleSubmit(handleRegister)}>
                <FormRow>
                  <FormField label="Prénom" htmlFor="register-first-name" error={registerForm.formState.errors.firstName?.message}>
                    <Input id="register-first-name" placeholder="Camille" {...registerForm.register('firstName')} />
                  </FormField>
                  <FormField label="Nom" htmlFor="register-last-name" error={registerForm.formState.errors.lastName?.message}>
                    <Input id="register-last-name" placeholder="Martin" {...registerForm.register('lastName')} />
                  </FormField>
                </FormRow>
                <FormField label="Email" htmlFor="register-email" error={registerForm.formState.errors.email?.message}>
                  <Input id="register-email" type="email" placeholder="vous@exemple.com" {...registerForm.register('email')} />
                </FormField>
                <FormField label="Mot de passe" htmlFor="register-password" error={registerForm.formState.errors.password?.message}>
                  <Input id="register-password" type="password" placeholder="••••••••" {...registerForm.register('password')} />
                </FormField>
                <FormField label="Profil" htmlFor="register-role" error={registerForm.formState.errors.role?.message}>
                  <select
                    id="register-role"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground shadow-sm"
                    {...registerForm.register('role')}
                  >
                    <option value={ROLES.CANDIDATE}>Candidat</option>
                    <option value={ROLES.COMPANY}>Entreprise</option>
                  </select>
                </FormField>
                {selectedRole === ROLES.COMPANY && (
                  <FormField
                    label="Nom de l'entreprise"
                    htmlFor="register-company-name"
                    error={registerForm.formState.errors.companyName?.message}
                  >
                    <Input
                      id="register-company-name"
                      placeholder="TafLocal AI"
                      {...registerForm.register('companyName')}
                    />
                  </FormField>
                )}
                <Button type="submit" fullWidth isLoading={registerForm.formState.isSubmitting}>
                  Créer mon compte <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export default AuthPage
