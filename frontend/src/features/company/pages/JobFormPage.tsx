import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Sparkles, X } from 'lucide-react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'
import { extractSkills } from '../../../services/api/aiServices'
import { errorMessage } from '../../../services/api/apiClient'
import { CONTRACT_TYPES, jobsService, type JobWriteInput } from '../../../services/api/jobsService'

const EDUCATION_LEVELS = ['Sans diplôme', 'Baccalauréat', 'Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Doctorat']
const CURRENCIES = ['XAF', 'XOF', 'EUR', 'USD', 'GBP']
const inputClass =
  'w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none'

interface FormState {
  titre: string
  description: string
  exigences: string
  localisation: string
  type_contrat: string
  salaire_min: string
  salaire_max: string
  devise: string
  experience_requise: string
  niveau_etude: string
  date_expiration: string
  statut: string
  competences_requises: string[]
}

const EMPTY_FORM: FormState = {
  titre: '',
  description: '',
  exigences: '',
  localisation: '',
  type_contrat: 'CDI',
  salaire_min: '',
  salaire_max: '',
  devise: 'XAF',
  experience_requise: '',
  niveau_etude: '',
  date_expiration: '',
  statut: 'PUBLISHED',
  competences_requises: [],
}

function toPayload(form: FormState): JobWriteInput {
  const number = (value: string) => (value.trim() === '' ? null : Number(value))
  return {
    titre: form.titre.trim(),
    description: form.description.trim(),
    exigences: form.exigences.trim(),
    localisation: form.localisation.trim(),
    type_contrat: form.type_contrat,
    salaire_min: number(form.salaire_min),
    salaire_max: number(form.salaire_max),
    devise: form.devise,
    experience_requise: number(form.experience_requise),
    niveau_etude: form.niveau_etude,
    date_expiration: form.date_expiration ? new Date(`${form.date_expiration}T23:59:59`).toISOString() : null,
    statut: form.statut,
    competences_requises: form.competences_requises,
  }
}

export function JobFormPage() {
  const navigate = useNavigate()
  const { jobId } = useParams<{ jobId?: string }>()
  const isEdit = Boolean(jobId)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [skillInput, setSkillInput] = useState('')
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return
    jobsService
      .getJob(jobId)
      .then((job) =>
        setForm({
          titre: job.titre,
          description: job.description,
          exigences: job.exigences ?? '',
          localisation: job.localisation ?? '',
          type_contrat: job.type_contrat,
          salaire_min: job.salaire_min !== null ? String(Number(job.salaire_min)) : '',
          salaire_max: job.salaire_max !== null ? String(Number(job.salaire_max)) : '',
          devise: job.devise,
          experience_requise: job.experience_requise !== null && job.experience_requise !== undefined ? String(job.experience_requise) : '',
          niveau_etude: job.niveau_etude ?? '',
          date_expiration: job.date_expiration ? job.date_expiration.split('T')[0] : '',
          statut: job.statut,
          competences_requises: job.competences_requises,
        }),
      )
      .catch((error) => setErrorText(errorMessage(error, 'Impossible de charger l’offre.')))
      .finally(() => setIsLoading(false))
  }, [jobId])

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [field]: value }))

  const addSkills = (names: string[]) => {
    setForm((prev) => {
      const existing = new Set(prev.competences_requises.map((s) => s.toLowerCase()))
      const additions = names.map((n) => n.trim()).filter((n) => n && !existing.has(n.toLowerCase()))
      return { ...prev, competences_requises: [...prev.competences_requises, ...additions] }
    })
  }

  const handleSkillKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addSkills([skillInput])
      setSkillInput('')
    }
  }

  const suggestSkills = async () => {
    setIsSuggesting(true)
    try {
      const skills = await extractSkills(`${form.titre}\n${form.description}\n${form.exigences}`)
      addSkills(skills.map((s) => s.nom))
    } catch (error) {
      setErrorText(errorMessage(error, 'Suggestion impossible.'))
    } finally {
      setIsSuggesting(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorText(null)
    try {
      const payload = toPayload(form)
      if (jobId) await jobsService.updateJob(jobId, payload)
      else await jobsService.createJob(payload)
      navigate(ROUTES.COMPANY_JOBS)
    } catch (error) {
      setErrorText(errorMessage(error, isEdit ? 'Impossible de mettre à jour l’offre.' : 'Impossible de créer l’offre.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = isEdit ? 'Modifier l’offre' : 'Créer une offre'

  if (isLoading) {
    return (
      <PageShell eyebrow={isEdit ? 'Modifier' : 'Créer'} title={title}>
        <div className="rounded-2xl border border-border bg-surface p-6"><Loader label="Chargement…" /></div>
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow={isEdit ? 'Modifier' : 'Créer'}
      title={title}
      actions={
        <Button variant="ghost" onClick={() => navigate(ROUTES.COMPANY_JOBS)}>
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
      }
    >
      {errorText && <div className="rounded-lg border border-error/20 bg-error/10 p-4 text-sm text-error">{errorText}</div>}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>Décrivez le poste et les responsabilités.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="job-title" className="mb-2 block text-sm font-medium text-foreground">Titre du poste *</label>
              <input id="job-title" type="text" value={form.titre} onChange={(e) => set('titre', e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="job-description" className="mb-2 block text-sm font-medium text-foreground">Description *</label>
              <textarea id="job-description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={6} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="job-requirements" className="mb-2 block text-sm font-medium text-foreground">Profil recherché / exigences</label>
              <textarea id="job-requirements" value={form.exigences} onChange={(e) => set('exigences', e.target.value)} rows={4} className={inputClass} />
            </div>
            <div>
              <label htmlFor="job-location" className="mb-2 block text-sm font-medium text-foreground">Localisation *</label>
              <input id="job-location" type="text" value={form.localisation} onChange={(e) => set('localisation', e.target.value)} placeholder="Ex. Douala, Yaoundé ou Télétravail" className={inputClass} required />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Compétences requises</CardTitle>
            <CardDescription>Elles servent au calcul de compatibilité des candidats. Appuyez sur Entrée pour ajouter.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {form.competences_requises.map((skill) => (
                <Badge key={skill} variant="primary" className="py-1">
                  {skill}
                  <button type="button" aria-label={`Retirer ${skill}`} onClick={() => set('competences_requises', form.competences_requises.filter((s) => s !== skill))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKey}
                placeholder="Ex. Python, Comptabilité, Anglais…"
                className={`${inputClass} flex-1`}
              />
              <Button type="button" variant="outline" onClick={() => void suggestSkills()} isLoading={isSuggesting} disabled={!form.description && !form.titre}>
                <Sparkles className="h-4 w-4" /> Suggérer depuis la description
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Contrat et rémunération</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="job-contract" className="mb-2 block text-sm font-medium text-foreground">Type de contrat *</label>
              <select id="job-contract" value={form.type_contrat} onChange={(e) => set('type_contrat', e.target.value)} className={inputClass}>
                {CONTRACT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="job-currency" className="mb-2 block text-sm font-medium text-foreground">Devise</label>
              <select id="job-currency" value={form.devise} onChange={(e) => set('devise', e.target.value)} className={inputClass}>
                {CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="job-salary-min" className="mb-2 block text-sm font-medium text-foreground">Salaire minimum</label>
              <input id="job-salary-min" type="number" min={0} value={form.salaire_min} onChange={(e) => set('salaire_min', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="job-salary-max" className="mb-2 block text-sm font-medium text-foreground">Salaire maximum</label>
              <input id="job-salary-max" type="number" min={0} value={form.salaire_max} onChange={(e) => set('salaire_max', e.target.value)} className={inputClass} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Critères et publication</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="job-experience" className="mb-2 block text-sm font-medium text-foreground">Expérience requise (années)</label>
              <input id="job-experience" type="number" min={0} max={50} value={form.experience_requise} onChange={(e) => set('experience_requise', e.target.value)} placeholder="Non spécifiée" className={inputClass} />
            </div>
            <div>
              <label htmlFor="job-education" className="mb-2 block text-sm font-medium text-foreground">Niveau d’études requis</label>
              <select id="job-education" value={form.niveau_etude} onChange={(e) => set('niveau_etude', e.target.value)} className={inputClass}>
                <option value="">Non spécifié</option>
                {EDUCATION_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="job-expiration" className="mb-2 block text-sm font-medium text-foreground">Date d’expiration</label>
              <input id="job-expiration" type="date" value={form.date_expiration} onChange={(e) => set('date_expiration', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="job-status" className="mb-2 block text-sm font-medium text-foreground">Statut</label>
              <select id="job-status" value={form.statut} onChange={(e) => set('statut', e.target.value)} className={inputClass}>
                <option value="PUBLISHED">Publiée</option>
                <option value="DRAFT">Brouillon</option>
                {isEdit && <option value="CLOSED">Clôturée</option>}
                {isEdit && <option value="ARCHIVED">Archivée</option>}
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.COMPANY_JOBS)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            <Save className="h-4 w-4" />
            {isEdit ? 'Mettre à jour' : 'Créer l’offre'}
          </Button>
        </div>
      </form>
    </PageShell>
  )
}

export default JobFormPage
