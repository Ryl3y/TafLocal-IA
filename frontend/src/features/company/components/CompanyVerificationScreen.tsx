import { AlertTriangle, Check, Clock3, FileText, RefreshCw, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Card } from '../../../components/cards/Card'
import { FormField } from '../../../components/forms/FormField'
import { PdfFileInput } from '../../../components/forms/PdfFileInput'
import { pdfFileError } from '../../../utils/pdfFile'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { errorMessage } from '../../../services/api/apiClient'
import {
  MY_RCCM_DOCUMENT_ENDPOINT,
  openProtectedPdf,
  updateCompanyProfile,
  type CompanyProfile,
} from '../../../services/api/profileServices'
import { cn } from '../../../utils/cn'
import { formatDate } from '../../../utils/formatDate'

export interface CompanyVerificationScreenProps {
  company: CompanyProfile
  onRefresh: () => Promise<void> | void
  onUpdated: (company: CompanyProfile) => void
}

/**
 * Écran affiché à une entreprise tant qu'un administrateur n'a pas validé son RCCM :
 * aucune autre fonctionnalité n'est accessible (le backend refuse aussi toutes les autres routes).
 */
export function CompanyVerificationScreen({ company, onRefresh, onUpdated }: CompanyVerificationScreenProps) {
  const rejected = company.statut_verification === 'REJECTED'
  // Comptes créés avant l'obligation du RCCM / du certificat : ils doivent les fournir pour être vérifiés.
  const missingRccm = !company.registre_commerce
  const missingDocument = !company.document_rccm_disponible
  const showForm = rejected || missingRccm || missingDocument
  const [rccm, setRccm] = useState(company.registre_commerce ?? '')
  const [name, setName] = useState(company.nom_entreprise)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setIsRefreshing(false)
  }

  const resubmit = async (event: FormEvent) => {
    event.preventDefault()
    // Le certificat est obligatoire s'il n'a jamais été fourni ; sinon il peut être remplacé.
    const documentError = pdfFileError(file, missingDocument)
    setFileError(documentError)
    if (documentError) return
    setIsSaving(true)
    setError(null)
    try {
      onUpdated(await updateCompanyProfile({ registre_commerce: rccm.trim(), nom_entreprise: name.trim() }, file))
      setFile(null)
    } catch (err) {
      setError(errorMessage(err, 'La correction n’a pas pu être envoyée.').replace(/^\w+ : /, ''))
    } finally {
      setIsSaving(false)
    }
  }

  const steps = [
    { label: 'Inscription de l’entreprise', detail: formatDate(company.created_at), state: 'done' as const },
    {
      label: 'Vérification du RCCM par notre équipe',
      detail: rejected ? 'Refusée : correction attendue' : 'En cours (généralement sous 48 h ouvrées)',
      state: rejected ? ('error' as const) : ('current' as const),
    },
    { label: 'Publication d’offres et accès aux candidatures', detail: 'Après validation', state: 'todo' as const },
  ]

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 py-4">
      <div className="flex flex-col items-center text-center">
        <span
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-full',
            rejected ? 'bg-error/10 text-error' : 'bg-pastel-blue text-primary',
          )}
        >
          {rejected ? <AlertTriangle className="h-10 w-10" /> : <ShieldCheck className="h-10 w-10" />}
        </span>
        <h1 className="mt-5 text-2xl font-bold text-foreground">
          {rejected ? 'Vérification refusée' : 'Vérification de votre entreprise en cours'}
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
          {rejected
            ? 'Notre équipe n’a pas pu valider votre entreprise. Corrigez les informations ci-dessous : votre dossier sera automatiquement réexaminé.'
            : missingRccm || missingDocument
              ? 'Pour protéger les candidats contre les fausses offres, chaque entreprise doit fournir son numéro de registre de commerce (RCCM) et une copie PDF de son certificat. Complétez votre dossier ci-dessous pour lancer la vérification.'
              : 'Pour protéger les candidats contre les fausses offres, chaque entreprise est vérifiée à partir de son numéro de registre de commerce. Vous pourrez publier des offres dès la validation.'}
        </p>
      </div>

      {rejected && company.motif_rejet && (
        <div role="alert" className="rounded-2xl border border-error/30 bg-error/5 p-4 text-sm">
          <p className="font-semibold text-error">Motif indiqué par l’administrateur</p>
          <p className="mt-1 whitespace-pre-line text-foreground">{company.motif_rejet}</p>
        </div>
      )}

      <Card className="space-y-5">
        <ol className="space-y-4">
          {steps.map((step) => (
            <li key={step.label} className="flex gap-3">
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  step.state === 'done' && 'bg-secondary text-white',
                  step.state === 'current' && 'border-2 border-primary text-primary',
                  step.state === 'error' && 'bg-error text-white',
                  step.state === 'todo' && 'border-2 border-border text-muted',
                )}
              >
                {step.state === 'done' ? <Check className="h-4 w-4" /> : step.state === 'current' ? <Clock3 className="h-4 w-4" /> : step.state === 'error' ? <AlertTriangle className="h-3.5 w-3.5" /> : null}
              </span>
              <div>
                <p className={cn('text-sm font-medium', step.state === 'todo' ? 'text-muted' : 'text-foreground')}>{step.label}</p>
                <p className="text-xs text-muted">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <dl className="grid gap-3 rounded-2xl bg-background p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">Entreprise</dt>
            <dd className="font-medium text-foreground">{company.nom_entreprise}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Numéro RCCM déclaré</dt>
            <dd className="font-mono font-medium text-foreground">{company.registre_commerce || '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted">Certificat RCCM</dt>
            <dd className="flex items-center gap-2 font-medium text-foreground">
              {company.document_rccm_disponible ? (
                <>
                  <FileText className="h-4 w-4 shrink-0 text-error" />
                  <span className="truncate">{company.document_rccm_nom || 'certificat.pdf'}</span>
                  <button
                    type="button"
                    onClick={() => void openProtectedPdf(MY_RCCM_DOCUMENT_ENDPOINT).catch((err) => setError(errorMessage(err)))}
                    className="ml-auto shrink-0 text-xs font-medium text-primary hover:underline"
                  >
                    Voir
                  </button>
                </>
              ) : (
                <span className="text-error">Non fourni</span>
              )}
            </dd>
          </div>
        </dl>

        {error && !showForm && <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}

        {!showForm && (
          <Button variant="outline" fullWidth onClick={() => void refresh()} isLoading={isRefreshing}>
            <RefreshCw className="h-4 w-4" /> Actualiser le statut
          </Button>
        )}
      </Card>

      {showForm && (
        <Card>
          <form className="space-y-4" onSubmit={(event) => void resubmit(event)}>
            <h2 className="text-base font-semibold text-foreground">
              {rejected ? 'Corriger et renvoyer' : 'Compléter votre dossier'}
            </h2>
            <FormField label="Nom de l’entreprise" htmlFor="fix-name">
              <Input id="fix-name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField label="Numéro de registre de commerce (RCCM)" htmlFor="fix-rccm" hint="Exemple : RC/DLA/2020/B/01234">
              <Input id="fix-rccm" required className="uppercase" value={rccm} onChange={(e) => setRccm(e.target.value)} />
            </FormField>
            <PdfFileInput
              label={missingDocument ? 'Copie du certificat RCCM (PDF)' : 'Remplacer le certificat (facultatif)'}
              value={file}
              onChange={(next) => {
                setFile(next)
                setFileError(next ? pdfFileError(next) : null)
              }}
              error={fileError}
              hint="Visible uniquement par notre équipe de vérification."
            />
            {error && <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}
            <Button type="submit" size="lg" fullWidth isLoading={isSaving}>
              Renvoyer pour vérification
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
