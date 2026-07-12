import { BrainCircuit, Target, MessageSquare, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: BrainCircuit,
    title: 'Analyse du CV',
    description: 'Notre IA analyse votre CV en profondeur pour identifier vos compétences, expériences et points forts, avec des recommandations personnalisées.',
  },
  {
    icon: Target,
    title: 'Matching IA',
    description: 'Algorithme de matching intelligent qui connecte votre profil aux offres les plus pertinentes basées sur vos compétences et préférences.',
  },
  {
    icon: MessageSquare,
    title: 'Préparation entretien',
    description: 'Simulateur d\'entretien avec IA qui vous pose des questions pertinentes et vous fournit un feedback détaillé pour vous améliorer.',
  },
  {
    icon: TrendingUp,
    title: 'Feedback personnalisé',
    description: 'Recommandations sur-mesure pour améliorer votre profil, vos compétences et vos chances de réussite dans vos candidatures.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Fonctionnalités puissantes
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour booster votre carrière, propulsé par l'intelligence artificielle.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
