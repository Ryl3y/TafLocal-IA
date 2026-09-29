import { ArrowRight } from 'lucide-react'

const steps = [
  {
    number: 1,
    title: 'Créer un compte',
    description: 'Inscription simple et rapide.',
  },
  {
    number: 2,
    title: 'Déposer son CV',
    description: 'Upload de votre CV pour analyse par notre IA.',
  },
  {
    number: 3,
    title: 'Analyse IA',
    description: 'Extraction automatique de vos compétences et expériences.',
  },
  {
    number: 4,
    title: 'Recevoir des offres',
    description: 'Recommandations personnalisées basées sur votre profil.',
  },
  {
    number: 5,
    title: 'Postuler',
    description: 'Candidature en un clic aux offres qui vous correspondent.',
  },
  {
    number: 6,
    title: 'Préparer son entretien',
    description: 'Simulation d\'entretien avec feedback personnalisé.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 lg:py-32 bg-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Comment ça marche
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Un processus simple et efficace pour trouver l'emploi de vos rêves.
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block"></div>

          <div className="space-y-8 md:space-y-0">
            {steps.map((step, index) => (
              <div key={index} className="relative md:pl-20">
                {/* Timeline Dot */}
                <div className="absolute left-4 top-0 h-8 w-8 rounded-full bg-primary border-4 border-surface flex items-center justify-center md:left-6 z-10">
                  <span className="text-sm font-bold text-white">{step.number}</span>
                </div>

                <div className="rounded-xl border border-border bg-background p-6 pt-8 shadow-sm md:pt-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted">{step.description}</p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex justify-center mt-4">
                    <ArrowRight className="h-6 w-6 text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
