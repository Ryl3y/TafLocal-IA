import { CheckCircle2, FileText, SendHorizonal, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MatchScoreBadge } from '../../../components/ai'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { FormField, FormGroup } from '../../../components/forms/FormField'
import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { Textarea } from '../../../components/ui/Textarea'
import { ROUTES } from '../../../constants/routes'
import { generateCoverLetter } from '../../../services/api/aiServices'
import { errorMessage } from '../../../services/api/apiClient'
import { applicationsService } from '../../../services/api/applicationsService'
import { getMyCVs, type CV } from '../../../services/api/cvServices'
import { jobsService, type Job, type MatchResult } from '../../../services/api/jobsService'

export function ApplyPage() {
  const { jobId = '' } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [match, setMatch] = useState<MatchResult | null>(null)
  const [cvs, setCvs] = useState<CV[]>([])
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

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setErrorText(null)
    try {
      await applicationsService.createApplication({
        offre: jobId,
        commentaire: comment || undefined,
        lettre_motivation: letter || undefined,
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

  const latestCV = cvs[0]

  return (
    <PageShell
      eyebrow="Candidature"
      title={`Postuler : ${job.titre}`}
      description={`${job.entreprise_nom} · ${job.localisation || 'Localisation non précisée'} · ${job.type_contrat_display}`}
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="h-fit bg-surface">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle>Résumé de la candidature</CardTitle>
                <CardDescription>{job.entreprise_nom}</CardDescription>
              </div>
              {match && <MatchScoreBadge score={match.score} />}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted">
            {match && <p>{match.explanation}</p>}
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" /> CV transmis
              </p>
              {latestCV ? (
                <p className="mt-1">
                  {latestCV.file_name}
                  {latestCV.employability_score !== null && ` · score ${latestCV.employability_score}/100`}
                </p>
              ) : (
                <p className="mt-1">
                  Aucun CV déposé.{' '}
                  <Link to={ROUTES.CV_ANALYSIS} className="text-primary hover:underline">Déposer un CV</Link> pour renforcer votre candidature.
                </p>
              )}
            </div>
            {match && match.missing_skills.length > 0 && (
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="font-semibold text-foreground">Points à mettre en avant</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {(match.recommendations ?? []).slice(0, 3).map((tip) => <li key={tip}>{tip}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Envoyer votre candidature</CardTitle>
            <CardDescription>Votre profil et votre CV seront transmis au recruteur.</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4 rounded-xl border border-secondary/20 bg-secondary-light/40 p-4 text-sm text-foreground">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  Candidature envoyée avec succès.
                </div>
                <p className="text-muted">Vous serez notifié à chaque changement de statut.</p>
                <div className="flex flex-wrap gap-2">
                  <Link to={ROUTES.MY_APPLICATIONS}><Button variant="outline">Mes candidatures</Button></Link>
                  <Link to={ROUTES.INTERVIEW.replace(':sessionId', 'new') + `?offre=${job.id}`}>
                    <Button>Préparer l’entretien</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  setIsConfirmOpen(true)
                }}
              >
                <FormGroup>
                  <FormField label="Lettre de motivation" htmlFor="apply-letter" hint="Facultative, mais recommandée.">
                    <Textarea
                      id="apply-letter"
                      rows={12}
                      value={letter}
                      onChange={(e) => {
                        setLetter(e.target.value)
                      }}
                      placeholder="Expliquez pourquoi cette mission vous correspond, ou générez une proposition avec l’IA."
                    />
                  </FormField>
                  <Button type="button" variant="outline" onClick={() => void handleGenerate()} isLoading={isGenerating}>
                    <Sparkles className="h-4 w-4" /> {letter ? 'Régénérer avec l’IA' : 'Générer avec l’IA'}
                  </Button>
                  <FormField label="Message au recruteur" htmlFor="apply-comment">
                    <Textarea
                      id="apply-comment"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Disponibilité, précisions…"
                    />
                  </FormField>
                </FormGroup>
                {errorText && (
                  <div className="rounded-xl border border-error/20 bg-error/10 p-3 text-sm text-error">{errorText}</div>
                )}
                <Button type="submit" fullWidth>
                  Envoyer la candidature <SendHorizonal className="h-4 w-4" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

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
    </PageShell>
  )
}

export default ApplyPage
