import React from 'react'
import { FileText, UserCircle2, Save, UploadCloud, Trash2, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { PageShell } from '../../../components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/cards/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import { useAuth } from '../../../context/AuthContext'
import {
  getCandidateProfile,
  getCompanyProfile,
  updateCandidateProfile,
  updateCompanyProfile,
  updateMe,
  getMe
} from '../../../services/api/profileServices'
import { getMyCVs, uploadCV, deleteCV, type CV } from '../../../services/api/cvServices'
import { API_BASE_URL } from '../../../services/api/apiClient'
import { Loader } from '../../../components/feedback/Loader'

export function ProfilePage() {
  const { user, refreshSession } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingCVs, setLoadingCVs] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [userData, setUserData] = useState({
    first_name: user?.firstName || '',
    last_name: user?.lastName || '',
    phone: ''
  })

  const [candidateProfile, setCandidateProfile] = useState({
    date_of_birth: '',
    location: '',
    bio: '',
    experience_years: 0,
    current_salary: null,
    expected_salary: null,
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    skills: []
  })

  const [companyProfile, setCompanyProfile] = useState({
    company_name: '',
    industry: '',
    description: '',
    website: '',
    location: '',
    phone: '',
    logo: ''
  })

  const [cvs, setCvs] = useState<CV[]>([])

  useEffect(() => {
    async function loadProfile() {
      try {
        const me = await getMe()
        setUserData({
          first_name: me.first_name || user?.firstName || '',
          last_name: me.last_name || user?.lastName || '',
          phone: me.phone || ''
        })

        if (user?.role === 'candidate') {
          const profile = await getCandidateProfile()
          setCandidateProfile({
            date_of_birth: profile.date_of_birth || '',
            location: profile.location || '',
            bio: profile.bio || '',
            experience_years: profile.experience_years || 0,
            current_salary: profile.current_salary || null,
            expected_salary: profile.expected_salary || null,
            linkedin_url: profile.linkedin_url || '',
            github_url: profile.github_url || '',
            portfolio_url: profile.portfolio_url || '',
            skills: profile.skills || []
          })
          await loadCVs()
        } else if (user?.role === 'company') {
          const profile = await getCompanyProfile()
          setCompanyProfile({
            company_name: profile.company_name,
            industry: profile.industry || '',
            description: profile.description || '',
            website: profile.website || '',
            location: profile.location || '',
            phone: profile.phone || '',
            logo: profile.logo || ''
          })
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadProfile()
    }
  }, [user])

  const loadCVs = async () => {
    setLoadingCVs(true)
    try {
      console.log("Chargement des CVs...")
      const cvList = await getMyCVs()
      console.log("CVs chargés:", cvList)
      setCvs(cvList)
    } catch (error) {
      console.error('Erreur chargement CVs:', error)
    } finally {
      setLoadingCVs(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateMe({
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone
      })

      if (user?.role === 'candidate') {
        await updateCandidateProfile(candidateProfile)
      } else if (user?.role === 'company') {
        await updateCompanyProfile(companyProfile)
      }

      // Mettre à jour la session pour que l'AuthContext ait les nouvelles données
      await refreshSession()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    } finally {
      setSaving(false)
    }
  }

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('Fichier sélectionné:', file)
      setUploading(true)
      try {
        console.log('Envoi du CV au backend...')
        const uploadedCV = await uploadCV(file)
        console.log('CV uploadé avec succès:', uploadedCV)
        await loadCVs()
      } catch (error) {
        console.error('Erreur upload CV:', error)
      } finally {
        setUploading(false)
        // Réinitialiser l'input pour pouvoir sélectionner le même fichier à nouveau
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

  const handleButtonClick = () => {
    console.log('Bouton cliqué, ouverture de l explorateur...')
    fileInputRef.current?.click()
  }

  const handleDeleteCV = async (id: number) => {
    try {
      await deleteCV(id)
      await loadCVs()
    } catch (error) {
      console.error('Erreur suppression CV:', error)
    }
  }

  if (loading) {
    return (
      <PageShell eyebrow="Profil" title="Votre identité professionnelle">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow="Profil"
      title="Votre identité professionnelle"
      description="Présentez un profil cohérent, clair et prêt à convertir."
      actions={
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Sauvegarde en cours...' : 'Sauvegarder'}
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-surface">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {(userData.first_name[0] || user?.firstName[0] || 'U').toUpperCase()}{(userData.last_name[0] || user?.lastName[0] || '').toUpperCase()}
              </div>
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={userData.first_name}
                    onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                    placeholder="Prénom"
                  />
                  <Input
                    value={userData.last_name}
                    onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                    placeholder="Nom"
                  />
                </div>
                <Input
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  placeholder="Téléphone"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.role === 'candidate' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={candidateProfile.location}
                    onChange={(e) => setCandidateProfile({ ...candidateProfile, location: e.target.value })}
                    placeholder="Ville"
                  />
                  <Input
                    type="date"
                    value={candidateProfile.date_of_birth}
                    onChange={(e) => setCandidateProfile({ ...candidateProfile, date_of_birth: e.target.value })}
                    placeholder="Date de naissance"
                  />
                </div>
                <Textarea
                  value={candidateProfile.bio}
                  onChange={(e) => setCandidateProfile({ ...candidateProfile, bio: e.target.value })}
                  placeholder="Bio"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    value={candidateProfile.linkedin_url}
                    onChange={(e) => setCandidateProfile({ ...candidateProfile, linkedin_url: e.target.value })}
                    placeholder="LinkedIn"
                  />
                  <Input
                    value={candidateProfile.github_url}
                    onChange={(e) => setCandidateProfile({ ...candidateProfile, github_url: e.target.value })}
                    placeholder="GitHub"
                  />
                  <Input
                    value={candidateProfile.portfolio_url}
                    onChange={(e) => setCandidateProfile({ ...candidateProfile, portfolio_url: e.target.value })}
                    placeholder="Portfolio"
                  />
                </div>
              </>
            )}
            {user?.role === 'company' && (
              <>
                <Input
                  value={companyProfile.company_name}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, company_name: e.target.value })}
                  placeholder="Nom de l'entreprise"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={companyProfile.industry}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, industry: e.target.value })}
                    placeholder="Secteur"
                  />
                  <Input
                    value={companyProfile.location}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, location: e.target.value })}
                    placeholder="Ville"
                  />
                </div>
                <Textarea
                  value={companyProfile.description}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, description: e.target.value })}
                  placeholder="Description"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={companyProfile.website}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, website: e.target.value })}
                    placeholder="Site web"
                  />
                  <Input
                    value={companyProfile.phone}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })}
                    placeholder="Téléphone"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {user?.role === 'candidate' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-secondary" />
                <CardTitle>Documents</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingCVs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader label="Chargement des CVs..." />
                </div>
              ) : cvs.length === 0 ? (
                <div className="rounded-xl border border-border bg-background p-6 text-center">
                  <UploadCloud className="h-12 w-12 mx-auto text-muted mb-4" />
                  <p className="font-semibold text-foreground mb-2">Ajoutez votre CV</p>
                  <p className="text-sm text-muted mb-4">Téléchargez votre CV pour commencer</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <Button
                    onClick={handleButtonClick}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Téléchargement en cours...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4 mr-2" />
                        Ajouter un CV
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cvs.map((cv) => (
                      <div key={cv.id} className="rounded-xl border border-border bg-background p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-secondary flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{cv.file_name}</p>
                            <p className="text-xs text-muted">
                              {new Date(cv.uploaded_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <a
                            href={cv.file.startsWith('http') ? cv.file : `${API_BASE_URL.replace('/api', '')}${cv.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-muted hover:text-foreground transition"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteCV(cv.id)}
                            className="p-2 text-muted hover:text-danger transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleButtonClick}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary-foreground mr-2"></div>
                        Téléchargement en cours...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4 mr-2" />
                        Ajouter un autre CV
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  )
}

export default ProfilePage
