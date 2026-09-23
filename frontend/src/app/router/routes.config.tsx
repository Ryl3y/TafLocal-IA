/* eslint-disable react-refresh/only-export-components -- fichier de configuration des routes (pas de HMR requis) */
import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { ROLES, ROUTES } from '../../constants'
import { useAuth } from '../../context'
import { AuthGuard, RoleGuard } from '../guards'
import {
  AdminLayout,
  AuthLayout,
  CompanyLayout,
  DashboardLayout,
  EmptyLayout,
  MainLayout,
} from '../layouts'

// Lazy-loaded page components
const LandingPage = lazy(() => import('../../features/landing/LandingPage'))
const AuthPage = lazy(() => import('../../features/auth/pages/AuthPage'))
const DashboardPage = lazy(() => import('../../features/dashboard/pages/DashboardPage'))
const CVAnalysisPage = lazy(() => import('../../features/cv-analysis/pages/CVAnalysisPage'))
const AnalysisResultPage = lazy(() => import('../../features/cv-analysis/pages/AnalysisResultPage'))
const JobsListPage = lazy(() => import('../../features/jobs/pages/JobsListPage'))
const RecommendedJobsPage = lazy(() => import('../../features/jobs/pages/RecommendedJobsPage'))
const JobDetailsPage = lazy(() => import('../../features/jobs/pages/JobDetailsPage'))
const ApplyPage = lazy(() => import('../../features/applications/pages/ApplyPage'))
const MyApplicationsPage = lazy(() => import('../../features/applications/pages/MyApplicationsPage'))
const InterviewPage = lazy(() => import('../../features/interview/pages/InterviewPage'))
const InterviewFeedbackPage = lazy(() => import('../../features/interview/pages/InterviewFeedbackPage'))
const ProfilePage = lazy(() => import('../../features/profile/pages/ProfilePage'))
const NotificationsPage = lazy(() => import('../../features/notifications/pages/NotificationsPage'))
const SettingsPage = lazy(() => import('../../features/settings/pages/SettingsPage'))
const CompanyDashboardPage = lazy(() => import('../../features/company/pages/CompanyDashboardPage'))
const JobManagementPage = lazy(() => import('../../features/company/pages/JobManagementPage'))
const JobFormPage = lazy(() => import('../../features/company/pages/JobFormPage'))
const CompanyApplicationsPage = lazy(() => import('../../features/company/pages/CompanyApplicationsPage'))
const CompanyProfilePage = lazy(() => import('../../features/company/pages/CompanyProfilePage'))
const AdminDashboardPage = lazy(() => import('../../features/admin/pages/AdminDashboardPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

/** Wraps lazy routes with a loading fallback */
function withSuspense(element: ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-muted">
          Chargement…
        </div>
      }
    >
      {element}
    </Suspense>
  )
}

function SplashRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <LandingPage />
}

/**
 * Centralized route configuration grouped by layout.
 */
export const appRoutes: RouteObject[] = [
  // Public — Main layout
  {
    element: <MainLayout />,
    children: [
      {
        path: ROUTES.SPLASH,
        element: withSuspense(<SplashRoute />),
      },
    ],
  },

  // Auth layout
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <Navigate to={ROUTES.AUTH} replace />,
      },
      {
        path: ROUTES.AUTH,
        element: withSuspense(<AuthPage />),
      },
    ],
  },

  // Candidate — Dashboard layout (protected)
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard allowedRoles={[ROLES.CANDIDATE]} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
      {
        path: ROUTES.CANDIDATE_ROOT,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: ROUTES.DASHBOARD,
        element: withSuspense(<DashboardPage />),
      },
      {
        path: ROUTES.CV_ROOT,
        element: <Navigate to={ROUTES.CV_ANALYSIS} replace />,
      },
      {
        path: ROUTES.CV_ANALYSIS,
        element: withSuspense(<CVAnalysisPage />),
      },
      {
        path: ROUTES.CV_ANALYSIS_RESULT,
        element: withSuspense(<AnalysisResultPage />),
      },
      {
        path: ROUTES.JOBS_ROOT,
        element: <Navigate to={ROUTES.JOBS_LIST} replace />,
      },
      {
        path: ROUTES.JOBS_LIST,
        element: withSuspense(<JobsListPage />),
      },
      {
        path: ROUTES.RECOMMENDED_JOBS,
        element: withSuspense(<RecommendedJobsPage />),
      },
      {
        path: ROUTES.JOB_DETAILS,
        element: withSuspense(<JobDetailsPage />),
      },
      {
        path: ROUTES.APPLY,
        element: withSuspense(<ApplyPage />),
      },
      {
        path: ROUTES.MY_APPLICATIONS,
        element: withSuspense(<MyApplicationsPage />),
      },
      {
        path: ROUTES.INTERVIEW_ROOT,
        element: <Navigate to={ROUTES.INTERVIEW.replace(':sessionId', 'new')} replace />,
      },
      {
        path: ROUTES.INTERVIEW,
        element: withSuspense(<InterviewPage />),
      },
      {
        path: ROUTES.INTERVIEW_FEEDBACK,
        element: withSuspense(<InterviewFeedbackPage />),
      },
      {
        path: ROUTES.PROFILE,
        element: withSuspense(<ProfilePage />),
      },
      {
        path: ROUTES.NOTIFICATIONS,
        element: withSuspense(<NotificationsPage />),
      },
      {
        path: ROUTES.SETTINGS,
        element: withSuspense(<SettingsPage />),
      },
            ],
          },
        ],
      },
    ],
  },

  // Company layout (protected)
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard allowedRoles={[ROLES.COMPANY]} />,
        children: [
          {
            element: <CompanyLayout />,
            children: [
              {
                path: ROUTES.COMPANY_ROOT,
                element: <Navigate to={ROUTES.COMPANY_DASHBOARD} replace />,
              },
              {
                path: ROUTES.COMPANY_DASHBOARD,
                element: withSuspense(<CompanyDashboardPage />),
              },
              {
                path: ROUTES.COMPANY_JOBS,
                element: withSuspense(<JobManagementPage />),
              },
              {
                path: ROUTES.COMPANY_JOB_CREATE,
                element: withSuspense(<JobFormPage />),
              },
              {
                path: ROUTES.COMPANY_JOB_EDIT,
                element: withSuspense(<JobFormPage />),
              },
              {
                path: ROUTES.COMPANY_APPLICATIONS,
                element: withSuspense(<CompanyApplicationsPage />),
              },
              {
                path: ROUTES.COMPANY_PROFILE,
                element: withSuspense(<CompanyProfilePage />),
              },
            ],
          },
        ],
      },
    ],
  },

  // Admin layout (protected)
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard allowedRoles={[ROLES.ADMIN]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: ROUTES.ADMIN_ROOT,
                element: <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />,
              },
              {
                path: ROUTES.ADMIN_DASHBOARD,
                element: withSuspense(<AdminDashboardPage />),
              },
            ],
          },
        ],
      },
    ],
  },

  // 404 — Empty layout
  {
    element: <EmptyLayout />,
    children: [
      {
        path: ROUTES.NOT_FOUND,
        element: withSuspense(<NotFoundPage />),
      },
    ],
  },
]
