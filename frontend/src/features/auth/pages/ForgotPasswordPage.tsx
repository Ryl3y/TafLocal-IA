import { ArrowLeft, Check, Eye, EyeOff, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../../assets/logos/TafLocal_AI_Logo_round.png'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { ROUTES } from '../../../constants/routes'
import { errorMessage } from '../../../services/api/apiClient'
import {
  confirmPasswordReset,
  requestPasswordReset,
  verifyPasswordResetCode,
} from '../../../services/api/authServices'
import { cn } from '../../../utils/cn'

type Step = 'request' | 'verify' | 'reset' | 'done'
const CODE_LENGTH = 6

const COPY: Record<Step, { title: string; subtitle: (email: string) => string }> = {
  request: {
    title: 'Mot de passe oublié',
    subtitle: () => 'Saisissez l’adresse e-mail de votre compte : nous vous enverrons un code de vérification.',
  },
  verify: {
    title: 'Vérifiez vos e-mails',
    subtitle: (email) =>
      `Saisissez le code à 6 chiffres envoyé à ${email}. Pensez à regarder dans les courriers indésirables.`,
  },
  reset: {
    title: 'Nouveau mot de passe',
    subtitle: () => 'Choisissez un mot de passe d’au moins 8 caractères, qui ne soit pas uniquement numérique.',
  },
  done: {
    title: 'Mot de passe modifié',
    subtitle: () => 'Votre mot de passe a été réinitialisé. Par sécurité, vos autres sessions ont été déconnectées.',
  },
}

/** Six cases de saisie : avance automatique, retour arrière, collage d'un code complet. */
function CodeInput({ value, onChange, hasError }: { value: string; onChange: (code: string) => void; hasError: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] ?? '')

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice()
    next[index] = digit
    onChange(next.join('').slice(0, CODE_LENGTH))
    if (digit && index < CODE_LENGTH - 1) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      setDigit(index - 1, '')
      refs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return
    event.preventDefault()
    onChange(pasted)
    refs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="Code de vérification">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          aria-label={`Chiffre ${index + 1}`}
          value={digit}
          onChange={(event) => setDigit(index, event.target.value.replace(/\D/g, '').slice(-1))}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          className={cn(
            'h-14 w-11 rounded-xl border-2 bg-surface text-center text-xl font-semibold text-foreground transition-colors focus-visible:outline-none sm:w-12',
            hasError ? 'border-error' : digit ? 'border-primary' : 'border-border focus-visible:border-secondary',
          )}
        />
      ))}
    </div>
  )
}

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = window.setTimeout(() => setResendIn((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendIn])

  const run = async (action: () => Promise<void>) => {
    setIsBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(errorMessage(err).replace(/^\w+ : /, ''))
    } finally {
      setIsBusy(false)
    }
  }

  const sendCode = (event?: FormEvent) => {
    event?.preventDefault()
    void run(async () => {
      const response = await requestPasswordReset(email.trim())
      setResendIn(response.resend_after_seconds)
      setInfo(`Code valable ${response.expires_in_minutes} minutes.`)
      setCode('')
      setStep('verify')
    })
  }

  const checkCode = (event: FormEvent) => {
    event.preventDefault()
    void run(async () => {
      setToken(await verifyPasswordResetCode(email.trim(), code))
      setStep('reset')
    })
  }

  const savePassword = (event: FormEvent) => {
    event.preventDefault()
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    if (/^\d+$/.test(password)) {
      setError('Le mot de passe ne peut pas être uniquement numérique.')
      return
    }
    void run(async () => {
      await confirmPasswordReset(token, password)
      setStep('done')
    })
  }

  const goBack = () => {
    setError(null)
    if (step === 'verify') setStep('request')
  }

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-surface px-6 py-8 shadow-md sm:px-10">
      <div className="relative flex items-center justify-center">
        {step === 'verify' ? (
          <button type="button" onClick={goBack} aria-label="Retour" className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full hover:bg-field">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : step === 'request' ? (
          <Link to={ROUTES.AUTH} aria-label="Retour à la connexion" className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full hover:bg-field">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        ) : null}
        <img src={logo} alt="TafLocal AI" className="h-12 w-12 rounded-full bg-white shadow-sm" />
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
        {step === 'done' && (
          <div className="mt-6 flex justify-center" aria-hidden>
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-pastel-mint text-secondary">
              <Check className="h-10 w-10" strokeWidth={3} />
            </span>
          </div>
        )}
        <h1 className="mt-5 text-center text-2xl font-bold text-foreground">{COPY[step].title}</h1>
        <p className="mt-2 text-center text-sm leading-6 text-muted">{COPY[step].subtitle(email.trim())}</p>

        {error && <div role="alert" className="mt-5 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}

        {step === 'request' && (
          <form className="mt-6 space-y-5" onSubmit={sendCode}>
            <label className="block">
              <span className="sr-only">Adresse e-mail</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted" />
                <Input type="email" required autoFocus autoComplete="email" placeholder="vous@exemple.com" className="pl-12" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </label>

            <Button type="submit" size="lg" fullWidth isLoading={isBusy} disabled={!email.trim()}>
              Envoyer le code
            </Button>
          </form>
        )}

        {step === 'verify' && (
          <form className="mt-6 space-y-6" onSubmit={checkCode}>
            <CodeInput value={code} onChange={(value) => { setCode(value); setError(null) }} hasError={Boolean(error)} />
            {info && <p className="text-center text-xs text-muted">{info}</p>}
            <Button type="submit" size="lg" fullWidth isLoading={isBusy} disabled={code.length !== CODE_LENGTH}>
              Vérifier
            </Button>
            <p className="text-center text-sm text-muted">
              Vous n’avez rien reçu ?{' '}
              {resendIn > 0 ? (
                <span>Renvoyer dans {resendIn} s</span>
              ) : (
                <button type="button" className="font-medium text-primary hover:underline" onClick={() => sendCode()} disabled={isBusy}>
                  Renvoyer le code
                </button>
              )}
            </p>
          </form>
        )}

        {step === 'reset' && (
          <form className="mt-6 space-y-4" onSubmit={savePassword}>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-foreground">Nouveau mot de passe</span>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" className="pr-12" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-foreground">Confirmer le mot de passe</span>
              <Input type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={confirm} hasError={Boolean(confirm) && confirm !== password} onChange={(e) => setConfirm(e.target.value)} />
            </label>
            <ul className="space-y-1 text-xs">
              {[
                [password.length >= 8, 'Au moins 8 caractères'],
                [Boolean(password) && !/^\d+$/.test(password), 'Pas uniquement des chiffres'],
                [Boolean(confirm) && confirm === password, 'Les deux saisies correspondent'],
              ].map(([ok, label]) => (
                <li key={String(label)} className={cn('flex items-center gap-2', ok ? 'text-secondary' : 'text-muted')}>
                  <Check className={cn('h-3.5 w-3.5', !ok && 'opacity-30')} /> {label}
                </li>
              ))}
            </ul>
            <Button type="submit" size="lg" fullWidth isLoading={isBusy}>
              Réinitialiser le mot de passe
            </Button>
          </form>
        )}

        {step === 'done' && (
          <Link to={ROUTES.AUTH} className="mt-8 block">
            <Button size="lg" fullWidth>Se connecter</Button>
          </Link>
        )}
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
