import { Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Marie Dupont',
    role: 'Développeuse Full Stack',
    company: 'TechStartup',
    content: "Grâce à TafLocal AI, j'ai trouvé mon emploi actuel en seulement 3 semaines. L'analyse de CV m'a permis d'identifier mes points forts et le matching m'a proposé des offres parfaitement adaptées.",
  },
  {
    name: 'Jean Martin',
    role: 'Data Scientist',
    company: 'DataCorp',
    content: "Le simulateur d'entretien est incroyable ! Les feedbacks m'ont aidé à me préparer efficacement et j'ai décroché l'offre de mes rêves. Je recommande vivement cette plateforme.",
  },
  {
    name: 'Sophie Laurent',
    role: 'Product Manager',
    company: 'InnovateTech',
    content: "TafLocal AI a transformé ma recherche d'emploi. Les recommandations personnalisées et la préparation d'entretien m'ont donné un avantage compétitif certain.",
  },
]

export function Testimonials() {
  return (
    <section className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Ce que disent nos utilisateurs
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Des histoires de succès de professionnels qui ont trouvé leur emploi idéal avec TafLocal AI.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              <p className="text-foreground mb-6">{testimonial.content}</p>
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted">{testimonial.role} chez {testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
