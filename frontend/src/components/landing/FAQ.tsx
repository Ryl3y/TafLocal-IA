import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    question: 'TafLocal AI est-il gratuit ?',
    answer: 'Oui, TafLocal AI est entièrement gratuit pour les candidats. Vous pouvez analyser votre CV, recevoir des recommandations d\'offres et préparer vos entretiens sans aucun coût.',
  },
  {
    question: 'Comment fonctionne l\'analyse de CV ?',
    answer: 'Notre IA analyse votre CV en extrayant vos compétences, expériences et formations. Elle identifie vos points forts et vous fournit des recommandations personnalisées pour améliorer votre profil.',
  },
  {
    question: 'Le matching est-il vraiment personnalisé ?',
    answer: 'Absolument. Notre algorithme de matching analyse votre profil et le compare aux offres disponibles en tenant compte de vos compétences, expérience, préférences de localisation et salariales.',
  },
  {
    question: 'Comment fonctionne la simulation d\'entretien ?',
    answer: 'Notre IA vous pose des questions pertinentes basées sur le poste visé. Elle évalue vos réponses en temps réel et vous fournit un feedback détaillé avec des points à améliorer.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Oui, nous prenons la sécurité de vos données très au sérieux. Vos informations sont chiffrées et ne sont jamais partagées avec des tiers sans votre consentement explicite.',
  },
  {
    question: 'Puis-je utiliser TafLocal AI si je suis une entreprise ?',
    answer: 'Oui, nous offrons des solutions pour les entreprises. Contactez-nous pour découvrir nos offres de recrutement intelligent.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-16 sm:py-24 lg:py-32 bg-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur TafLocal AI.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-background overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-background/50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-muted flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted flex-shrink-0 ml-4" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-muted">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
