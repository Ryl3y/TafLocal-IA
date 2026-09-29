import { motion } from 'framer-motion'
import { BadgeCheck, BriefcaseBusiness, FileText, GraduationCap, Plus, Save, Sparkles, Trash2, UserCircle2 } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Loader } from '../../../components/feedback/Loader'
import { FormField } from '../../../components/forms/FormField'
import { Avatar } from '../../../components/ui/Avatar'
import { Badge } from '../../../components/ui/Badge'
import { CompanyLogo } from '../../../components/ui/CompanyLogo'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import { ROUTES } from '../../../constants/routes'
import { useAuth } from '../../../context/AuthContext'
import { searchSkills, type SkillSuggestion } from '../../../services/api/aiServices'
import { errorMessage } from '../../../services/api/apiClient'
import { getMyCVs, type CV } from '../../../services/api/cvServices'
import {
  addEducation,
  addExperience,
  addSkill,
  deleteEducation,
  deleteExperience,
  deleteSkill,
  getCandidateProfile,
  SKILL_LEVELS,
  updateCandidateProfile,
  updateMe,
  type CandidateProfile,
  type SkillLevel,
} from '../../../services/api/profileServices'
import { formatDate } from '../../../utils/formatDate'
import { CVSuggestionsPanel } from '../components/CVSuggestionsPanel'

const selectClass = 'h-12 w-full rounded-lg bg-field px-4 text-sm text-foreground focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:outline-none'

interface PersonalForm {
  prenom: string
  nom: string
  telephone: string
  ville: string
  adresse: string
  date_naissance: string
  genre: string
  biographie: string
  linkedin: string
  github: string
  portfolio: string
}

function toForm(profile: CandidateProfile): PersonalForm {
  return {
    prenom: profile.user.prenom ?? '',
    nom: profile.user.nom ?? '',
    telephone: profile.user.telephone ?? '',
    ville: profile.ville ?? '',
    adresse: profile.adresse ?? '',
    date_naissance: profile.date_naissance ?? '',
    genre: profile.genre ?? '',
    biographie: profile.biographie ?? '',
    linkedin: profile.linkedin ?? '',
    github: profile.github ?? '',
    portfolio: profile.portfolio ?? '',
  }
}

export function ProfilePage() {
  const { refreshSession } = useAuth()
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [form, setForm] = useState<PersonalForm | null>(null)
  const [cvs, setCvs] = useState<CV[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Compétence
  const [skillName, setSkillName] = useState('')
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('INTERMEDIAIRE')
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([])
  // Expérience
  const [experience, setExperience] = useState({ poste: '', entreprise: '', date_debut: '', date_fin: '', en_cours: false, description: '' })
  // Formation
  const [education, setEducation] = useState({ diplome: '', etablissement: '', obtention: '' })

  const reload = useCallback(async () => {
    const data = await getCandidateProfile()
    setProfile(data)
    return data
  }, [])

  useEffect(() => {
    Promise.all([getCandidateProfile(), getMyCVs().catch(() => [] as CV[])])
      .then(([data, cvList]) => {
        setProfile(data)
        setForm(toForm(data))
        setCvs(cvList)
      })
      .catch((error) => setMessage({ type: 'error', text: errorMessage(error, 'Impossible de charger le profil.') }))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (skillName.trim().length < 2) return
    const timer = window.setTimeout(() => {
      searchSkills(skillName.trim()).then((list) => setSuggestions(list.slice(0, 6))).catch(() => setSuggestions([]))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [skillName])
  const visibleSuggestions = skillName.trim().length >= 2 ? suggestions : []

  const run = async (action: () => Promise<unknown>, success?: string) => {
    setMessage(null)
    try {
      await action()
      await reload()
      if (success) setMessage({ type: 'success', text: success })
      return true
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error) })
      return false
    }
  }

  const handleSave = async () => {
    if (!form) return
    setIsSaving(true)
    const ok = await run(async () => {
      await updateMe({ prenom: form.prenom, nom: form.nom, telephone: form.telephone })
      await updateCandidateProfile({
        ville: form.ville,
        adresse: form.adresse,
        date_naissance: form.date_naissance || null,
        genre: form.genre,
        biographie: form.biographie,
        linkedin: form.linkedin,
        github: form.github,
        portfolio: form.portfolio,
      })
    }, 'Profil enregistré.')
    if (ok) await refreshSession()
    setIsSaving(false)
  }

  const submitSkill = async (event: FormEvent) => {
    event.preventDefault()
    if (!skillName.trim()) return
    if (await run(() => addSkill({ nom: skillName.trim(), niveau: skillLevel }))) {
      setSkillName('')
      setSuggestions([])
    }
  }

  const submitExperience = async (event: FormEvent) => {
    event.preventDefault()
    const ok = await run(() => addExperience({
      poste: experience.poste,
      entreprise: experience.entreprise,
      date_debut: experience.date_debut,
      date_fin: experience.en_cours ? null : experience.date_fin || null,
      en_cours: experience.en_cours,
      description: experience.description || null,
    }), 'Expérience ajoutée.')
    if (ok) setExperience({ poste: '', entreprise: '', date_debut: '', date_fin: '', en_cours: false, description: '' })
  }

  const submitEducation = async (event: FormEvent) => {
    event.preventDefault()
    // Formation = diplôme ou certificat + établissement + date d'obtention (mois/année, stockée dans date_fin).
    const ok = await run(() => addEducation({
      diplome: education.diplome,
      etablissement: education.etablissement,
      date_debut: null,
      date_fin: `${education.obtention}-01`,
      en_cours: false,
      description: null,
    }), 'Formation ajoutée.')
    if (ok) setEducation({ diplome: '', etablissement: '', obtention: '' })
  }

  if (isLoading || !form) {
    return (
      <PageShell eyebrow="Profil" title="Votre identité professionnelle">
        {message ? (
          <div className="rounded-xl border border-error/20 bg-error/10 p-3 text-sm text-error">{message.text}</div>
        ) : (
          <Loader label="Chargement du profil…" />
        )}
      </PageShell>
    )
  }

  const set = (field: keyof PersonalForm) => (value: string) => setForm((prev) => (prev ? { ...prev, [field]: value } : prev))

  const fullName = `${form.prenom} ${form.nom}`.trim() || profile?.user.email || 'Mon profil'
  const stats = [
    { label: 'Compétences', value: profile?.competences.length ?? 0 },
    { label: 'Expériences', value: profile?.experiences.length ?? 0 },
    { label: 'Formations', value: profile?.formations.length ?? 0 },
    { label: 'CV', value: cvs.length },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mx-auto w-full max-w-6xl space-y-6"
    >
      {/* En-tête profil façon kit */}
      <Card className="relative flex flex-col items-center px-6 pt-8 pb-6 text-center">
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-4 right-4 text-primary"
          onClick={() => void handleSave()}
          isLoading={isSaving}
        >
          <Save className="h-4 w-4" /> Enregistrer
        </Button>
        <Avatar alt={fullName} fallback={fullName} size="xl" className="h-24 w-24 bg-pastel-blue text-3xl ring-4 ring-primary-light" />
        <h1 className="mt-4 text-xl font-bold text-foreground">{fullName}</h1>
        <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-muted">
          {form.ville || 'Candidat'} <BadgeCheck className="h-4 w-4 text-primary" />
        </p>
        <dl className="mt-6 grid w-full max-w-md grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <dt className="order-2 text-xs text-muted">{stat.label}</dt>
              <dd className="text-lg font-semibold text-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 max-w-lg text-xs text-muted">
          Plus votre profil est complet, plus les recommandations et le classement de vos candidatures sont précis.
        </p>
      </Card>

      <CVSuggestionsPanel
        onApplied={async (personal) => {
          await reload()
          // Les champs validés rejoignent le formulaire sans écraser les autres saisies en cours.
          setForm((prev) => (prev ? { ...prev, ...personal } : prev))
        }}
      />

      {message && (
        <div className={`rounded-xl border p-3 text-sm ${message.type === 'success' ? 'border-secondary/20 bg-secondary-light/40 text-foreground' : 'border-error/20 bg-error/10 text-error'}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-primary" />
              <CardTitle>Informations personnelles</CardTitle>
            </div>
            <CardDescription>{profile?.user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Prénom" htmlFor="p-prenom"><Input id="p-prenom" value={form.prenom} onChange={(e) => set('prenom')(e.target.value)} /></FormField>
              <FormField label="Nom" htmlFor="p-nom"><Input id="p-nom" value={form.nom} onChange={(e) => set('nom')(e.target.value)} /></FormField>
              <FormField label="Téléphone" htmlFor="p-tel"><Input id="p-tel" value={form.telephone} onChange={(e) => set('telephone')(e.target.value)} /></FormField>
              <FormField label="Ville" htmlFor="p-ville" hint="Utilisée pour le critère de localisation."><Input id="p-ville" value={form.ville} onChange={(e) => set('ville')(e.target.value)} /></FormField>
              <FormField label="Date de naissance" htmlFor="p-naissance"><Input id="p-naissance" type="date" value={form.date_naissance} onChange={(e) => set('date_naissance')(e.target.value)} /></FormField>
              <FormField label="Genre" htmlFor="p-genre">
                <select id="p-genre" className={selectClass} value={form.genre} onChange={(e) => set('genre')(e.target.value)}>
                  <option value="">Non précisé</option>
                  <option value="Femme">Femme</option>
                  <option value="Homme">Homme</option>
                  <option value="Autre">Autre</option>
                </select>
              </FormField>
            </div>
            <FormField label="Adresse" htmlFor="p-adresse"><Input id="p-adresse" value={form.adresse} onChange={(e) => set('adresse')(e.target.value)} /></FormField>
            <FormField label="Présentation" htmlFor="p-bio"><Textarea id="p-bio" rows={4} value={form.biographie} onChange={(e) => set('biographie')(e.target.value)} placeholder="Votre métier, vos points forts, votre objectif." /></FormField>
            <div className="grid gap-4 md:grid-cols-3">
              <FormField label="LinkedIn" htmlFor="p-linkedin"><Input id="p-linkedin" value={form.linkedin} onChange={(e) => set('linkedin')(e.target.value)} /></FormField>
              <FormField label="GitHub" htmlFor="p-github"><Input id="p-github" value={form.github} onChange={(e) => set('github')(e.target.value)} /></FormField>
              <FormField label="Portfolio" htmlFor="p-portfolio"><Input id="p-portfolio" value={form.portfolio} onChange={(e) => set('portfolio')(e.target.value)} /></FormField>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-surface">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Compétences</CardTitle>
              </div>
              <CardDescription>Les compétences de votre CV analysé sont aussi prises en compte automatiquement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile?.competences.length === 0 && <p className="text-sm text-muted">Aucune compétence déclarée.</p>}
                {profile?.competences.map((skill) => (
                  <Badge key={skill.id} variant="primary" className="py-1">
                    {skill.nom} · {skill.niveau_display}
                    <button type="button" aria-label={`Retirer ${skill.nom}`} onClick={() => void run(() => deleteSkill(skill.id))}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <form className="space-y-2" onSubmit={(e) => void submitSkill(e)}>
                <div className="flex gap-2">
                  <Input value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="Ex. Python, Comptabilité, Anglais…" list="skill-suggestions" />
                  <select className="rounded-lg bg-field px-3 text-sm text-foreground" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}>
                    {SKILL_LEVELS.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                  </select>
                  <Button type="submit" size="icon" aria-label="Ajouter"><Plus className="h-4 w-4" /></Button>
                </div>
                <datalist id="skill-suggestions">
                  {visibleSuggestions.map((s) => <option key={s.nom} value={s.nom}>{s.categorie ?? ''}</option>)}
                </datalist>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-surface">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-secondary" />
                <CardTitle>Mes CV</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {cvs.length === 0 ? (
                <p className="text-muted">Aucun CV déposé.</p>
              ) : (
                cvs.slice(0, 3).map((cv) => (
                  <div key={cv.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-3">
                    <span className="truncate">{cv.file_name}</span>
                    {cv.employability_score !== null && <Badge variant="secondary">{cv.employability_score}/100</Badge>}
                  </div>
                ))
              )}
              <Link to={ROUTES.CV_ANALYSIS}><Button variant="outline" size="sm">Gérer mes CV</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-primary" />
              <CardTitle>Expériences professionnelles</CardTitle>
            </div>
            <CardDescription>
              Total : {profile?.experience_annees ?? 0} an(s) — utilisé pour le critère d’expérience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.experiences.map((exp) => (
              <div key={exp.id} className="flex items-start gap-3 rounded-2xl bg-background p-3 text-sm">
                <CompanyLogo name={exp.entreprise} size="sm" className="rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="font-semibold text-foreground">{exp.poste}</p>
                    <p className="text-xs text-muted">
                      {formatDate(exp.date_debut)} – {exp.en_cours ? 'aujourd’hui' : exp.date_fin ? formatDate(exp.date_fin) : '?'}
                    </p>
                  </div>
                  <p className="text-xs text-muted">{exp.entreprise}</p>
                  {exp.description && <p className="mt-1 text-muted">{exp.description}</p>}
                </div>
                <Button size="icon" variant="ghost" aria-label="Supprimer" onClick={() => void run(() => deleteExperience(exp.id))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <form className="space-y-3 rounded-xl border border-dashed border-border p-3" onSubmit={(e) => void submitExperience(e)}>
              <div className="grid gap-2 md:grid-cols-2">
                <Input required placeholder="Poste" value={experience.poste} onChange={(e) => setExperience({ ...experience, poste: e.target.value })} />
                <Input required placeholder="Entreprise" value={experience.entreprise} onChange={(e) => setExperience({ ...experience, entreprise: e.target.value })} />
                <Input required type="date" aria-label="Date de début" value={experience.date_debut} onChange={(e) => setExperience({ ...experience, date_debut: e.target.value })} />
                <Input type="date" aria-label="Date de fin" disabled={experience.en_cours} value={experience.date_fin} onChange={(e) => setExperience({ ...experience, date_fin: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={experience.en_cours} onChange={(e) => setExperience({ ...experience, en_cours: e.target.checked })} />
                Poste actuel
              </label>
              <Textarea rows={2} placeholder="Missions et réalisations" value={experience.description} onChange={(e) => setExperience({ ...experience, description: e.target.value })} />
              <Button type="submit" size="sm"><Plus className="h-4 w-4" /> Ajouter l’expérience</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <CardTitle>Formations</CardTitle>
            </div>
            <CardDescription>Indiquez l’intitulé exact (Licence, Master, BTS…) pour le critère de formation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.formations.map((edu) => (
              <div key={edu.id} className="flex items-start gap-3 rounded-2xl bg-background p-3 text-sm">
                <CompanyLogo name={edu.etablissement} size="sm" className="rounded-full" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{edu.diplome}</p>
                  <p className="text-xs text-muted">
                    {edu.etablissement}
                    {edu.date_fin ? ` · obtenu en ${formatDate(edu.date_fin, { month: 'long', year: 'numeric' })}` : ''}
                  </p>
                </div>
                <Button size="icon" variant="ghost" aria-label="Supprimer" onClick={() => void run(() => deleteEducation(edu.id))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <form className="space-y-3 rounded-xl border border-dashed border-border p-3" onSubmit={(e) => void submitEducation(e)}>
              <div className="grid gap-2 md:grid-cols-2">
                <Input required aria-label="Diplôme ou certificat" placeholder="Diplôme ou certificat (ex. Licence en informatique)" value={education.diplome} onChange={(e) => setEducation({ ...education, diplome: e.target.value })} />
                <Input required aria-label="Établissement" placeholder="Établissement" value={education.etablissement} onChange={(e) => setEducation({ ...education, etablissement: e.target.value })} />
              </div>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted">Date d’obtention (mois et année)</span>
                <Input
                  required
                  type="month"
                  max={new Date().toISOString().slice(0, 7)}
                  value={education.obtention}
                  onChange={(e) => setEducation({ ...education, obtention: e.target.value })}
                />
              </label>
              <Button type="submit" size="sm"><Plus className="h-4 w-4" /> Ajouter la formation</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

export default ProfilePage
