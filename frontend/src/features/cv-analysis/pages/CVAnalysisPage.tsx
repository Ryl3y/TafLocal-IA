import { AlertTriangle, FileText, RefreshCw, Sparkles, Trash2, UploadCloud } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../constants/routes'
import { useApiData } from '../../../hooks'
import { errorMessage } from '../../../services/api/apiClient'
import { analyzeCV, deleteCV, getMyCVs, uploadCV, type CV } from '../../../services/api/cvServices'
import { formatDate } from '../../../utils/formatDate'

const MAX_SIZE = 5 * 1024 * 1024
const ACCEPTED = ['.pdf', '.docx', '.doc', '.txt']

export function CVAnalysisPage() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const { data: cvs = [], isLoading: isLoadingList, error: listError, reload: loadCVs } = useApiData(
    getMyCVs,
    [],
    'Impossible de charger vos CV.',
  )
  const [busyId, setBusyId] = useState<number | null>(null)

  const selectFile = (file: File | undefined) => {
    setErrorText(null)
    if (!file) return setSelectedFile(null)
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!ACCEPTED.includes(extension)) {
      setSelectedFile(null)
      return setErrorText('Formats acceptés : PDF, DOCX, DOC ou TXT.')
    }
    if (file.size > MAX_SIZE) {
      setSelectedFile(null)
      return setErrorText('Le fichier ne doit pas dépasser 5 Mo.')
    }
    setSelectedFile(file)
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorText('Sélectionnez d’abord un fichier à analyser.')
      return
    }
    setIsAnalyzing(true)
    setErrorText(null)
    try {
      const cv = await uploadCV(selectedFile)
      if (cv.analysis_status === 'COMPLETED' && cv.analysis_id) {
        navigate(ROUTES.CV_ANALYSIS_RESULT.replace(':analysisId', String(cv.analysis_id)))
        return
      }
      loadCVs()
      setSelectedFile(null)
      if (cv.analysis_status === 'FAILED' && cv.analysis_id) {
        navigate(ROUTES.CV_ANALYSIS_RESULT.replace(':analysisId', String(cv.analysis_id)))
      }
    } catch (error) {
      setErrorText(errorMessage(error, 'L’analyse a échoué.'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReanalyze = async (cv: CV) => {
    setBusyId(cv.id)
    try {
      const analysis = await analyzeCV(cv.id)
      navigate(ROUTES.CV_ANALYSIS_RESULT.replace(':analysisId', String(analysis.id)))
    } catch (error) {
      setErrorText(errorMessage(error, 'La nouvelle analyse a échoué.'))
      loadCVs()
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (cv: CV) => {
    if (!window.confirm(`Supprimer « ${cv.file_name} » ?`)) return
    setBusyId(cv.id)
    try {
      await deleteCV(cv.id)
      loadCVs()
    } catch (error) {
      setErrorText(errorMessage(error, 'La suppression a échoué.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <PageShell
      eyebrow="Analyse IA"
      title="Analysez votre CV en quelques secondes"
      description="Le moteur IA interne de TafLocal lit votre CV, détecte vos compétences, calcule un score d’employabilité et propose des axes d’amélioration."
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-primary-light/70 to-surface p-6">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <UploadCloud className="h-5 w-5" />
              <CardTitle>Déposer un CV</CardTitle>
            </div>
            <CardDescription>Formats acceptés : PDF, DOCX, DOC, TXT. Taille maximale : 5 Mo. Un PDF scanné (image) ne peut pas être lu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-surface/80 px-6 py-10 text-center transition hover:border-primary/50"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                selectFile(event.dataTransfer.files?.[0])
              }}
            >
              <UploadCloud className="h-10 w-10 text-primary" />
              <span className="mt-3 text-base font-semibold text-foreground">Glissez votre CV ou cliquez pour sélectionner</span>
              <span className="mt-2 text-sm text-muted">Expérience, compétences, formation, langues et coordonnées seront analysées.</span>
              <input
                type="file"
                accept={ACCEPTED.join(',')}
                className="sr-only"
                onChange={(event) => selectFile(event.target.files?.[0])}
              />
            </label>
            {selectedFile && (
              <div className="rounded-xl border border-secondary/20 bg-secondary-light/40 p-3 text-sm text-foreground">
                Fichier sélectionné : <span className="font-semibold">{selectedFile.name}</span>
              </div>
            )}
            {(errorText ?? listError) && (
              <div className="rounded-xl border border-error/20 bg-error/10 p-3 text-sm text-error">{errorText ?? listError}</div>
            )}
            {isAnalyzing ? (
              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <Loader label="Analyse en cours…" />
              </div>
            ) : (
              <Button fullWidth onClick={() => void handleAnalyze()} disabled={!selectedFile}>
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
              <CardTitle>Mes CV analysés</CardTitle>
            </div>
            <CardDescription>Le CV le plus récent est utilisé pour vos recommandations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingList ? (
              <Loader label="Chargement…" />
            ) : cvs.length === 0 ? (
              <p className="text-sm text-muted">Aucun CV pour le moment.</p>
            ) : (
              cvs.map((cv) => (
                <div key={cv.id} className="space-y-3 rounded-xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{cv.file_name}</p>
                      <p className="text-xs text-muted">Déposé le {formatDate(cv.uploaded_at)}</p>
                    </div>
                    {cv.analysis_status === 'COMPLETED' && cv.employability_score !== null ? (
                      <Badge variant="secondary">{cv.employability_score}/100</Badge>
                    ) : cv.analysis_status === 'FAILED' ? (
                      <Badge variant="error"><AlertTriangle className="h-3 w-3" /> Illisible</Badge>
                    ) : (
                      <Badge variant="outline">Non analysé</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cv.analysis_id && (
                      <Link to={ROUTES.CV_ANALYSIS_RESULT.replace(':analysisId', String(cv.analysis_id))}>
                        <Button size="sm" variant="outline">Voir le rapport</Button>
                      </Link>
                    )}
                    <Button size="sm" variant="ghost" isLoading={busyId === cv.id} onClick={() => void handleReanalyze(cv)}>
                      <RefreshCw className="h-3.5 w-3.5" /> Réanalyser
                    </Button>
                    <Button size="sm" variant="ghost" disabled={busyId === cv.id} onClick={() => void handleDelete(cv)} aria-label="Supprimer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export default CVAnalysisPage
