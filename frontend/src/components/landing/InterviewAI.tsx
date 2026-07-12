import { Mic, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export function InterviewAI() {
  return (
    <section className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Simulation d'entretien IA
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Préparez-vous aux entretiens avec notre simulateur IA interactif qui vous fournit un feedback en temps réel.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-border bg-surface p-8 shadow-lg">
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

            {/* Timer */}
            <div className="mb-6 flex items-center gap-2 text-muted">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Temps de réponse : 2:30</span>
            </div>

            {/* User Response */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Votre réponse</h3>
              <div className="p-4 rounded-lg bg-background border border-border min-h-[100px]">
                <p className="text-muted italic">
                  "Dans mon dernier projet, j'ai développé une application de gestion de données en utilisant React et Python. Le principal défi était..."
                </p>
              </div>
            </div>

            {/* Score */}
            <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Score de réponse</span>
                <span className="text-2xl font-bold text-primary">8.5/10</span>
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Points forts</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 bg-secondary/5 p-3 rounded-lg border border-secondary/20">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">
                      Bonne structure de réponse avec contexte clair et exemples concrets.
                    </p>
                  </div>
                  <div className="flex items-start gap-2 bg-secondary/5 p-3 rounded-lg border border-secondary/20">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">
                      Utilisation pertinente de terminologie technique.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Axes d'amélioration</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">
                      Pourriez-vous quantifier l'impact de votre solution (ex: réduction de 30% du temps de traitement) ?
                    </p>
                  </div>
                  <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">
                      Développez davantage sur la résolution des conflits techniques avec l'équipe.
                    </p>
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
