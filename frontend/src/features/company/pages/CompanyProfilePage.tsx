import { useEffect, useState } from 'react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Loader } from '../../../components/feedback/Loader'
import { Button } from '../../../components/ui/Button'
import {
  getCompanyProfile,
  updateCompanyProfile,
  type CompanyProfile,
  type UpdateCompanyProfileData,
} from '../../../services/api/profileServices'

export function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [formData, setFormData] = useState<UpdateCompanyProfileData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getCompanyProfile()
        setProfile(data)
        setFormData({
          nom_entreprise: data.nom_entreprise,
          secteur: data.secteur ?? '',
          description: data.description ?? '',
          site_web: data.site_web ?? '',
          adresse: data.adresse ?? '',
          ville: data.ville ?? '',
          telephone: data.telephone ?? '',
        })
      } catch {
        setErrorMessage('Impossible de charger le profil entreprise.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (field: keyof UpdateCompanyProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const updated = await updateCompanyProfile(formData)
      setProfile(updated)
      setSuccessMessage('Profil entreprise mis à jour.')
    } catch {
      setErrorMessage('Impossible de mettre à jour le profil.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <PageShell eyebrow="Profil" title="Profil entreprise">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <Loader label="Chargement du profil…" />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow="Profil"
      title="Profil entreprise"
      description="Mettez à jour les informations visibles par les candidats."
    >
      {errorMessage && (
        <div className="mb-4 rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 rounded-lg border border-secondary/20 bg-secondary/10 px-3 py-2 text-sm text-secondary">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Informations de l'entreprise</CardTitle>
            <CardDescription>
              {profile?.verified ? 'Entreprise vérifiée' : 'Profil en cours de validation'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Nom de l'entreprise</label>
              <input
                value={formData.nom_entreprise ?? ''}
                onChange={(e) => handleChange('nom_entreprise', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Secteur</label>
              <input
                value={formData.secteur ?? ''}
                onChange={(e) => handleChange('secteur', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Ville</label>
              <input
                value={formData.ville ?? ''}
                onChange={(e) => handleChange('ville', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Téléphone</label>
              <input
                value={formData.telephone ?? ''}
                onChange={(e) => handleChange('telephone', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Site web</label>
              <input
                value={formData.site_web ?? ''}
                onChange={(e) => handleChange('site_web', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Adresse</label>
              <input
                value={formData.adresse ?? ''}
                onChange={(e) => handleChange('adresse', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Description</label>
              <textarea
                value={formData.description ?? ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button type="submit" isLoading={isSaving}>
            Enregistrer
          </Button>
        </div>
      </form>
    </PageShell>
  )
}

export default CompanyProfilePage
