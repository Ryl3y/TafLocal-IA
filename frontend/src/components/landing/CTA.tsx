import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { Button } from '../ui/Button'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-br from-primary to-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Prêt à donner un nouvel élan à votre carrière ?
          </h2>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
            Rejoignez des milliers de professionnels qui ont trouvé leur emploi idéal avec TafLocal AI.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.AUTH}>
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
                Créer un compte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to={ROUTES.AUTH}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                Connexion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
