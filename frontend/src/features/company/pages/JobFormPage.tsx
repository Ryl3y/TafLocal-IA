import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Loader } from '../../../components/feedback/Loader'
import { Button } from '../../../components/ui/Button'
import { jobsService, CONTRACT_TYPES, type JobCreateInput, type JobUpdateInput } from '../../../services/api/jobsService'
import { ROUTES } from '../../../constants/routes'

const CONTRACT_TYPES_OPTIONS = CONTRACT_TYPES
const EXPERIENCE_LEVELS = ['Junior', 'Confirmé', 'Senior', 'Expert']
const EDUCATION_LEVELS = ['Bac', 'Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Doctorat']
const CURRENCIES = ['EUR', 'USD', 'GBP', 'XAF', 'XOF']

export function JobFormPage() {
  const navigate = useNavigate()
  const { jobId } = useParams<{ jobId?: string }>()
  const isEdit = !!jobId

  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState<JobCreateInput>({
    titre: '',
    description: '',
    localisation: '',
    type_contrat: 'CDI',
    salaire_min: 0,
    salaire_max: 0,
    devise: 'XAF',
    experience_requise: '',
    niveau_etude: '',
    date_expiration: '',
  })

  useEffect(() => {
    if (isEdit && jobId) {
      loadJob(jobId)
    }
  }, [isEdit, jobId])

  const loadJob = async (id: string) => {
    try {
      const data = await jobsService.getJob(id)
      setFormData({
        titre: data.titre,
        description: data.description,
        localisation: data.localisation,
        type_contrat: data.type_contrat,
        salaire_min: data.salaire_min,
        salaire_max: data.salaire_max,
        devise: data.devise,
        experience_requise: data.experience_requise || '',
        niveau_etude: data.niveau_etude || '',
        date_expiration: data.date_expiration ? data.date_expiration.split('T')[0] : '',
      })
    } catch (error) {
      setErrorMessage('Impossible de charger l\'offre.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      if (isEdit && jobId) {
        const updateData: JobUpdateInput = {
          titre: formData.titre,
          description: formData.description,
          localisation: formData.localisation,
          type_contrat: formData.type_contrat,
          salaire_min: formData.salaire_min,
          salaire_max: formData.salaire_max,
          devise: formData.devise,
          experience_requise: formData.experience_requise || undefined,
          niveau_etude: formData.niveau_etude || undefined,
          date_expiration: formData.date_expiration || undefined,
        }
        await jobsService.updateJob(jobId, updateData)
      } else {
        await jobsService.createJob(formData)
      }
      navigate(ROUTES.COMPANY_JOBS)
    } catch (error) {
      setErrorMessage(isEdit ? 'Impossible de mettre à jour l\'offre.' : 'Impossible de créer l\'offre.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof JobCreateInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <PageShell
        eyebrow={isEdit ? 'Modifier' : 'Créer'}
        title={isEdit ? 'Modifier l\'offre' : 'Créer une offre'}
      >
        <div className="rounded-2xl border border-border bg-surface p-6">
          <Loader label="Chargement…" />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow={isEdit ? 'Modifier' : 'Créer'}
      title={isEdit ? 'Modifier l\'offre' : 'Créer une offre'}
      actions={
        <Button variant="ghost" onClick={() => navigate(ROUTES.COMPANY_JOBS)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      }
    >
      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card className="bg-surface">
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Décrivez le poste et les responsabilités.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Titre du poste *
                </label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => handleChange('titre', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Localisation *
                </label>
                <input
                  type="text"
                  value={formData.localisation}
                  onChange={(e) => handleChange('localisation', e.target.value)}
                  placeholder="Ex: Paris, France ou Télétravail"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface">
            <CardHeader>
              <CardTitle>Détails du contrat</CardTitle>
              <CardDescription>Spécifiez les conditions du contrat.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type de contrat *
                </label>
                <select
                  value={formData.type_contrat}
                  onChange={(e) => handleChange('type_contrat', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                  required
                >
                  {CONTRACT_TYPES_OPTIONS.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Salaire minimum *
                  </label>
                  <input
                    type="number"
                    value={formData.salaire_min}
                    onChange={(e) => handleChange('salaire_min', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Salaire maximum *
                  </label>
                  <input
                    type="number"
                    value={formData.salaire_max}
                    onChange={(e) => handleChange('salaire_max', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Devise *
                </label>
                <select
                  value={formData.devise}
                  onChange={(e) => handleChange('devise', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                  required
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface">
            <CardHeader>
              <CardTitle>Exigences</CardTitle>
              <CardDescription>Définissez les critères requis pour le poste.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Niveau d'expérience requis
                </label>
                <select
                  value={formData.experience_requise}
                  onChange={(e) => handleChange('experience_requise', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Non spécifié</option>
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Niveau d'études requis
                </label>
                <select
                  value={formData.niveau_etude}
                  onChange={(e) => handleChange('niveau_etude', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Non spécifié</option>
                  {EDUCATION_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date d'expiration
                </label>
                <input
                  type="date"
                  value={formData.date_expiration}
                  onChange={(e) => handleChange('date_expiration', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.COMPANY_DASHBOARD)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer l\'offre'}
            </Button>
          </div>
        </div>
      </form>
    </PageShell>
  )
}

export default JobFormPage
