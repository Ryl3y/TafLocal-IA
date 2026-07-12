import { CheckCircle2, SendHorizonal } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { FormField, FormGroup } from '../../../components/forms/FormField'
import { Dialog } from '../../../components/ui/Dialog'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { ROUTES } from '../../../constants/routes'

export function ApplyPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <PageShell
      eyebrow="Candidature"
      title="Postuler à l’offre"
      description="Préparez votre candidature et envoyez-la en quelques secondes."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Résumé de la candidature</CardTitle>
            <CardDescription>Product Analyst · Northstar Labs · Paris</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <p>Votre candidature sera envoyée à l’équipe recrutement de Northstar Labs avec votre CV actuel et une lettre de motivation adaptée.</p>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="font-semibold text-foreground">À préparer</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Votre motivation pour la mission</li>
                <li>Votre expérience autour du produit et de l’analyse</li>
                <li>Votre disponibilité</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader>
            <CardTitle>Envoyer votre candidature</CardTitle>
            <CardDescription>Un formulaire simple, rapide et prêt pour l’intégration API.</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4 rounded-xl border border-secondary/20 bg-secondary-light/40 p-4 text-sm text-foreground">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  Candidature envoyée avec succès.
                </div>
                <p className="text-muted">Vous recevrez un email de confirmation sous peu.</p>
                <Link to={ROUTES.DASHBOARD}>
                  <Button variant="outline">Retour au tableau de bord</Button>
                </Link>
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
                  <FormField label="Nom complet" htmlFor="apply-name">
                    <Input id="apply-name" placeholder="Camille Martin" />
                  </FormField>
                  <FormField label="Email" htmlFor="apply-email">
                    <Input id="apply-email" type="email" placeholder="vous@exemple.com" />
                  </FormField>
                  <FormField label="Lettre de motivation" htmlFor="apply-message">
                    <textarea
                      id="apply-message"
                      rows={6}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground shadow-sm"
                      placeholder="Expliquez pourquoi cette mission vous correspond."
                    />
                  </FormField>
                  <FormField label="CV" htmlFor="apply-cv">
                    <Input id="apply-cv" type="file" />
                  </FormField>
                </FormGroup>
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
        onConfirm={() => {
          setIsSubmitting(true)
          window.setTimeout(() => {
            setIsSubmitting(false)
            setSubmitted(true)
            setIsConfirmOpen(false)
          }, 800)
        }}
        title="Confirmer votre candidature"
        description="Votre dossier sera transmis à l’équipe de recrutement avec votre CV et votre message."
        confirmLabel="Envoyer"
        cancelLabel="Modifier"
        isLoading={isSubmitting}
      >
        <p className="text-sm text-muted">Cette action simule l’envoi de votre candidature dans l’interface de démonstration.</p>
      </Dialog>
    </PageShell>
  )
}

export default ApplyPage
