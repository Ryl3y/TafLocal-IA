export function Statistics() {
  const stats = [
    { value: '15,000+', label: 'CV analysés' },
    { value: '8,500+', label: 'Offres disponibles' },
    { value: '50,000+', label: 'Compatibilités calculées' },
    { value: '12,000+', label: 'Entretiens simulés' },
  ]

  return (
    <section className="border-y border-border bg-surface py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl font-bold text-primary sm:text-5xl">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
