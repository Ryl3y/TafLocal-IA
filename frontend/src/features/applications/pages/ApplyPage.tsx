import { motion } from 'framer-motion'
import { ArrowLeft, Check, FileText, SendHorizonal, Sparkles, UploadCloud } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MatchScoreBadge } from '../../../components/ai'
import { PageShell } from '../../../components/common'
import { Card } from '../../../components/cards/Card'
import { JobSummaryRow } from '../../../components/cards/JobSummaryRow'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { Textarea } from '../../../components/ui/Textarea'
import { ROUTES } from '../../../constants/routes'
import { generateCoverLetter } from '../../../services/api/aiServices'
import { errorMessage } from '../../../services/api/apiClient'
import { applicationsService } from '../../../services/api/applicationsService'
import { getMyCVs, uploadCV, type CV } from '../../../services/api/cvServices'
import {
  formatJobPay,
  jobsService,
  MIN_REQUIRED_LETTER_LENGTH,
  type Job,
  type MatchResult,
} from '../../../services/api/jobsService'
import { formatDate } from '../../../utils/formatDate'

export function ApplyPage() {
  const { jobId = '' } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [match, setMatch] = useState<MatchResult | null>(null)
  const [cvs, setCvs] = useState<CV[]>([])
  // CV obligatoire : par défaut le plus récent, modifiable par le candidat.
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null)
  const [isUploadingCv, setIsUploadingCv] = useState(false)
  const [letter, setLetter] = useState('')
  const [letterFromAI, setLetterFromAI] = useState(false)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [jobData, cvList] = await Promise.all([jobsService.getJob(jobId), getMyCVs().catch(() => [])])
        if (!active) return
        setJob(jobData)
        setCvs(cvList)
        setSelectedCvId(cvList[0]?.id ?? null)
        jobsService.getMatch(jobId).then((m) => active && setMatch(m)).catch(() => undefined)
      } catch (error) {
        if (active) setLoadError(errorMessage(error, 'Offre introuvable.'))
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [jobId])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setErrorText(null)
    try {
      const response = await generateCoverLetter(jobId)
      setLetter(response.contenu)
      setLetterFromAI(true)
    } catch (error) {
      setErrorText(errorMessage(error, 'La génération de la lettre a échoué.'))
    } finally {
      setIsGenerating(false)
    }
  }

  // Dépôt d'un CV sans quitter la candidature (analysé par l'IA comme sur la page Analyse CV).
  const uploadNewCv = async (file: File | undefined) => {
    if (!file) return
    setIsUploadingCv(true)
    setErrorText(null)
    try {
      const cv = await uploadCV(file)
      setCvs((previous) => [cv, ...previous])
      setSelectedCvId(cv.id)
    } catch (error) {
      setErrorText(errorMessage(error, 'Le dépôt du CV a échoué.').replace(/^\w+ : /, ''))
    } finally {
      setIsUploadingCv(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setErrorText(null)
    try {
      await applicationsService.createApplication({
        offre: jobId,
        cv: selectedCvId ?? undefined,
        commentaire: comment || undefined,
        // Lettre non demandée par l'entreprise : on ne l'envoie pas.
        lettre_motivation: job?.lettre_motivation === 'NON_DEMANDEE' ? undefined : letter || undefined,
        lettre_generee_par_ia: letterFromAI,
      })
      setSubmitted(true)
    } catch (error) {
      setErrorText(errorMessage(error, 'L’envoi de la candidature a échoué.'))
    } finally {
      setIsSubmitting(false)
      setIsConfirmOpen(false)
    }
  }

  if (isLoading) {
    return (
      <PageShell eyebrow="Candidature" title="Postuler à l’offre">
        <div className="rounded-2xl border border-border bg-surface p-6"><Loader label="Chargement…" /></div>
      </PageShell>
    )
  }

  if (loadError || !job) {
    return (
      <PageShell eyebrow="Candidature" title="Offre indisponible">
        <EmptyState title="Offre introuvable" description={loadError ?? undefined} actionLabel="Voir les offres" onAction={() => navigate(ROUTES.JOBS_LIST)} />
      </PageShell>
    )
  }

  const letterRequirement = job.lettre_motivation ?? 'FACULTATIVE'
  const letterRequired = letterRequirement === 'OBLIGATOIRE'
  const letterLength = letter.trim().length
  const missingPieces = [
    !selectedCvId && 'un CV',
    letterRequired && letterLength < MIN_REQUIRED_LETTER_LENGTH && 'une lettre de motivation',
  ].filter(Boolean) as string[]
  const summary = (
    <JobSummaryRow
      title={job.titre}
      company={job.entreprise_nom}
      logo={job.entreprise_logo}
      salary={formatJobPay(job)}
      location={job.localisation || 'Non précisée'}
    />
  )

  // Écran « Successful » du kit
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="mx-auto w-full max-w-lg space-y-8"
      >
        <Card padding="sm">{summary}</Card>

        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-pastel-blue" aria-hidden>
            <div className="flex h-28 w-24 -rotate-6 flex-col gap-2 rounded-xl bg-surface p-3 shadow-md">
              <span className="h-2 w-10 rounded-full bg-primary/60" />
              <span className="h-1.5 w-full rounded-full bg-field" />
              <span className="h-1.5 w-full rounded-full bg-field" />
              <span className="h-1.5 w-3/4 rounded-full bg-field" />
              <span className="h-1.5 w-full rounded-full bg-field" />
            </div>
            <span className="absolute right-6 bottom-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg">
              <Check className="h-7 w-7" strokeWidth={3} />
            </span>
          </div>

          <h1 className="mt-8 text-2xl font-bold text-foreground">Candidature envoyée !</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            Vous avez postulé au poste de <span className="font-medium text-foreground">{job.titre}</span> chez{' '}
            {job.entreprise_nom}. Suivez son avancement dans « Mes candidatures ».
          </p>
        </div>

        <div className="space-y-3">
          <Link to={ROUTES.MY_APPLICATIONS} className="block">
            <Button size="lg" fullWidth>Suivre ma candidature</Button>
          </Link>
          <Link to={ROUTES.INTERVIEW.replace(':sessionId', 'new') + `?offre=${job.id}`} className="block">
            <Button size="lg" variant="outline" fullWidth className="border-primary text-primary">
              Préparer l’entretien
            </Button>
          </Link>
          <Link to={ROUTES.JOBS_LIST} className="block text-center text-sm text-muted hover:text-primary">
            Parcourir d’autres offres
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mx-auto w-full max-w-3xl space-y-6"
    >
      <header className="relative flex items-center justify-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-field"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Postuler</h1>
      </header>

      <Card padding="sm" className="space-y-3">
        {summary}
        {match && (
          <div className="flex items-start gap-3 border-t border-border pt-3 text-xs leading-5 text-muted">
            <MatchScoreBadge score={match.score} className="shrink-0" />
            <p>{match.explanation}</p>
          </div>
        )}
      </Card>

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault()
          setIsConfirmOpen(true)
        }}
      >
        {/* CV obligatoire — cartes à sélectionner façon « Select a resume » */}
        <section className="space-y-3">
          <div className="section-title">
            <h2>
              Votre CV <span className="font-normal text-error">(obligatoire)</span>
            </h2>
            <Link to={ROUTES.CV_ANALYSIS}>Gérer mes CV</Link>
          </div>
          {cvs.length > 0 && (
            <div role="radiogroup" aria-label="CV à transmettre" className="space-y-2">
              {cvs.map((cv) => {
                const selected = cv.id === selectedCvId
                return (
                  <button
                    key={cv.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedCvId(cv.id)}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 bg-surface p-4 text-left transition-colors ${
                      selected ? 'border-primary' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                      <FileText className="h-6 w-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">{cv.file_name}</span>
                      <span className="block text-xs text-muted">
                        Déposé le {formatDate(cv.uploaded_at)}
                        {cv.employability_score !== null && ` · score ${cv.employability_score}/100`}
                      </span>
                    </span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected ? 'border-primary bg-primary text-white' : 'border-border'
                      }`}
                    >
                      {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 text-sm transition-colors hover:bg-primary-light ${
              cvs.length === 0 ? 'border-error/50 text-error' : 'border-primary/40 text-primary'
            } ${isUploadingCv ? 'pointer-events-none opacity-60' : ''}`}
          >
            <UploadCloud className="h-5 w-5" />
            {isUploadingCv
              ? 'Dépôt et analyse du CV…'
              : cvs.length === 0
                ? 'Aucun CV : déposez-en un pour pouvoir postuler (PDF, DOCX, DOC, TXT)'
                : 'Déposer un autre CV'}
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="sr-only"
              onChange={(event) => {
                void uploadNewCv(event.target.files?.[0])
                event.target.value = ''
              }}
            />
          </label>
          {match && match.missing_skills.length > 0 && (match.recommendations ?? []).length > 0 && (
            <div className="rounded-2xl bg-pastel-sand p-4 text-sm">
              <p className="font-semibold text-foreground">Points à mettre en avant</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted">
                {(match.recommendations ?? []).slice(0, 3).map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
            </div>
          )}
        </section>

        {letterRequirement === 'NON_DEMANDEE' ? (
          <p className="rounded-2xl bg-field px-4 py-3 text-sm text-muted">
            Cette offre ne demande pas de lettre de motivation : votre CV suffit.
          </p>
        ) : (
          <section className="space-y-3">
            <div className="section-title">
              <h2>
                Lettre de motivation{' '}
                <span className={`font-normal ${letterRequired ? 'text-error' : 'text-muted'}`}>
                  ({letterRequired ? 'obligatoire' : 'facultative'})
                </span>
              </h2>
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary disabled:opacity-50"
              >
                <Sparkles className={isGenerating ? 'h-4 w-4 animate-pulse-soft' : 'h-4 w-4'} />
                {isGenerating ? 'Génération…' : letter ? 'Régénérer avec l’IA' : 'Générer avec l’IA'}
              </button>
            </div>
            <Textarea
              id="apply-letter"
              aria-label="Lettre de motivation"
              aria-required={letterRequired}
              rows={10}
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              placeholder="Expliquez pourquoi cette mission vous correspond, ou générez une proposition avec l’IA."
            />
            {letterRequired && (
              <p className={`text-right text-xs ${letterLength >= MIN_REQUIRED_LETTER_LENGTH ? 'text-secondary' : 'text-muted'}`}>
                {letterLength} / {MIN_REQUIRED_LETTER_LENGTH} caractères minimum
              </p>
            )}
          </section>
        )}

        <section className="space-y-3">
          <div className="section-title"><h2>Message au recruteur</h2></div>
          <Textarea
            id="apply-comment"
            aria-label="Message au recruteur"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Disponibilité, précisions…"
          />
        </section>

        {errorText && <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{errorText}</div>}

        <div className="sticky bottom-20 z-20 space-y-2 rounded-2xl bg-surface/95 p-3 shadow-md backdrop-blur lg:bottom-4">
          {missingPieces.length > 0 && (
            <p className="text-center text-xs text-error">Pour postuler, il manque {missingPieces.join(' et ')}.</p>
          )}
          <Button type="submit" size="lg" fullWidth disabled={missingPieces.length > 0 || isUploadingCv}>
            Envoyer la candidature <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <Dialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => void handleSubmit()}
        title="Confirmer votre candidature"
        description={`Votre dossier sera transmis à ${job.entreprise_nom}.`}
        confirmLabel="Envoyer"
        cancelLabel="Modifier"
        isLoading={isSubmitting}
      />
    </motion.div>
  )
}

export default ApplyPage
