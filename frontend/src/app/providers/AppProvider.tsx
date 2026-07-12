import { type ReactNode } from 'react'
import { AuthProvider } from '../../context'
import { NotificationProvider } from './NotificationProvider'
import { QueryProvider } from './QueryProvider'
import { ThemeProvider } from './ThemeProvider'

interface AppProviderProps {
  children: ReactNode
}

/**
 * AppProvider — Composes all global providers in the correct order.
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
