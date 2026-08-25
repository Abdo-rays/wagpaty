import { useState, useEffect, useCallback } from 'react'

export function useFetch<T>(fetcher: () => Promise<{ data: any }>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetcher()
      setData(res.data?.data ?? res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}
