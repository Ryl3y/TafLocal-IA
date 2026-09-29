import { Check, X, TrendingUp } from 'lucide-react'

export function CVAnalysisPreview() {
  const skills = [
    { name: 'Compétence détectée dans votre CV', status: 'matched' },
    { name: 'Compétence demandée par les offres', status: 'missing' },
  ]

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Analyse de CV en temps réel
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Découvrez comment notre IA analyse votre CV et vous fournit des recommandations personnalisées.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-lg sm:p-8">
            {/* Score Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">Score d'employabilité</h3>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  <span className="text-3xl font-bold text-primary">—</span>
                </div>
              </div>
              <div className="h-3 bg-border rounded-full overflow-hidden" />
              <p className="mt-2 text-sm text-muted">Calculé dès que vous déposez votre CV.</p>
            </div>

            {/* Skills Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Compétences</h3>
              <div className="space-y-3">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                    <div className="flex items-center gap-3">
                      {skill.status === 'matched' ? (
                        <Check className="h-5 w-5 text-secondary" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium text-foreground">{skill.name}</span>
                    </div>
                    <span className={`text-sm ${skill.status === 'matched' ? 'text-secondary' : 'text-red-500'}`}>
                      {skill.status === 'matched' ? 'Présent' : 'Manquant'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations Section */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Recommandations</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">💡 Conseil :</span> les compétences manquantes les plus demandées vous sont signalées en priorité.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">🎯 Action :</span> des pistes concrètes pour renforcer votre CV et votre profil.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
