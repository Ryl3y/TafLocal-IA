import { KeyRound, LogOut } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { FormField } from '../../../components/forms/FormField'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { ROUTES } from '../../../constants/routes'
import { useAuth } from '../../../context/AuthContext'
import { errorMessage } from '../../../services/api/apiClient'
import { changePassword } from '../../../services/api/authServices'

export function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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
    <PageShell eyebrow="Préférences" title="Paramètres du compte" description={user?.email}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <CardTitle>Mot de passe</CardTitle>
            </div>
            <CardDescription>8 caractères minimum, pas uniquement des chiffres.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
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
                <div className={`rounded-xl border p-3 text-sm ${message.type === 'success' ? 'border-secondary/20 bg-secondary-light/40' : 'border-error/20 bg-error/10 text-error'}`}>
                  {message.text}
                </div>
              )}
              <Button type="submit" isLoading={isSaving}>Modifier le mot de passe</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-primary" />
              <CardTitle>Session</CardTitle>
            </div>
            <CardDescription>Votre jeton de connexion est révoqué côté serveur à la déconnexion.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => void handleLogout()}>
              <LogOut className="h-4 w-4" /> Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export default SettingsPage
