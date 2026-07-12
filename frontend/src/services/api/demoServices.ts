/**
 * Demo API placeholders for presentation-ready UI flows.
 * TODO: replace these async helpers with real backend endpoints once the API is available.
 */

export interface JobSummary {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  match: number
  summary: string
  tags: string[]
}

export interface NotificationItem {
  title: string
  description: string
  time: string
  unread: boolean
}

export interface AnalysisHistoryItem {
  id: string
  name: string
  date: string
  status: string
}

const wait = (ms = 650) => new Promise((resolve) => window.setTimeout(resolve, ms))

export const mockJobs: JobSummary[] = [
  {
    id: 'job-1',
    title: 'Product Analyst',
    company: 'Northstar Labs',
    location: 'Paris, France',
    type: 'CDI',
    salary: '58k€ – 66k€',
    match: 92,
    summary: 'Vous rejoindrez une équipe produit en forte croissance pour structurer les décisions business.',
    tags: ['Produit', 'Analyse', 'SQL'],
  },
  {
    id: 'job-2',
    title: 'Junior Data Analyst',
    company: 'MediLoop',
    location: 'Lyon, France',
    type: 'CDD',
    salary: '44k€ – 50k€',
    match: 88,
    summary: 'Mission centrée sur l’analyse de données opérationnelles et la qualité des reporting.',
    tags: ['Data', 'BI', 'Excel'],
  },
  {
    id: 'job-3',
    title: 'Business Analyst',
    company: 'Axiom Consulting',
    location: 'Télétravail',
    type: 'Freelance',
    salary: '500€ – 650€/jour',
    match: 84,
    summary: 'Un poste à forte valeur ajoutée pour accompagner une transformation commerciale.',
    tags: ['Transformation', 'Business', 'Stakeholder'],
  },
]

export const mockNotifications: NotificationItem[] = [
  { title: 'Nouvelle offre correspondante', description: 'Product Analyst · Paris', time: 'Il y a 12 min', unread: true },
  { title: 'Analyse CV prête', description: 'Votre rapport IA est disponible', time: 'Aujourd’hui · 09:30', unread: false },
  { title: 'Rappel entretien', description: 'Votre session de préparation est à venir', time: 'Hier · 18:40', unread: true },
]

export const mockAnalysisHistory: AnalysisHistoryItem[] = [
  { id: 'a1', name: 'CV_2025_final.pdf', date: '12 juin 2026', status: 'Complet' },
  { id: 'a2', name: 'CV_consulting.docx', date: '02 juin 2026', status: 'À améliorer' },
]

export async function getRecommendedJobs(): Promise<JobSummary[]> {
  await wait(700)
  return mockJobs
}

export async function getNotifications(): Promise<NotificationItem[]> {
  await wait(500)
  return mockNotifications
}

export async function getAnalysisHistory(): Promise<AnalysisHistoryItem[]> {
  await wait(450)
  return mockAnalysisHistory
}
