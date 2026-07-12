import { CheckCircle2, FileText, Sparkles, UploadCloud } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Loader } from '../../../components/feedback/Loader'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { ROUTES } from '../../../constants/routes'
import { getAnalysisHistory, type AnalysisHistoryItem } from '../../../services/api/demoServices'

export function CVAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [previousAnalyses, setPreviousAnalyses] = useState<AnalysisHistoryItem[]>([])

  useEffect(() => {
    void getAnalysisHistory().then((data) => setPreviousAnalyses(data))
  }, [])

  return (
    <PageShell
      eyebrow="Analyse IA"
      title="Analysez votre CV en quelques minutes"
      description="Chargez votre document et obtenez un diagnostic précis sur votre positionnement, vos forces et les opportunités à saisir."
      actions={
        <Link to={ROUTES.CV_ANALYSIS_RESULT.replace(':analysisId', 'demo-analysis')}>
          <Button>Voir le résultat</Button>
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-primary-light/70 to-surface p-6">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <UploadCloud className="h-5 w-5" />
              <CardTitle>Déposer un CV</CardTitle>
            </div>
            <CardDescription>Formats acceptés : PDF, DOCX, DOC. Taille recommandée : jusqu’à 5 Mo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-surface/80 px-6 py-10 text-center transition hover:border-primary/50">
              <UploadCloud className="h-10 w-10 text-primary" />
              <span className="mt-3 text-base font-semibold text-foreground">Glissez votre CV ou cliquez pour sélectionner</span>
              <span className="mt-2 text-sm text-muted">Nous analyserons votre expérience, vos compétences et votre adéquation aux postes ciblés.</span>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  setSelectedFile(file?.name ?? null)
                }}
              />
            </label>
            {selectedFile && (
              <div className="rounded-xl border border-secondary/20 bg-secondary-light/40 p-3 text-sm text-foreground">
                Fichier sélectionné : <span className="font-semibold">{selectedFile}</span>
              </div>
            )}
            {errorMessage && (
              <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
                {errorMessage}
              </div>
            )}
            {analysisComplete && (
              <div className="rounded-xl border border-secondary/20 bg-secondary-light/40 p-3 text-sm text-foreground">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  Analyse démarrée avec succès.
                </div>
                <p className="mt-1 text-muted">Le rapport détaillé sera disponible dans quelques secondes.</p>
              </div>
            )}
            {isAnalyzing ? (
              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <Loader label="Analyse en cours…" />
              </div>
            ) : (
              <Button
                fullWidth
                onClick={() => {
                  if (!selectedFile) {
                    setErrorMessage('Sélectionnez d’abord un fichier à analyser.')
                    return
                  }

                  setErrorMessage(null)
                  setAnalysisComplete(false)
                  setIsAnalyzing(true)
                  window.setTimeout(() => {
                    setIsAnalyzing(false)
                    setAnalysisComplete(true)
                  }, 1200)
                }}
              >
                <Sparkles className="h-4 w-4" />
                Lancer l’analyse IA
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-secondary" />
              <CardTitle>Analyses récentes</CardTitle>
            </div>
            <CardDescription>Retrouvez votre historique d’évaluations IA.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {previousAnalyses.map((analysis) => (
              <div key={analysis.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{analysis.name}</p>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{analysis.status}</span>
                </div>
                <p className="mt-1 text-sm text-muted">Analyse réalisée le {analysis.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export default CVAnalysisPage
