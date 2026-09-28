import { Header } from '../../components/landing/Header'
import { Hero } from '../../components/landing/Hero'
import { Features } from '../../components/landing/Features'
import { HowItWorks } from '../../components/landing/HowItWorks'
import { CVAnalysisPreview } from '../../components/landing/CVAnalysisPreview'
import { MatchingPreview } from '../../components/landing/MatchingPreview'
import { InterviewAI } from '../../components/landing/InterviewAI'
import { Comparison } from '../../components/landing/Comparison'
import { FAQ } from '../../components/landing/FAQ'
import { CTA } from '../../components/landing/CTA'
import { Footer } from '../../components/landing/Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <CVAnalysisPreview />
      <MatchingPreview />
      <InterviewAI />
      <Comparison />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}

export default LandingPage
