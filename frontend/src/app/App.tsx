import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './providers'
import { AppRouter } from './router'

/**
 * Root application component.
 * Composes providers and routing.
 */
export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProvider>
  )
}
