import { Mic, CheckCircle, AlertCircle } from 'lucide-react'

export function InterviewAI() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Simulation d'entretien IA
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Préparez-vous aux entretiens avec notre simulateur IA interactif qui vous fournit un feedback en temps réel.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-lg sm:p-8">
            {/* Question */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Mic className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Question de l'IA</h3>
              </div>
              <div className="p-4 rounded-lg bg-background border border-border">
                <p className="text-foreground">
                  "Parlez-moi d'un projet complexe sur lequel vous avez travaillé et comment vous avez géré les défis techniques rencontrés."
                </p>
              </div>
            </div>

            {/* User Response */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Votre réponse</h3>
              <div className="p-4 rounded-lg bg-background border border-border min-h-[100px]">
                <p className="text-muted italic">Rédigez votre réponse, l'IA l'évalue aussitôt.</p>
              </div>
            </div>

            {/* Feedback */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-2 bg-secondary/5 p-3 rounded-lg border border-secondary/20">
                <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Points forts</span> : ce qui rend votre réponse convaincante.
                </p>
              </div>
              <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Axes d'amélioration</span> : ce qu'il faut préciser ou mieux structurer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
