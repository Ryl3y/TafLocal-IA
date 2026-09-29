import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Building2, Check, ShieldCheck, UserRound } from 'lucide-react'
import logo from '../../../assets/logos/TafLocal_AI_Logo_round.png'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { FormField, FormGroup, FormRow } from '../../../components/forms/FormField'
import { PdfFileInput } from '../../../components/forms/PdfFileInput'
import { pdfFileError } from '../../../utils/pdfFile'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { ROLES } from '../../../constants/roles'
import { ROUTES } from '../../../constants/routes'
import { useAuth } from '../../../context'
import { AccountTypeChooser, type AccountType } from '../components/AccountTypeChooser'

const loginSchema = z.object({
  email: z.string().min(1, 'L’email est requis').email('Veuillez saisir un email valide.'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
})

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Le prénom est requis.'),
    lastName: z.string().min(2, 'Le nom est requis.'),
    email: z.string().min(1, 'L’email est requis').email('Veuillez saisir un email valide.'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
      .refine(
        (value) => !/^\d+$/.test(value),
        'Le mot de passe ne peut pas être uniquement numérique.',
      ),
    role: z.enum([ROLES.CANDIDATE, ROLES.COMPANY] as const),
    companyName: z.string().optional(),
    registreCommerce: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.role === ROLES.COMPANY &&
      (!values.companyName || values.companyName.trim().length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le nom de l'entreprise est requis.",
        path: ['companyName'],
      })
    }
    // Même contrôle de forme que le backend (le numéro est ensuite vérifié par un administrateur).
    const rccm = (values.registreCommerce ?? '').trim().toUpperCase()
    if (
      values.role === ROLES.COMPANY &&
      (!/^[A-Z0-9][A-Z0-9/\-. ]{3,48}[A-Z0-9]$/.test(rccm) || (rccm.match(/\d/g) ?? []).length < 4)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: rccm
          ? 'Numéro RCCM invalide. Exemple : RC/DLA/2020/B/01234.'
          : 'Le numéro RCCM est requis.',
        path: ['registreCommerce'],
      })
    }
  })

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

export function AuthPage() {
  // Le mode vit dans l'URL (/auth?mode=register) : les liens « Créer un compte » ouvrent directement l'inscription.
  const [searchParams, setSearchParams] = useSearchParams()
  const mode: 'login' | 'register' = searchParams.get('mode') === 'register' ? 'register' : 'login'
  // Inscription en deux étapes : choix du type de compte (?type=candidat|entreprise), puis formulaire dédié.
  const typeParam = searchParams.get('type')
  const accountType: AccountType | null =
    mode === 'register' && (typeParam === 'candidat' || typeParam === 'entreprise')
      ? typeParam
      : null
  const isCompany = accountType === 'entreprise'
  const setMode = (next: 'login' | 'register') =>
    setSearchParams(next === 'register' ? { mode: 'register' } : {}, { replace: true })
  // Navigation « poussée » : le bouton Retour du navigateur ramène au choix du type.
  const chooseAccountType = (type: AccountType) => setSearchParams({ mode: 'register', type })
  const resetAccountType = () => setSearchParams({ mode: 'register' })
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
      registreCommerce: '',
    },
  })

  // Le rôle n'est plus choisi dans le formulaire : il découle du type choisi à l'étape précédente.
  useEffect(() => {
    if (!accountType) return
    registerForm.setValue('role', accountType === 'entreprise' ? ROLES.COMPANY : ROLES.CANDIDATE)
    registerForm.clearErrors()
  }, [accountType, registerForm])

  const selectedRole = useWatch({ control: registerForm.control, name: 'role' })
  // Le PDF est géré hors de react-hook-form (fichier binaire), puis contrôlé à l'envoi.
  const [rccmFile, setRccmFile] = useState<File | null>(null)
  const [rccmFileError, setRccmFileError] = useState<string | null>(null)

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
    if (values.role === ROLES.COMPANY) {
      const fileError = pdfFileError(rccmFile)
      setRccmFileError(fileError)
      if (fileError) return
    }
    await registerUser({
      email: values.email,
      password: values.password,
      passwordConfirm: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      role: values.role,
      companyName: values.companyName,
      registreCommerce: values.registreCommerce,
      documentRccm: values.role === ROLES.COMPANY ? rccmFile : null,
    })
  }

  return (
    <div className="grid w-full overflow-hidden rounded-3xl bg-surface shadow-md lg:grid-cols-[0.95fr_1.05fr]">
      {/* Panneau de présentation (grand écran) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/40 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-primary/25 blur-2xl"
          aria-hidden
        />
        <div className="relative flex items-center gap-2">
          <img src={logo} alt="" className="h-10 w-10 rounded-full bg-white" />
          <span className="text-2xl font-bold">TafLocal</span>
        </div>
        <div className="relative space-y-6">
          <h2 className="text-3xl leading-tight font-semibold">
            {isCompany
              ? 'Recrutez les bons talents, en toute confiance.'
              : 'Trouvez l’emploi de vos rêves, simplement et rapidement.'}
          </h2>
          <ul className="space-y-3 text-sm text-white/80">
            {(isCompany
              ? [
                  'Publiez vos offres en quelques minutes',
                  'Candidatures classées par compatibilité IA',
                  'Entreprise vérifiée : un gage de confiance',
                ]
              : [
                  'Analyse IA de votre CV en quelques minutes',
                  'Offres classées selon votre profil',
                  'Entraînement aux entretiens avec feedback',
                ]
            ).map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative flex gap-1.5" aria-hidden>
          <span className="h-1.5 w-8 rounded-full bg-white" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        </div>
      </aside>

      {/* Formulaire */}
      <section className="px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <p className="text-center text-lg font-bold text-primary lg:hidden">TafLocal</p>
          <h1 className="mt-2 text-center text-2xl font-bold text-foreground">
            {mode === 'login'
              ? 'Ravi de vous revoir'
              : !accountType
                ? 'Quel compte souhaitez-vous créer ?'
                : isCompany
                  ? 'Créer votre compte entreprise'
                  : 'Créer votre compte candidat'}
          </h1>
          <p className="mt-2 text-center text-sm leading-6 text-muted">
            {mode === 'login'
              ? 'Saisissez vos identifiants pour reprendre votre parcours.'
              : !accountType
                ? 'Choisissez votre profil : le formulaire sera adapté à vos besoins.'
                : isCompany
                  ? 'Publiez vos offres et recevez des candidatures classées par l’IA.'
                  : 'Analysez votre CV et trouvez les offres qui vous correspondent.'}
          </p>

          <div
            role="tablist"
            aria-label="Type d’accès"
            className="my-8 grid grid-cols-2 gap-1 rounded-full bg-field p-1.5"
          >
            {(
              [
                ['login', 'Connexion'],
                ['register', 'Inscription'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => {
                  setMode(value)
                  if (value === 'login') loginForm.clearErrors()
                  else registerForm.clearErrors()
                }}
                className={`rounded-full px-4 py-2.5 text-center text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  mode === value
                    ? 'bg-surface text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</div>
          )}

          {mode === 'login' ? (
            <form className="space-y-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
              <FormGroup>
                <FormField
                  label="Email"
                  htmlFor="login-email"
                  error={loginForm.formState.errors.email?.message}
                >
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    {...loginForm.register('email')}
                  />
                </FormField>
                <FormField
                  label="Mot de passe"
                  htmlFor="login-password"
                  error={loginForm.formState.errors.password?.message}
                >
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                  />
                </FormField>
              </FormGroup>
              <div className="-mt-1 flex justify-end">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={loginForm.formState.isSubmitting}
              >
                Se connecter <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : !accountType ? (
            <div className="space-y-5">
              <AccountTypeChooser onChoose={chooseAccountType} />
              <p className="text-center text-sm text-muted">
                Déjà inscrit ?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-medium text-primary hover:underline"
                >
                  Se connecter
                </button>
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={registerForm.handleSubmit(handleRegister)}>
              {/* Rappel du type choisi, modifiable */}
              <div className="flex items-center justify-between gap-3 rounded-xl bg-field px-4 py-2.5 text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  {isCompany ? (
                    <Building2 className="h-4 w-4 text-secondary" />
                  ) : (
                    <UserRound className="h-4 w-4 text-primary" />
                  )}
                  {isCompany ? 'Compte entreprise' : 'Compte candidat'}
                </span>
                <button
                  type="button"
                  onClick={resetAccountType}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Changer
                </button>
              </div>

              {isCompany && (
                <>
                  <FormField
                    label="Nom de l'entreprise"
                    htmlFor="register-company-name"
                    error={registerForm.formState.errors.companyName?.message}
                  >
                    <Input
                      id="register-company-name"
                      placeholder="Ex. Tech Cameroun SARL"
                      autoComplete="organization"
                      {...registerForm.register('companyName')}
                    />
                  </FormField>
                  <FormField
                    label="Numéro de registre de commerce (RCCM)"
                    htmlFor="register-rccm"
                    hint="Exemple : RC/DLA/2020/B/01234"
                    error={registerForm.formState.errors.registreCommerce?.message}
                  >
                    <Input
                      id="register-rccm"
                      placeholder="RC/DLA/2020/B/01234"
                      autoComplete="off"
                      className="uppercase"
                      {...registerForm.register('registreCommerce')}
                    />
                  </FormField>
                  <PdfFileInput
                    label="Copie du certificat RCCM (PDF)"
                    value={rccmFile}
                    onChange={(file) => {
                      setRccmFile(file)
                      setRccmFileError(file ? pdfFileError(file) : null)
                    }}
                    error={rccmFileError}
                    hint="Visible uniquement par notre équipe de vérification."
                  />
                  <p className="pt-2 text-xs font-semibold tracking-wide text-muted uppercase">
                    Responsable du compte
                  </p>
                </>
              )}

              <FormRow>
                <FormField
                  label="Prénom"
                  htmlFor="register-first-name"
                  error={registerForm.formState.errors.firstName?.message}
                >
                  <Input
                    id="register-first-name"
                    placeholder="Camille"
                    {...registerForm.register('firstName')}
                  />
                </FormField>
                <FormField
                  label="Nom"
                  htmlFor="register-last-name"
                  error={registerForm.formState.errors.lastName?.message}
                >
                  <Input
                    id="register-last-name"
                    placeholder="Martin"
                    {...registerForm.register('lastName')}
                  />
                </FormField>
              </FormRow>
              <FormField
                label={isCompany ? 'Email professionnel' : 'Email'}
                htmlFor="register-email"
                error={registerForm.formState.errors.email?.message}
              >
                <Input
                  id="register-email"
                  type="email"
                  placeholder="vous@exemple.com"
                  {...registerForm.register('email')}
                />
              </FormField>
              <FormField
                label="Mot de passe"
                htmlFor="register-password"
                error={registerForm.formState.errors.password?.message}
              >
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register('password')}
                />
              </FormField>
              {selectedRole === ROLES.COMPANY && (
                <p className="flex gap-2 rounded-lg bg-pastel-blue px-4 py-3 text-xs leading-5 text-foreground">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                  Pour protéger les candidats contre les fausses offres, votre compte sera activé
                  après vérification de votre RCCM par notre équipe.
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={registerForm.formState.isSubmitting}
              >
                Créer mon compte <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

export default AuthPage
