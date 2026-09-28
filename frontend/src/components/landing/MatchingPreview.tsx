import { BriefcaseBusiness, MapPin, Wallet, Wrench } from 'lucide-react'

const criteria = [
  {
    icon: Wrench,
    title: 'Compétences',
    description: 'Vos compétences sont comparées à celles exigées par chaque offre : présentes, manquantes, à renforcer.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Expérience',
    description: 'Votre parcours est confronté au niveau d’expérience attendu pour le poste.',
  },
  {
    icon: MapPin,
    title: 'Localisation',
    description: 'Les offres proches de chez vous ou compatibles avec le télétravail remontent en priorité.',
  },
  {
    icon: Wallet,
    title: 'Préférences',
    description: 'Type de contrat et attentes salariales affinent le classement des offres.',
  },
]

export function MatchingPreview() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Matching intelligent
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Découvrez les offres qui correspondent le mieux à votre profil avec notre algorithme de matching IA.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {criteria.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-xl border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
