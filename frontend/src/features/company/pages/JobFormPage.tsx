import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileText,
  GraduationCap,
  Save,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'
import { extractSkills } from '../../../services/api/aiServices'
import { errorMessage } from '../../../services/api/apiClient'
import {
  COVER_LETTER_OPTIONS,
  EMPLOYMENT_CONTRACT_TYPES,
  EXPERIENCE_OPTIONS,
  jobsService,
  STAGE_MAX_MONTHS,
  type CoverLetterRequirement,
  type JobCategory,
  type JobWriteInput,
} from '../../../services/api/jobsService'
import { cn } from '../../../utils/cn'

const EDUCATION_LEVELS = ['Sans diplôme', 'Baccalauréat', 'Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Doctorat']
const CURRENCIES = ['XAF', 'XOF', 'EUR', 'USD', 'GBP']
const inputClass =
  'w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none'

const CATEGORY_OPTIONS: {
  value: JobCategory
  slug: string
  title: string
  hint: string
  icon: LucideIcon
  tone: string
}[] = [
  {
    value: 'EMPLOI',
    slug: 'emploi',
    title: 'Offre d’emploi',
    hint: 'CDI, CDD, freelance ou alternance.',
    icon: BriefcaseBusiness,
    tone: 'bg-pastel-blue text-primary',
  },
  {
    value: 'STAGE',
    slug: 'stage',
    title: 'Offre de stage',
    hint: 'Vous préciserez la durée du stage et s’il est rémunéré.',
    icon: GraduationCap,
    tone: 'bg-pastel-mint text-secondary',
  },
]

interface FormState {
  titre: string
  description: string
  exigences: string
  localisation: string
  categorie: JobCategory
  duree_stage_mois: string
  stage_remunere: '' | 'oui' | 'non'
  type_contrat: string
  salaire_min: string
  salaire_max: string
  devise: string
  experience_requise_mois: string
  niveau_etude: string
  lettre_motivation: CoverLetterRequirement
  date_expiration: string
  statut: string
  competences_requises: string[]
}

const EMPTY_FORM: FormState = {
  titre: '',
  description: '',
  exigences: '',
  localisation: '',
  categorie: 'EMPLOI',
  duree_stage_mois: '',
  stage_remunere: '',
  type_contrat: 'CDI',
  salaire_min: '',
  salaire_max: '',
  devise: 'XAF',
  experience_requise_mois: '',
  niveau_etude: '',
  lettre_motivation: 'FACULTATIVE',
  date_expiration: '',
  statut: 'PUBLISHED',
  competences_requises: [],
}

function toPayload(form: FormState): JobWriteInput {
  const number = (value: string) => (value.trim() === '' ? null : Number(value))
  const isStage = form.categorie === 'STAGE'
  const unpaid = isStage && form.stage_remunere === 'non'
  return {
    titre: form.titre.trim(),
    description: form.description.trim(),
    exigences: form.exigences.trim(),
    localisation: form.localisation.trim(),
    categorie: form.categorie,
    duree_stage_mois: isStage ? number(form.duree_stage_mois) : null,
    stage_remunere: isStage ? form.stage_remunere === 'oui' : null,
    type_contrat: isStage ? 'INTERNSHIP' : form.type_contrat,
    salaire_min: unpaid ? null : number(form.salaire_min),
    salaire_max: unpaid ? null : number(form.salaire_max),
    devise: form.devise,
    experience_requise_mois: number(form.experience_requise_mois),
    niveau_etude: form.niveau_etude,
    lettre_motivation: form.lettre_motivation,
    date_expiration: form.date_expiration ? new Date(`${form.date_expiration}T23:59:59`).toISOString() : null,
    statut: form.statut,
    competences_requises: form.competences_requises,
  }
}

export function JobFormPage() {
  const navigate = useNavigate()
  const { jobId } = useParams<{ jobId?: string }>()
  const isEdit = Boolean(jobId)
  // Création en deux étapes : le type d'offre (?type=emploi|stage) est choisi avant le formulaire.
  const [searchParams, setSearchParams] = useSearchParams()
  const chosenCategory = CATEGORY_OPTIONS.find((option) => option.slug === searchParams.get('type'))?.value ?? null

  const [form, setForm] = useState<FormState>(() => ({ ...EMPTY_FORM, categorie: chosenCategory ?? 'EMPLOI' }))
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
          categorie: job.categorie ?? 'EMPLOI',
          duree_stage_mois: job.duree_stage_mois ? String(job.duree_stage_mois) : '',
          stage_remunere: job.stage_remunere === true ? 'oui' : job.stage_remunere === false ? 'non' : '',
          type_contrat: job.categorie !== 'STAGE' && job.type_contrat === 'INTERNSHIP' ? 'CDI' : job.type_contrat,
          salaire_min: job.salaire_min !== null ? String(Number(job.salaire_min)) : '',
          salaire_max: job.salaire_max !== null ? String(Number(job.salaire_max)) : '',
          devise: job.devise,
          experience_requise_mois:
            job.experience_requise_mois !== null && job.experience_requise_mois !== undefined
              ? String(job.experience_requise_mois)
              : '',
          niveau_etude: job.niveau_etude ?? '',
          lettre_motivation: job.lettre_motivation ?? 'FACULTATIVE',
          date_expiration: job.date_expiration ? job.date_expiration.split('T')[0] : '',
          statut: job.statut,
          competences_requises: job.competences_requises,
        }),
      )
      .catch((error) => setErrorText(errorMessage(error, 'Impossible de charger l’offre.')))
      .finally(() => setIsLoading(false))
  }, [jobId])

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [field]: value }))

  const chooseCategory = (category: JobCategory) => {
    set('categorie', category)
    setSearchParams({ type: CATEGORY_OPTIONS.find((option) => option.value === category)?.slug ?? 'emploi' })
  }

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
    if (form.categorie === 'STAGE' && form.stage_remunere === '') {
      setErrorText('Précisez si le stage est rémunéré ou non.')
      return
    }
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

  const isStage = form.categorie === 'STAGE'
  const showPay = !isStage || form.stage_remunere === 'oui'
  const categoryOption = CATEGORY_OPTIONS.find((option) => option.value === form.categorie) ?? CATEGORY_OPTIONS[0]
  const CategoryIcon = categoryOption.icon
  const title = isEdit
    ? 'Modifier l’offre'
    : !chosenCategory
      ? 'Créer une offre'
      : isStage
        ? 'Créer une offre de stage'
        : 'Créer une offre d’emploi'
  const backButton = (
    <Button variant="ghost" onClick={() => navigate(ROUTES.COMPANY_JOBS)}>
      <ArrowLeft className="h-4 w-4" /> Retour
    </Button>
  )

  if (isLoading) {
    return (
      <PageShell eyebrow={isEdit ? 'Modifier' : 'Créer'} title={title}>
        <div className="rounded-2xl border border-border bg-surface p-6"><Loader label="Chargement…" /></div>
      </PageShell>
    )
  }

  // Étape 1 : choix du type d'offre
  if (!isEdit && !chosenCategory) {
    return (
      <PageShell
        eyebrow="Créer"
        title={title}
        description="Quel type d’offre souhaitez-vous publier ? Le formulaire s’adapte à votre choix."
        actions={backButton}
      >
        <div className="grid gap-4 sm:grid-cols-2" role="list" aria-label="Type d’offre">
          {CATEGORY_OPTIONS.map(({ value, title: optionTitle, hint, icon: Icon, tone }) => (
            <button
              key={value}
              type="button"
              role="listitem"
              onClick={() => chooseCategory(value)}
              className="group flex items-start gap-4 rounded-2xl border-2 border-border bg-surface p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:border-primary focus-visible:outline-none"
            >
              <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', tone)}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-foreground">{optionTitle}</span>
                <span className="mt-1 block text-sm text-muted">{hint}</span>
              </span>
              <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </button>
          ))}
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell eyebrow={isEdit ? 'Modifier' : 'Créer'} title={title} actions={backButton}>
      {errorText && <div className="rounded-lg border border-error/20 bg-error/10 p-4 text-sm text-error">{errorText}</div>}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {/* Rappel du type d'offre */}
        <div className="flex items-center justify-between gap-3 rounded-xl bg-field px-4 py-3 text-sm">
          <span className="inline-flex items-center gap-2 font-medium text-foreground">
            <CategoryIcon className={cn('h-4 w-4', isStage ? 'text-secondary' : 'text-primary')} />
            {categoryOption.title}
          </span>
          {isEdit ? (
            <span className="text-xs text-muted">Le type d’offre ne peut plus être modifié.</span>
          ) : (
            <button type="button" onClick={() => setSearchParams({})} className="text-xs font-medium text-primary hover:underline">
              Changer
            </button>
          )}
        </div>

        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>{isStage ? 'Décrivez le stage et les missions confiées.' : 'Décrivez le poste et les responsabilités.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="job-title" className="mb-2 block text-sm font-medium text-foreground">
                {isStage ? 'Intitulé du stage *' : 'Titre du poste *'}
              </label>
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
            <CardTitle>{isStage ? 'Durée et rémunération du stage' : 'Contrat et rémunération'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {isStage ? (
              <>
                <div>
                  <label htmlFor="job-duration" className="mb-2 block text-sm font-medium text-foreground">Durée du stage (mois) *</label>
                  <input
                    id="job-duration"
                    type="number"
                    min={1}
                    max={STAGE_MAX_MONTHS}
                    required
                    value={form.duree_stage_mois}
                    onChange={(e) => set('duree_stage_mois', e.target.value)}
                    placeholder="Ex. 3"
                    className={inputClass}
                  />
                </div>
                <fieldset>
                  <legend className="mb-2 block text-sm font-medium text-foreground">Stage rémunéré ? *</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ['oui', 'Oui, rémunéré'],
                        ['non', 'Non rémunéré'],
                      ] as const
                    ).map(([value, label]) => {
                      const selected = form.stage_remunere === value
                      return (
                        <label
                          key={value}
                          className={cn(
                            'flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors',
                            selected ? 'border-primary bg-primary-light/40 text-foreground' : 'border-border text-muted hover:border-primary/40',
                          )}
                        >
                          <input type="radio" name="stage_remunere" value={value} checked={selected} onChange={() => set('stage_remunere', value)} className="sr-only" />
                          {selected && <Check className="h-4 w-4 text-primary" />}
                          {label}
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              </>
            ) : (
              <div>
                <label htmlFor="job-contract" className="mb-2 block text-sm font-medium text-foreground">Type de contrat *</label>
                <select id="job-contract" value={form.type_contrat} onChange={(e) => set('type_contrat', e.target.value)} className={inputClass}>
                  {EMPLOYMENT_CONTRACT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
            )}
            {showPay && (
              <>
                <div>
                  <label htmlFor="job-currency" className="mb-2 block text-sm font-medium text-foreground">Devise</label>
                  <select id="job-currency" value={form.devise} onChange={(e) => set('devise', e.target.value)} className={inputClass}>
                    {CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="job-salary-min" className="mb-2 block text-sm font-medium text-foreground">
                    {isStage ? 'Gratification minimum (par mois)' : 'Salaire minimum'}
                  </label>
                  <input id="job-salary-min" type="number" min={0} value={form.salaire_min} onChange={(e) => set('salaire_min', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="job-salary-max" className="mb-2 block text-sm font-medium text-foreground">
                    {isStage ? 'Gratification maximum (par mois)' : 'Salaire maximum'}
                  </label>
                  <input id="job-salary-max" type="number" min={0} value={form.salaire_max} onChange={(e) => set('salaire_max', e.target.value)} className={inputClass} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Critères et publication</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="job-experience" className="mb-2 block text-sm font-medium text-foreground">Expérience requise</label>
              <select id="job-experience" value={form.experience_requise_mois} onChange={(e) => set('experience_requise_mois', e.target.value)} className={inputClass}>
                <option value="">Non spécifiée</option>
                {EXPERIENCE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                {/* Valeur existante hors paliers (ex. ancienne offre à 8 ans) : conservée telle quelle. */}
                {form.experience_requise_mois !== '' && !EXPERIENCE_OPTIONS.some((option) => String(option.value) === form.experience_requise_mois) && (
                  <option value={form.experience_requise_mois}>{Number(form.experience_requise_mois)} mois</option>
                )}
              </select>
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

        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Pièces demandées au candidat</CardTitle>
            <CardDescription>Le CV est toujours obligatoire. Choisissez la place de la lettre de motivation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-field px-4 py-3 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span className="flex-1 font-medium text-foreground">CV</span>
              <Badge variant="primary">Obligatoire</Badge>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-foreground">Lettre de motivation</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {COVER_LETTER_OPTIONS.map((option) => {
                  const selected = form.lettre_motivation === option.value
                  return (
                    <label
                      key={option.value}
                      className={`relative flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-3 transition-colors ${
                        selected ? 'border-primary bg-primary-light/40' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="lettre_motivation"
                        value={option.value}
                        checked={selected}
                        onChange={() => set('lettre_motivation', option.value)}
                        className="sr-only"
                      />
                      <span className="flex items-center justify-between text-sm font-semibold text-foreground">
                        {option.label}
                        {selected && <Check className="h-4 w-4 text-primary" />}
                      </span>
                      <span className="text-xs text-muted">{option.hint}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
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
