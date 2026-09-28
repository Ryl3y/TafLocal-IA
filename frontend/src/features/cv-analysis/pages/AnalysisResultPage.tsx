import { AlertTriangle, BrainCircuit, Briefcase, CheckCircle2, SearchX, Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AIInsightCard, AIScoreRing, MatchExplanation } from '../../../components/ai'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'
import { errorMessage } from '../../../services/api/apiClient'
import {
  getAnalysis,
  getLatestAnalysis,
  PROFICIENCY_LABELS,
  SCORE_DETAIL_LABELS,
  type CVAnalysis,
} from '../../../services/api/cvServices'

function scoreLabel(score: number) {
  if (score >= 80) return { text: 'Très compatible', variant: 'secondary' as const }
  if (score >= 65) return { text: 'Compatible', variant: 'primary' as const }
  if (score >= 50) return { text: 'Partiellement', variant: 'accent' as const }
  return { text: 'Peu compatible', variant: 'error' as const }
}

export function AnalysisResultPage() {
  const { analysisId = 'latest' } = useParams<{ analysisId: string }>()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const request: Promise<CVAnalysis | null> = analysisId === 'latest' ? getLatestAnalysis() : getAnalysis(analysisId)
    request
      .then((data) => active && setAnalysis(data))
      .catch((error) => active && setErrorText(errorMessage(error, 'Analyse introuvable.')))
      .finally(() => active && setIsLoading(false))
    return () => {
      active = false
    }
  }, [analysisId])

  if (isLoading) {
    return (
      <PageShell eyebrow="Résultats IA" title="Chargement du rapport">
        <div className="rounded-2xl border border-border bg-surface p-6"><Loader label="Chargement…" /></div>
      </PageShell>
    )
  }

  if (errorText || !analysis) {
    return (
      <PageShell eyebrow="Résultats IA" title="Aucun rapport">
        <EmptyState
          title="Aucune analyse disponible"
          description={errorText ?? 'Déposez un CV pour obtenir votre rapport.'}
          actionLabel="Analyser un CV"
          onAction={() => navigate(ROUTES.CV_ANALYSIS)}
        />
      </PageShell>
    )
  }

  if (analysis.status === 'NO_OFFERS') {
    return (
      <PageShell eyebrow="Résultats IA" title="Pas encore d’analyse" description={analysis.cv.file_name}>
        <EmptyState
          icon={SearchX}
          title="Aucune offre à comparer"
          description={
            analysis.error_message ||
            'Votre CV est analysé par rapport aux offres publiées : aucune offre n’est disponible pour le moment.'
          }
          actionLabel="Relancer depuis mes CV"
          onAction={() => navigate(ROUTES.CV_ANALYSIS)}
        />
      </PageShell>
    )
  }

  if (analysis.status === 'FAILED') {
    return (
      <PageShell eyebrow="Résultats IA" title="Le CV n’a pas pu être analysé" description={analysis.cv.file_name}>
        <EmptyState
          icon={AlertTriangle}
          title="Lecture impossible"
          description={analysis.error_message || 'Le fichier est illisible.'}
          actionLabel="Déposer un autre CV"
          onAction={() => navigate(ROUTES.CV_ANALYSIS)}
        />
      </PageShell>
    )
  }

  const label = scoreLabel(analysis.employability_score)
  const criteria = Object.entries(SCORE_DETAIL_LABELS)
    .filter(([key]) => typeof analysis.score_details[key as keyof CVAnalysis['score_details']] === 'number')
    .map(([key, text]) => ({ label: text, score: analysis.score_details[key as 'competences'] as number }))
  const offers = analysis.score_details.offres ?? []
  const offersCount = analysis.score_details.offres_analysees ?? offers.length
  const [priority, ...otherRecommendations] = analysis.recommendations

  return (
    <PageShell
      eyebrow="Résultats IA"
      title="Votre CV face aux offres publiées"
      description={`${analysis.cv.file_name} · analysé le ${new Date(analysis.analyzed_at).toLocaleDateString('fr-FR')}`}
      actions={
        <Link to={ROUTES.RECOMMENDED_JOBS}>
          <Button><Sparkles className="h-4 w-4" /> Voir les offres compatibles</Button>
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-primary-light/70 to-surface p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Compatibilité avec les offres</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">{analysis.employability_score}/100</h2>
            </div>
            <Badge variant={label.variant}>{label.text}</Badge>
          </div>
          <div className="mt-6 flex justify-center">
            <AIScoreRing score={analysis.employability_score} label="Compatibilité" size={140} />
          </div>
          <p className="mt-6 text-sm leading-7 text-muted">{analysis.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
            {analysis.experience_years !== null && <Badge variant="outline">{analysis.experience_years} an(s) d’expérience</Badge>}
            {analysis.education_level && <Badge variant="outline">{analysis.education_level}</Badge>}
          </div>
        </Card>

        <div className="space-y-6">
          {priority && (
            <AIInsightCard
              title={priority.title}
              category="Recommandation prioritaire"
              priority={priority.priority}
              insight={priority.description}
              actionItems={otherRecommendations.slice(0, 3).map((r) => r.title)}
            />
          )}
          <MatchExplanation
            overallScore={analysis.employability_score}
            summary={`Moyenne sur les ${offers.length} offre(s) les plus proches de votre CV, parmi ${offersCount} publiée(s).`}
            criteria={criteria}
          />
        </div>
      </div>

      {offers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>Offres les plus proches de votre CV</CardTitle>
            </div>
            <CardDescription>Ce sont ces offres qui déterminent votre score.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {offers.map((offer) => (
              <Link
                key={offer.id}
                to={ROUTES.JOB_DETAILS.replace(':jobId', offer.id)}
                className="block rounded-lg border border-border bg-background p-3 transition hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{offer.titre}</p>
                    {offer.entreprise && <p className="text-xs text-muted">{offer.entreprise}</p>}
                  </div>
                  <Badge variant={scoreLabel(offer.score).variant}>{offer.score}/100</Badge>
                </div>
                {offer.missing_skills.length > 0 && (
                  <p className="mt-2 text-xs text-muted">Manque : {offer.missing_skills.slice(0, 5).join(', ')}</p>
                )}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compétences détectées ({analysis.detected_skills.length})</CardTitle>
            <CardDescription>Ajoutées automatiquement à votre profil de matching.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analysis.detected_skills.length === 0 ? (
              <p className="text-sm text-muted">Aucune compétence reconnue.</p>
            ) : (
              analysis.detected_skills.map((skill) => (
                <Badge key={skill.id} variant="primary" title={skill.category ?? undefined}>
                  {skill.name}
                  {skill.proficiency_level && ` · ${PROFICIENCY_LABELS[skill.proficiency_level] ?? skill.proficiency_level}`}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Compétences exigées par les offres</CardTitle>
            <CardDescription>Demandées par les offres les plus proches, absentes de votre CV.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analysis.missing_skills.length === 0 ? (
              <p className="text-sm text-muted">Votre CV couvre les compétences exigées par ces offres.</p>
            ) : (
              analysis.missing_skills.map((skill) => (
                <Badge key={skill.id} variant={skill.importance === 'high' ? 'accent' : 'outline'}>{skill.name}</Badge>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
              <CardTitle>Points forts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.strengths.length === 0 && <p className="text-sm text-muted">—</p>}
            {analysis.strengths.map((strength) => (
              <div key={strength} className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />
                {strength}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Axes d’amélioration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...analysis.weaknesses, ...analysis.recommendations.map((r) => `${r.title} : ${r.description}`)].map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-lg border border-border bg-background p-3 text-sm text-muted">
                <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export default AnalysisResultPage
