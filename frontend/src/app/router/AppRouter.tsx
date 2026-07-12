import { useRoutes } from 'react-router-dom'
import { appRoutes } from './routes.config'

/**
 * AppRouter — Renders the application route tree.
 */
export function AppRouter() {
  return useRoutes(appRoutes)
}
