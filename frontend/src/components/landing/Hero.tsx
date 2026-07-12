import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { Button } from '../ui/Button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Trouvez les opportunités qui correspondent réellement à vos compétences.
              </h1>
              <p className="text-lg text-muted sm:text-xl max-w-2xl">
                TafLocal AI analyse votre CV, identifie les offres les plus adaptées à votre profil et vous aide à réussir vos entretiens grâce à l'intelligence artificielle.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={ROUTES.AUTH}>
                <Button size="lg" className="w-full sm:w-auto">
                  Créer mon compte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Découvrir le fonctionnement
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <span>Plateforme 100 % gratuite</span>
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

          {/* Right Content - AI Workflow Visualization */}
          <div className="relative">
            <div className="relative space-y-4">
              {/* CV Card */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-64 bg-surface rounded-xl border border-border p-4 shadow-lg z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">CV</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Votre CV</p>
                    <p className="text-xs text-muted">Upload</p>
                  </div>
                </div>
              </div>

              {/* Arrow Down */}
              <div className="absolute left-1/2 top-20 -translate-x-1/2 flex flex-col items-center">
                <div className="h-12 w-0.5 bg-border"></div>
                <div className="h-4 w-4 rounded-full bg-primary"></div>
              </div>

              {/* AI Analysis Card */}
              <div className="absolute left-1/2 top-32 -translate-x-1/2 w-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20 p-4 shadow-lg z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-white font-semibold">AI</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Analyse IA</p>
                    <p className="text-xs text-muted">Traitement</p>
                  </div>
                </div>
              </div>

              {/* Arrow Down */}
              <div className="absolute left-1/2 top-52 -translate-x-1/2 flex flex-col items-center">
                <div className="h-12 w-0.5 bg-border"></div>
                <div className="h-4 w-4 rounded-full bg-secondary"></div>
              </div>

              {/* Matching Card */}
              <div className="absolute left-1/2 top-64 -translate-x-1/2 w-64 bg-surface rounded-xl border border-border p-4 shadow-lg z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <span className="text-secondary font-semibold">M</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Matching</p>
                    <p className="text-xs text-muted">Comparaison</p>
                  </div>
                </div>
              </div>

              {/* Arrow Down */}
              <div className="absolute left-1/2 top-84 -translate-x-1/2 flex flex-col items-center">
                <div className="h-12 w-0.5 bg-border"></div>
                <div className="h-4 w-4 rounded-full bg-accent"></div>
              </div>

              {/* Recommendations Card */}
              <div className="absolute left-1/2 top-96 -translate-x-1/2 w-64 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl border border-accent/20 p-4 shadow-lg z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                    <span className="text-white font-semibold">★</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Offres</p>
                    <p className="text-xs text-muted">Recommandées</p>
                  </div>
                </div>
              </div>

              {/* Arrow Down */}
              <div className="absolute left-1/2 top-[28rem] -translate-x-1/2 flex flex-col items-center">
                <div className="h-12 w-0.5 bg-border"></div>
                <div className="h-4 w-4 rounded-full bg-primary"></div>
              </div>

              {/* Interview Card */}
              <div className="absolute left-1/2 top-[32rem] -translate-x-1/2 w-64 bg-surface rounded-xl border border-border p-4 shadow-lg z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">🎤</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Entretien</p>
                    <p className="text-xs text-muted">Simulation</p>
                  </div>
                </div>
              </div>

              {/* Arrow Down */}
              <div className="absolute left-1/2 top-[36rem] -translate-x-1/2 flex flex-col items-center">
                <div className="h-12 w-0.5 bg-border"></div>
                <div className="h-4 w-4 rounded-full bg-secondary"></div>
              </div>

              {/* Success Card */}
              <div className="absolute left-1/2 top-[40rem] -translate-x-1/2 w-64 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-xl border border-secondary/20 p-4 shadow-lg z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <span className="text-white font-semibold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Emploi</p>
                    <p className="text-xs text-muted">Trouvé</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
