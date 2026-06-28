import { useCallback, useEffect, useState } from 'react'

function readRoute(): string {
  return window.location.hash.replace(/^#/, '') || '/'
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const handler = () => setRoute(readRoute())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const navigate = useCallback((to: string) => {
    window.location.hash = to === '/' ? '' : to
  }, [])

  return { route, navigate }
}
