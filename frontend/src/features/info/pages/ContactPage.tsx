import { Building2, Mail, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import { InfoPageLayout, InfoSection } from '../components/InfoPageLayout'

/** Adresse de contact publique, définie au build (VITE_CONTACT_EMAIL). */
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL?.trim() || ''

export function ContactPage() {
  return (
    <InfoPageLayout
      eyebrow="Contact"
      title="Nous contacter"
      intro="Une question, un problème avec votre compte ou une demande concernant vos données ? Écrivez-nous, nous vous répondrons dans les meilleurs délais."
    >
      <div className="rounded-2xl border border-primary/20 bg-primary-light/40 p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface text-primary">
            <Mail className="h-6 w-6" />
          </span>
          <div>
            <p className="font-semibold text-foreground">Par email</p>
            {CONTACT_EMAIL ? (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-1 inline-block text-lg font-medium text-primary hover:text-primary-hover"
              >
                {CONTACT_EMAIL}
              </a>
            ) : (
              <p className="mt-1 text-sm text-muted">L’adresse de contact sera bientôt disponible.</p>
            )}
            <p className="mt-2 text-sm text-muted">
              Précisez l’email de votre compte et, si possible, une capture d’écran du problème.
            </p>
          </div>
        </div>
      </div>

      <InfoSection title="Selon votre demande">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <UserRound className="h-6 w-6 text-primary" />
            <p className="mt-3 font-semibold text-foreground">Candidats</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Mot de passe oublié ? Utilisez d’abord la{' '}
              <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-primary hover:text-primary-hover">
                réinitialisation du mot de passe
              </Link>
              . Pour une question sur une candidature, contactez directement l’entreprise concernée.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <Building2 className="h-6 w-6 text-primary" />
            <p className="mt-3 font-semibold text-foreground">Entreprises</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Vérification de votre entreprise, publication d’offres ou signalement d’un abus : indiquez le nom de
              l’entreprise et, le cas échéant, l’offre concernée.
            </p>
          </div>
        </div>
      </InfoSection>

      <InfoSection title="Vos données personnelles">
        <p>
          Pour obtenir une copie de vos données ou demander la suppression de votre compte, écrivez-nous depuis
          l’adresse email de votre compte. Le détail de nos pratiques figure dans la{' '}
          <Link to={ROUTES.PRIVACY} className="font-medium text-primary hover:text-primary-hover">
            politique de confidentialité
          </Link>
          .
        </p>
      </InfoSection>
    </InfoPageLayout>
  )
}

export default ContactPage
