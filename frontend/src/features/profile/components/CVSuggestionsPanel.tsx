import { BriefcaseBusiness, Check, GraduationCap, RefreshCw, Sparkles, UploadCloud, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/cards/Card'
import { Loader } from '../../../components/feedback/Loader'
import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import { ROUTES } from '../../../constants/routes'
import { errorMessage } from '../../../services/api/apiClient'
import {
  addEducation,
  addExperience,
  addSkill,
  getCVSuggestions,
  obtentionDate,
  SKILL_LEVELS,
  updateCandidateProfile,
  updateMe,
  type CVSuggestions,
  type SkillLevel,
  type SuggestedField,
} from '../../../services/api/profileServices'
import { cn } from '../../../utils/cn'
import { formatDate } from '../../../utils/formatDate'

type Selectable<T> = T & { key: string; selected: boolean }

interface DraftState {
  informations: Selectable<CVSuggestions['informations'][number]>[]
  competences: Selectable<CVSuggestions['competences'][number]>[]
  experiences: Selectable<CVSuggestions['experiences'][number]>[]
  formations: Selectable<CVSuggestions['formations'][number]>[]
}

export interface CVSuggestionsPanelProps {
  /** Appelé après validation, avec les informations personnelles réellement enregistrées. */
  onApplied: (personal: Partial<Record<SuggestedField, string>>) => Promise<void> | void
}

// Rien n'est pré-coché : c'est au candidat de choisir ce qu'il valide.
function toDraft(data: CVSuggestions): DraftState {
  return {
    informations: data.informations.map((item) => ({ ...item, key: item.champ, selected: false })),
    competences: data.competences.map((item) => ({ ...item, key: item.nom, selected: false })),
    experiences: data.experiences.map((item, index) => ({ ...item, key: `exp-${index}`, selected: false })),
    formations: data.formations.map((item, index) => ({ ...item, key: `edu-${index}`, selected: false })),
  }
}

const isExperienceValid = (e: DraftState['experiences'][number]) =>
  Boolean(e.poste.trim() && e.entreprise.trim() && e.date_debut)
const currentYear = new Date().getFullYear()
const isEducationValid = (f: DraftState['formations'][number]) =>
  Boolean(
    f.diplome.trim() && f.etablissement.trim() && f.mois && f.annee && f.annee >= 1950 && f.annee <= currentYear + 1,
  )

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: new Date(2000, index, 1).toLocaleDateString('fr-FR', { month: 'long' }),
}))

function SuggestionRow({
  selected,
  disabled,
  onToggle,
  children,
}: {
  selected: boolean
  disabled?: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-2xl border-2 p-3 transition-colors',
        selected ? 'border-primary bg-primary-light/30' : 'border-transparent bg-background',
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        aria-label={selected ? 'Retirer de la sélection' : 'Sélectionner'}
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors disabled:opacity-40',
          selected ? 'border-primary bg-primary text-white' : 'border-border bg-surface hover:border-primary/50',
        )}
      >
        {selected && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1 space-y-2">{children}</div>
    </div>
  )
}

function GroupTitle({ icon: Icon, children }: { icon: typeof Sparkles; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <Icon className="h-4 w-4 text-primary" /> {children}
    </h3>
  )
}

/**
 * Propositions de l'IA extraites du dernier CV analysé.
 * L'IA pré-remplit ; seul le candidat valide ce qui est ajouté à son profil.
 */
export function CVSuggestionsPanel({ onApplied }: CVSuggestionsPanelProps) {
  const [data, setData] = useState<CVSuggestions | null>(null)
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchSuggestions = useCallback(
    () =>
      getCVSuggestions()
        .then((suggestions) => {
          setData(suggestions)
          setDraft(toDraft(suggestions))
        })
        .catch((error) =>
          setFeedback({ type: 'error', text: errorMessage(error, 'Impossible de charger les suggestions de l’IA.') }),
        )
        .finally(() => setIsLoading(false)),
    [],
  )

  useEffect(() => {
    void fetchSuggestions()
  }, [fetchSuggestions])

  const load = () => {
    setIsLoading(true)
    return fetchSuggestions()
  }

  if (isLoading) {
    return <Card><Loader label="L’IA lit votre CV…" /></Card>
  }
  if (!data || !draft) {
    return feedback ? <Card className="text-sm text-error">{feedback.text}</Card> : null
  }

  if (!data.cv) {
    return (
      <Card className="flex flex-col items-center gap-3 border-2 border-dashed border-primary/30 text-center sm:flex-row sm:text-left">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <UploadCloud className="h-6 w-6" />
        </span>
        <p className="flex-1 text-sm text-muted">
          Déposez votre CV : l’IA proposera de compléter votre profil (coordonnées, expériences, formations, compétences).
          Vous validerez chaque élément.
        </p>
        <Link to={ROUTES.CV_ANALYSIS}><Button size="sm">Déposer mon CV</Button></Link>
      </Card>
    )
  }

  const total =
    draft.informations.length + draft.competences.length + draft.experiences.length + draft.formations.length
  const selected = {
    informations: draft.informations.filter((i) => i.selected),
    competences: draft.competences.filter((i) => i.selected),
    experiences: draft.experiences.filter((i) => i.selected && isExperienceValid(i)),
    formations: draft.formations.filter((i) => i.selected && isEducationValid(i)),
  }
  const selectedCount =
    selected.informations.length + selected.competences.length + selected.experiences.length + selected.formations.length

  const update = <K extends keyof DraftState>(group: K, key: string, patch: Partial<DraftState[K][number]>) =>
    setDraft((prev) =>
      prev
        ? { ...prev, [group]: (prev[group] as DraftState[K][number][]).map((item) => (item.key === key ? { ...item, ...patch } : item)) }
        : prev,
    )
  const toggle = <K extends keyof DraftState>(group: K, key: string) =>
    setDraft((prev) =>
      prev
        ? { ...prev, [group]: (prev[group] as DraftState[K][number][]).map((item) => (item.key === key ? { ...item, selected: !item.selected } : item)) }
        : prev,
    )
  const selectAll = (value: boolean) =>
    setDraft((prev) =>
      prev
        ? {
            informations: prev.informations.map((i) => ({ ...i, selected: value })),
            competences: prev.competences.map((i) => ({ ...i, selected: value })),
            experiences: prev.experiences.map((i) => ({ ...i, selected: value && isExperienceValid(i) })),
            formations: prev.formations.map((i) => ({ ...i, selected: value && isEducationValid(i) })),
          }
        : prev,
    )

  const apply = async () => {
    setIsApplying(true)
    setFeedback(null)
    const personal: Partial<Record<SuggestedField, string>> = {}
    selected.informations.forEach((item) => {
      personal[item.champ] = item.valeur.trim()
    })
    const { telephone, ...profileFields } = personal
    const tasks: Promise<unknown>[] = [
      ...(telephone ? [updateMe({ telephone })] : []),
      ...(Object.keys(profileFields).length ? [updateCandidateProfile(profileFields)] : []),
      ...selected.competences.map((s) => addSkill({ nom: s.nom, niveau: s.niveau, annees_experience: s.annees_experience })),
      ...selected.experiences.map((e) =>
        addExperience({
          poste: e.poste.trim(),
          entreprise: e.entreprise.trim(),
          date_debut: e.date_debut,
          date_fin: e.en_cours ? null : e.date_fin || null,
          en_cours: e.en_cours,
          description: e.description?.trim() || null,
        }),
      ),
      ...selected.formations.map((f) =>
        addEducation({
          diplome: f.diplome.trim(),
          etablissement: f.etablissement.trim(),
          date_debut: null,
          date_fin: obtentionDate(f.annee as number, f.mois as number),
          en_cours: false,
          description: null,
        }),
      ),
    ]
    const results = await Promise.allSettled(tasks)
    const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    await onApplied(personal)
    await load()
    setIsApplying(false)
    setIsConfirmOpen(false)
    setFeedback(
      failures.length
        ? {
            type: 'error',
            text: `${results.length - failures.length} élément(s) ajouté(s), ${failures.length} refusé(s) : ${errorMessage(failures[0].reason)}`,
          }
        : { type: 'success', text: `${results.length} modification(s) enregistrée(s) dans votre profil.` },
    )
  }

  return (
    <Card className="space-y-5 border-primary/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">Suggestions de l’IA</h2>
            <p className="text-xs text-muted">
              Extraites de « {data.cv.file_name} » · {formatDate(data.cv.analyzed_at)}. Cochez, corrigez si besoin, puis validez :
              rien n’est ajouté sans votre accord.
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => void load()} aria-label="Relire le CV">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {feedback && (
        <div className={cn('rounded-lg px-4 py-3 text-sm', feedback.type === 'success' ? 'bg-secondary-light text-foreground' : 'bg-error/10 text-error')}>
          {feedback.text}
        </div>
      )}

      {total === 0 ? (
        <p className="rounded-2xl bg-background p-4 text-sm text-muted">
          Votre profil contient déjà tout ce que l’IA a trouvé dans votre CV.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 text-xs">
            <button type="button" className="font-medium text-primary hover:underline" onClick={() => selectAll(true)}>
              Tout sélectionner
            </button>
            <button type="button" className="text-muted hover:text-foreground" onClick={() => selectAll(false)}>
              Tout désélectionner
            </button>
          </div>

          {draft.informations.length > 0 && (
            <section className="space-y-2">
              <GroupTitle icon={UserRound}>Informations personnelles</GroupTitle>
              {draft.informations.map((item) => (
                <SuggestionRow key={item.key} selected={item.selected} onToggle={() => toggle('informations', item.key)}>
                  <label className="block text-xs font-medium text-muted" htmlFor={`sugg-${item.key}`}>{item.label}</label>
                  {item.champ === 'biographie' ? (
                    <Textarea id={`sugg-${item.key}`} rows={3} value={item.valeur} onChange={(e) => update('informations', item.key, { valeur: e.target.value })} />
                  ) : (
                    <Input
                      id={`sugg-${item.key}`}
                      inputSize="sm"
                      type={item.champ === 'date_naissance' ? 'date' : 'text'}
                      value={item.valeur}
                      onChange={(e) => update('informations', item.key, { valeur: e.target.value })}
                    />
                  )}
                  {item.valeur_actuelle && (
                    <p className="text-xs text-muted">
                      Remplacera :{' '}
                      <span className="line-through">
                        {item.champ === 'date_naissance' ? formatDate(item.valeur_actuelle) : item.valeur_actuelle}
                      </span>
                    </p>
                  )}
                </SuggestionRow>
              ))}
            </section>
          )}

          {draft.competences.length > 0 && (
            <section className="space-y-2">
              <GroupTitle icon={Sparkles}>Compétences détectées</GroupTitle>
              <div className="grid gap-2 sm:grid-cols-2">
                {draft.competences.map((item) => (
                  <SuggestionRow key={item.key} selected={item.selected} onToggle={() => toggle('competences', item.key)}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground">{item.nom}</span>
                      <select
                        aria-label={`Niveau pour ${item.nom}`}
                        value={item.niveau}
                        onChange={(e) => update('competences', item.key, { niveau: e.target.value as SkillLevel })}
                        className="rounded-lg bg-surface px-2 py-1 text-xs text-foreground"
                      >
                        {SKILL_LEVELS.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                      </select>
                    </div>
                  </SuggestionRow>
                ))}
              </div>
            </section>
          )}

          {draft.experiences.length > 0 && (
            <section className="space-y-2">
              <GroupTitle icon={BriefcaseBusiness}>Expériences</GroupTitle>
              {draft.experiences.map((item) => {
                const valid = isExperienceValid(item)
                return (
                  <SuggestionRow key={item.key} selected={item.selected && valid} disabled={!valid} onToggle={() => toggle('experiences', item.key)}>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input inputSize="sm" aria-label="Poste" placeholder="Poste" value={item.poste} onChange={(e) => update('experiences', item.key, { poste: e.target.value })} />
                      <Input inputSize="sm" aria-label="Entreprise" placeholder="Entreprise (à compléter)" value={item.entreprise} hasError={!item.entreprise.trim()} onChange={(e) => update('experiences', item.key, { entreprise: e.target.value })} />
                      <Input inputSize="sm" type="date" aria-label="Date de début" value={item.date_debut ?? ''} onChange={(e) => update('experiences', item.key, { date_debut: e.target.value })} />
                      <Input inputSize="sm" type="date" aria-label="Date de fin" disabled={item.en_cours} value={item.date_fin ?? ''} onChange={(e) => update('experiences', item.key, { date_fin: e.target.value || null })} />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-muted">
                      <input type="checkbox" checked={item.en_cours} onChange={(e) => update('experiences', item.key, { en_cours: e.target.checked })} />
                      Poste actuel
                    </label>
                    {item.description && (
                      <Textarea rows={2} aria-label="Description" value={item.description} onChange={(e) => update('experiences', item.key, { description: e.target.value })} />
                    )}
                    {!valid && <p className="text-xs text-error">Complétez le poste, l’entreprise et la date de début pour pouvoir valider.</p>}
                  </SuggestionRow>
                )
              })}
            </section>
          )}

          {draft.formations.length > 0 && (
            <section className="space-y-2">
              <GroupTitle icon={GraduationCap}>Formations</GroupTitle>
              {draft.formations.map((item) => {
                const valid = isEducationValid(item)
                return (
                  <SuggestionRow key={item.key} selected={item.selected && valid} disabled={!valid} onToggle={() => toggle('formations', item.key)}>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="space-y-1">
                        <span className="text-xs font-medium text-muted">Diplôme ou certificat</span>
                        <Input inputSize="sm" value={item.diplome} hasError={!item.diplome.trim()} onChange={(e) => update('formations', item.key, { diplome: e.target.value })} />
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs font-medium text-muted">Établissement</span>
                        <Input inputSize="sm" placeholder="À compléter" value={item.etablissement} hasError={!item.etablissement.trim()} onChange={(e) => update('formations', item.key, { etablissement: e.target.value })} />
                      </label>
                    </div>
                    <fieldset className="space-y-1">
                      <legend className="text-xs font-medium text-muted">Date d’obtention</legend>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          aria-label="Mois d’obtention"
                          value={item.mois ?? ''}
                          onChange={(e) => update('formations', item.key, { mois: e.target.value ? Number(e.target.value) : null })}
                          className={cn('h-9 rounded-lg bg-field px-3 text-xs text-foreground', !item.mois && 'ring-2 ring-error/40')}
                        >
                          <option value="">Mois…</option>
                          {MONTH_OPTIONS.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
                        </select>
                        <Input
                          inputSize="sm"
                          type="number"
                          aria-label="Année d’obtention"
                          placeholder="Année"
                          min={1950}
                          max={currentYear + 1}
                          value={item.annee ?? ''}
                          hasError={!item.annee}
                          onChange={(e) => update('formations', item.key, { annee: e.target.value ? Number(e.target.value) : null })}
                        />
                      </div>
                    </fieldset>
                    {!valid && (
                      <p className="text-xs text-error">
                        {item.annee && !item.mois
                          ? 'Le CV n’indique pas le mois : choisissez-le pour pouvoir valider.'
                          : 'Complétez le diplôme, l’établissement et la date d’obtention pour pouvoir valider.'}
                      </p>
                    )}
                  </SuggestionRow>
                )
              })}
            </section>
          )}

          <div className="sticky bottom-20 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface/95 p-3 shadow-md backdrop-blur lg:bottom-4">
            <p className="text-xs text-muted">{selectedCount} élément(s) sélectionné(s) sur {total}</p>
            <Button disabled={selectedCount === 0} onClick={() => setIsConfirmOpen(true)}>
              <Check className="h-4 w-4" /> Valider la sélection
            </Button>
          </div>
        </>
      )}

      <Dialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => void apply()}
        title="Ajouter ces éléments à votre profil ?"
        description={`${selectedCount} élément(s) proposé(s) par l’IA seront enregistrés dans votre profil. Vous pourrez les modifier ou les supprimer ensuite.`}
        confirmLabel="Oui, ajouter"
        cancelLabel="Revoir"
        isLoading={isApplying}
      />
    </Card>
  )
}
