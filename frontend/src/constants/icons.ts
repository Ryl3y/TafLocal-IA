/**
 * Centralized Lucide icon mappings for navigation and features.
 * TODO: Extend as new features are implemented.
 */
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  MessageSquare,
  User,
  Bell,
  Settings,
  Building2,
  Shield,
  LogIn,
  Home,
} from 'lucide-react'

export const NAV_ICONS = {
  home: Home,
  dashboard: LayoutDashboard,
  cvAnalysis: FileText,
  jobs: Briefcase,
  interview: MessageSquare,
  profile: User,
  notifications: Bell,
  settings: Settings,
  company: Building2,
  admin: Shield,
  auth: LogIn,
} as const

export type NavIconKey = keyof typeof NAV_ICONS
