import { X, Check } from 'lucide-react'

const traditionalFeatures = [
  'Publication d\'offres',
  'Recherche basique',
  'Filtrage par critères',
  'Alertes email',
]

const taflocalFeatures = [
  'Publication d\'offres',
  'Recherche basique',
  'Filtrage par critères',
  'Alertes email',
  'Analyse IA du CV',
  'Matching intelligent',
  'Simulation d\'entretien',
  'Feedback personnalisé',
  'Recommandations de compétences',
  'Suivi de progression',
]

export function Comparison() {
  return (
    <section className="py-20 sm:py-32 bg-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Pourquoi TafLocal AI ?
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Comparez notre approche IA avec les plateformes traditionnelles.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional Platforms */}
            <div className="rounded-xl border border-border bg-background p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">Plateformes traditionnelles</h3>
              <div className="space-y-4">
                {traditionalFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-muted" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-muted">
                    <X className="h-5 w-5" />
                    <span>Analyse de CV</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted mt-2">
                    <X className="h-5 w-5" />
                    <span>Matching IA</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted mt-2">
                    <X className="h-5 w-5" />
                    <span>Préparation entretien</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted mt-2">
                    <X className="h-5 w-5" />
                    <span>Feedback personnalisé</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TafLocal AI */}
            <div className="rounded-xl border-2 border-primary bg-gradient-to-br from-primary/5 to-secondary/5 p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-primary text-white text-sm font-semibold">
                  Recommandé
                </span>
                <h3 className="text-2xl font-bold text-foreground">TafLocal AI</h3>
              </div>
              <div className="space-y-4">
                {taflocalFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-secondary" />
                    <span className="text-foreground font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
