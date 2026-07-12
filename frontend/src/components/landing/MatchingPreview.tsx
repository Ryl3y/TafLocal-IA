import { Check, X, Building2, MapPin, DollarSign } from 'lucide-react'

const jobCards = [
  {
    company: 'TechCorp',
    title: 'Senior Full Stack Developer',
    location: 'Paris, France',
    salary: '60K€ - 80K€',
    score: 92,
    skills: [
      { name: 'Python', matched: true },
      { name: 'React', matched: true },
      { name: 'Docker', matched: true },
      { name: 'AWS', matched: false },
    ],
  },
  {
    company: 'InnovateLab',
    title: 'Frontend Developer',
    location: 'Lyon, France',
    salary: '45K€ - 60K€',
    score: 85,
    skills: [
      { name: 'React', matched: true },
      { name: 'TypeScript', matched: true },
      { name: 'Node.js', matched: true },
      { name: 'GraphQL', matched: false },
    ],
  },
  {
    company: 'DataDriven',
    title: 'Data Engineer',
    location: 'Remote',
    salary: '55K€ - 75K€',
    score: 78,
    skills: [
      { name: 'Python', matched: true },
      { name: 'SQL', matched: true },
      { name: 'Airflow', matched: false },
      { name: 'Kafka', matched: false },
    ],
  },
]

export function MatchingPreview() {
  return (
    <section className="py-20 sm:py-32 bg-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Matching intelligent
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Découvrez les offres qui correspondent le mieux à votre profil avec notre algorithme de matching IA.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobCards.map((job, index) => (
            <div key={index} className="rounded-xl border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">{job.company}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{job.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-muted">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salary}</span>
                  </div>
                </div>
              </div>

              {/* Compatibility Score */}
              <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Score de compatibilité</span>
                  <span className="text-2xl font-bold text-primary">{job.score}%</span>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Compétences</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                        skill.matched
                          ? 'bg-secondary/10 text-secondary border border-secondary/20'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}
                    >
                      {skill.matched ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {skill.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
