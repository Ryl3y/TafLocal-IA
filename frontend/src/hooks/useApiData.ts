import { useCallback, useEffect, useState, type DependencyList } from 'react'
import { errorMessage } from '../services/api/apiClient'

interface ApiDataState<T> {
  data: T | undefined
  error: string | null
  /** Clé de la requête dont proviennent `data` / `error`. */
  key: string | null
}

/**
 * Charge des données depuis l'API et expose l'état (chargement, erreur).
 *
 * - l'état n'est modifié que dans les callbacks de la promesse (jamais de
 *   manière synchrone dans l'effet) ;
 * - `isLoading` est vrai tant que la réponse de la requête courante
 *   (dépendances + rechargements) n'est pas arrivée ;
 * - les réponses d'une requête obsolète sont ignorées.
 *
 * Les dépendances doivent être des valeurs simples (chaînes, nombres...).
 */
export function useApiData<T>(fetcher: () => Promise<T>, deps: DependencyList, fallbackError = 'Une erreur est survenue.') {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<ApiDataState<T>>({ data: undefined, error: null, key: null })
  const key = JSON.stringify([...deps, version])

  useEffect(() => {
    let active = true
    fetcher().then(
      (data) => active && setState({ data, error: null, key }),
      (error: unknown) => active && setState((prev) => ({ ...prev, error: errorMessage(error, fallbackError), key })),
    )
    return () => {
      active = false
    }
    // La clé résume les dépendances ; le fetcher est recréé à chaque rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  /** Relancer la requête. */
  const reload = useCallback(() => setVersion((v) => v + 1), [])

  /** Modifier localement les données (mise à jour optimiste). */
  const setData = useCallback((updater: (previous: T | undefined) => T | undefined) => {
    setState((prev) => ({ ...prev, data: updater(prev.data) }))
  }, [])

  return { data: state.data, error: state.error, isLoading: state.key !== key, reload, setData }
}
