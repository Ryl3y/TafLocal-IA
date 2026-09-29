import { Bell, ChevronRight, KeyRound, LogOut, Moon, UserRound, type LucideIcon } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../../app/providers'
import { PageShell } from '../../../components/common'
import { Card } from '../../../components/cards/Card'
import { FormField } from '../../../components/forms/FormField'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Switch } from '../../../components/ui/Switch'
import { ROUTES } from '../../../constants/routes'
import { useAuth } from '../../../context/AuthContext'
import { errorMessage } from '../../../services/api/apiClient'
import { changePassword } from '../../../services/api/authServices'

const rowClass =
  'flex w-full items-center gap-4 px-5 py-4 text-left text-sm text-foreground transition-colors hover:bg-field/60'

function RowIcon({ icon: Icon, danger = false }: { icon: LucideIcon; danger?: boolean }) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger ? 'bg-error/10 text-error' : 'bg-field text-foreground'}`}
    >
      <Icon className="h-5 w-5" />
    </span>
  )
}

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="px-1 text-sm font-semibold text-muted">{title}</h2>
      <Card padding="none" className="divide-y divide-border overflow-hidden">
        {children}
      </Card>
    </section>
  )
}

export function SettingsPage() {
  const { user, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les deux nouveaux mots de passe ne correspondent pas.' })
      return
    }
    setIsSaving(true)
    setMessage(null)
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword })
      setMessage({ type: 'success', text: 'Mot de passe modifié.' })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error, 'Le changement de mot de passe a échoué.') })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.AUTH, { replace: true })
  }

  return (
    <PageShell eyebrow="Préférences" title="Paramètres" description={user?.email} className="mx-auto max-w-2xl">
      <SettingsGroup title="Compte">
        <Link to={ROUTES.PROFILE} className={rowClass}>
          <RowIcon icon={UserRound} />
          <span className="flex-1">Informations personnelles</span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
        <Link to={ROUTES.NOTIFICATIONS} className={rowClass}>
          <RowIcon icon={Bell} />
          <span className="flex-1">Notifications</span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
        <div>
          <button
            type="button"
            className={rowClass}
            aria-expanded={showPassword}
            onClick={() => setShowPassword((open) => !open)}
          >
            <RowIcon icon={KeyRound} />
            <span className="flex-1">Changer le mot de passe</span>
            <ChevronRight className={`h-4 w-4 text-muted transition-transform ${showPassword ? 'rotate-90' : ''}`} />
          </button>
          {showPassword && (
            <form className="space-y-4 px-5 pt-1 pb-5" onSubmit={(e) => void handleSubmit(e)}>
              <p className="text-xs text-muted">8 caractères minimum, pas uniquement des chiffres.</p>
              <FormField label="Mot de passe actuel" htmlFor="old-password">
                <Input id="old-password" type="password" autoComplete="current-password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              </FormField>
              <FormField label="Nouveau mot de passe" htmlFor="new-password">
                <Input id="new-password" type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </FormField>
              <FormField label="Confirmer le nouveau mot de passe" htmlFor="confirm-password">
                <Input id="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </FormField>
              {message && (
                <div className={`rounded-lg px-4 py-3 text-sm ${message.type === 'success' ? 'bg-secondary-light text-foreground' : 'bg-error/10 text-error'}`}>
                  {message.text}
                </div>
              )}
              <Button type="submit" fullWidth isLoading={isSaving}>Modifier le mot de passe</Button>
            </form>
          )}
        </div>
      </SettingsGroup>

      <SettingsGroup title="Affichage">
        <div className={rowClass}>
          <RowIcon icon={Moon} />
          <span className="flex-1">Mode sombre</span>
          <Switch
            aria-label="Mode sombre"
            checked={resolvedTheme === 'dark'}
            onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')}
          />
        </div>
      </SettingsGroup>

      <SettingsGroup title="Session">
        <button type="button" className={`${rowClass} text-error hover:bg-error/5`} onClick={() => void handleLogout()}>
          <RowIcon icon={LogOut} danger />
          <span className="flex-1 font-medium">Se déconnecter</span>
        </button>
      </SettingsGroup>
    </PageShell>
  )
}

export default SettingsPage
