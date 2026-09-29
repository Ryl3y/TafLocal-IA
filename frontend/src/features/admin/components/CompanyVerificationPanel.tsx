import { Building2, Check, Copy, ExternalLink, FileText, ShieldCheck, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Card } from '../../../components/cards/Card'
import { Loader } from '../../../components/feedback/Loader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { CompanyLogo } from '../../../components/ui/CompanyLogo'
import { Dialog } from '../../../components/ui/Dialog'
import { Textarea } from '../../../components/ui/Textarea'
import { errorMessage } from '../../../services/api/apiClient'
import {
  approveCompany,
  companyRccmDocumentEndpoint,
  getCompaniesForReview,
  openProtectedPdf,
  rejectCompany,
  type CompanyForReview,
  type CompanyVerificationStatus,
} from '../../../services/api/profileServices'
import { cn } from '../../../utils/cn'
import { formatDate } from '../../../utils/formatDate'

const TABS: { value: CompanyVerificationStatus; label: string }[] = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Validées' },
  { value: 'REJECTED', label: 'Rejetées' },
]

const STATUS_BADGE: Record<CompanyVerificationStatus, 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
}

type PendingAction = { type: 'approve' | 'reject'; company: CompanyForReview } | null

/**
 * Vérification des entreprises : l'administrateur contrôle le RCCM puis valide ou rejette le compte.
 */
export function CompanyVerificationPanel() {
  const [tab, setTab] = useState<CompanyVerificationStatus>('PENDING')
  const [companies, setCompanies] = useState<CompanyForReview[]>([])
  const [counts, setCounts] = useState<Record<CompanyVerificationStatus, number>>({ PENDING: 0, APPROVED: 0, REJECTED: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [action, setAction] = useState<PendingAction>(null)
  const [motif, setMotif] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const fetchCompanies = useCallback(
    (status: CompanyVerificationStatus) =>
      getCompaniesForReview(status)
        .then((data) => {
          setCompanies(data.results)
          setCounts(data.counts)
          setError(null)
        })
        .catch((err) => setError(errorMessage(err, 'Impossible de charger les entreprises.')))
        .finally(() => setIsLoading(false)),
    [],
  )

  useEffect(() => {
    void fetchCompanies(tab)
  }, [fetchCompanies, tab])

  const selectTab = (value: CompanyVerificationStatus) => {
    if (value === tab) return
    setIsLoading(true)
    setTab(value)
  }

  const copyRccm = (value: string) => {
    void navigator.clipboard?.writeText(value).then(() => {
      setCopied(value)
      window.setTimeout(() => setCopied(null), 1500)
    })
  }

  const confirm = async () => {
    if (!action) return
    setIsSubmitting(true)
    try {
      if (action.type === 'approve') await approveCompany(action.company.id)
      else await rejectCompany(action.company.id, motif.trim())
      setAction(null)
      setMotif('')
      await fetchCompanies(tab)
    } catch (err) {
      setError(errorMessage(err, 'La décision n’a pas pu être enregistrée.'))
      setAction(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">Vérification des entreprises</h2>
            <p className="text-xs text-muted">
              Contrôlez le numéro RCCM auprès du registre avant d’activer un compte. Une entreprise non validée ne peut rien faire sur la plateforme.
            </p>
          </div>
        </div>
      </div>

      <div role="tablist" aria-label="Statut des entreprises" className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => selectTab(item.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors',
              tab === item.value ? 'border-primary bg-primary text-white' : 'border-border text-muted hover:text-foreground',
            )}
          >
            {item.label}
            <span className={cn('rounded-full px-1.5 text-[0.65rem]', tab === item.value ? 'bg-white/20' : 'bg-field')}>
              {counts[item.value]}
            </span>
          </button>
        ))}
      </div>

      {error && <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}

      {isLoading ? (
        <Loader label="Chargement…" />
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-background p-8 text-center text-sm text-muted">
          <Building2 className="h-8 w-8" />
          {tab === 'PENDING' ? 'Aucune entreprise en attente de vérification.' : 'Aucune entreprise dans cette catégorie.'}
        </div>
      ) : (
        <ul className="space-y-3">
          {companies.map((company) => (
            <li key={company.id} className="rounded-2xl border border-border/60 bg-background p-4">
              <div className="flex flex-wrap items-start gap-3">
                <CompanyLogo name={company.nom_entreprise} src={company.logo} className="rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{company.nom_entreprise}</p>
                    <Badge variant={STATUS_BADGE[company.statut_verification]}>{company.statut_verification_display}</Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {company.contact || '—'} · {company.email} · inscrite le {formatDate(company.created_at)}
                    {company.ville ? ` · ${company.ville}` : ''}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-surface px-3 py-2">
                <span className="text-xs text-muted">RCCM</span>
                <code className="font-mono text-sm font-semibold text-foreground">{company.registre_commerce || 'non renseigné'}</code>
                {company.registre_commerce && (
                  <button
                    type="button"
                    onClick={() => copyRccm(company.registre_commerce as string)}
                    className="ml-auto inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {copied === company.registre_commerce ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === company.registre_commerce ? 'Copié' : 'Copier'}
                  </button>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-surface px-3 py-2">
                <FileText className={cn('h-4 w-4', company.document_rccm_disponible ? 'text-error' : 'text-muted')} />
                {company.document_rccm_disponible ? (
                  <>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {company.document_rccm_nom || 'certificat.pdf'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void openProtectedPdf(companyRccmDocumentEndpoint(company.id)).catch((err) =>
                          setError(errorMessage(err, 'Impossible d’ouvrir le certificat.')),
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Voir le certificat
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-error">Aucun certificat PDF fourni : ne pas valider en l’état.</span>
                )}
              </div>

              {company.statut_verification === 'REJECTED' && company.motif_rejet && (
                <p className="mt-2 text-xs text-error">Motif : {company.motif_rejet}</p>
              )}
              {company.verifie_le && company.statut_verification !== 'PENDING' && (
                <p className="mt-2 text-xs text-muted">Décision le {formatDate(company.verifie_le)}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {company.statut_verification !== 'APPROVED' && (
                  <Button size="sm" onClick={() => setAction({ type: 'approve', company })}>
                    <Check className="h-4 w-4" /> Valider
                  </Button>
                )}
                {company.statut_verification !== 'REJECTED' && (
                  <Button size="sm" variant="outline" className="text-error hover:border-error/40 hover:text-error" onClick={() => setAction({ type: 'reject', company })}>
                    <X className="h-4 w-4" /> {company.statut_verification === 'APPROVED' ? 'Révoquer' : 'Rejeter'}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        isOpen={action !== null}
        onClose={() => {
          setAction(null)
          setMotif('')
        }}
        onConfirm={() => {
          if (action?.type === 'reject' && motif.trim().length < 5) return
          void confirm()
        }}
        title={action?.type === 'approve' ? 'Valider cette entreprise ?' : 'Rejeter cette entreprise ?'}
        description={
          action?.type === 'approve'
            ? `« ${action.company.nom_entreprise} » (RCCM ${action.company.registre_commerce ?? '—'}) pourra publier des offres et consulter les candidatures.`
            : 'Le motif sera communiqué à l’entreprise, qui pourra corriger ses informations.'
        }
        confirmLabel={action?.type === 'approve' ? 'Valider' : 'Rejeter'}
        variant={action?.type === 'reject' ? 'danger' : 'default'}
        isLoading={isSubmitting}
      >
        {action?.type === 'reject' && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Motif du rejet (obligatoire)</span>
            <Textarea
              rows={3}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex. : RCCM introuvable au registre, raison sociale différente…"
              hasError={motif.length > 0 && motif.trim().length < 5}
            />
          </label>
        )}
      </Dialog>
    </Card>
  )
}
