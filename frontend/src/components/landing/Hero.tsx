import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { Button } from '../ui/Button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const workflow = [
  { title: 'Votre CV', subtitle: 'Dépôt', icon: 'CV', card: 'border-border bg-surface', badge: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  { title: 'Analyse IA', subtitle: 'Traitement', icon: 'AI', card: 'border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10', badge: 'bg-primary text-white', dot: 'bg-secondary' },
  { title: 'Matching', subtitle: 'Comparaison', icon: 'M', card: 'border-border bg-surface', badge: 'bg-secondary/10 text-secondary', dot: 'bg-accent' },
  { title: 'Offres', subtitle: 'Recommandées', icon: '★', card: 'border-accent/20 bg-gradient-to-br from-accent/10 to-primary/10', badge: 'bg-accent text-white', dot: 'bg-primary' },
  { title: 'Entretien', subtitle: 'Simulation', icon: '🎤', card: 'border-border bg-surface', badge: 'bg-primary/10 text-primary', dot: 'bg-secondary' },
  { title: 'Emploi', subtitle: 'Trouvé', icon: '✓', card: 'border-secondary/20 bg-gradient-to-br from-secondary/10 to-accent/10', badge: 'bg-secondary text-white', dot: 'bg-primary' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Trouvez les opportunités qui correspondent réellement à vos compétences.
              </h1>
              <p className="text-lg text-muted sm:text-xl max-w-2xl">
                TafLocal AI analyse votre CV, identifie les offres les plus adaptées à votre profil et vous aide à réussir vos entretiens grâce à l'intelligence artificielle.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={ROUTES.REGISTER}>
                <Button size="lg" className="w-full sm:w-auto">
                  Créer mon compte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Découvrir le fonctionnement
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <span>Plateforme gratuite</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <span>Analyse intelligente du CV</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <span>Matching personnalisé</span>
              </div>
            </div>
          </div>

          {/* Right Content - AI Workflow Visualization (desktop uniquement) */}
          <ol className="mx-auto hidden w-full max-w-xs lg:block" aria-label="Parcours TafLocal AI">
            {workflow.map((step, index) => (
              <li key={step.title} className="flex flex-col items-center">
                <div className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${step.card}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-semibold ${step.badge}`}>
                    {step.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="text-xs text-muted">{step.subtitle}</p>
                  </div>
                </div>
                {index < workflow.length - 1 && (
                  <div className="flex flex-col items-center" aria-hidden>
                    <div className="h-3 w-0.5 bg-border" />
                    <div className={`h-3 w-3 rounded-full ${step.dot}`} />
                    <div className="h-3 w-0.5 bg-border" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
