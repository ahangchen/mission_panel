import { useState, useEffect, useCallback } from 'react'
import { filesAPI } from '../api/client'
import type { FileListResponse, FileContentResponse, SearchResponse } from '../api/types'

export function useFileList(path: string = '') {
  const [data, setData] = useState<FileListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await filesAPI.listDirectory(path)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  return { data, loading, error, refetch: fetchFiles }
}

export function useFileContent(path: string | null) {
  const [data, setData] = useState<FileContentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!path) {
      setData(null)
      return
    }

    setLoading(true)
    setError(null)
    filesAPI.readFile(path)
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Unknown error')))
      .finally(() => setLoading(false))
  }, [path])

  return { data, loading, error }
}

export function useFileSearch(query: string) {
  const [data, setData] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setData(null)
      return
    }

    setLoading(true)
    setError(null)
    filesAPI.searchFiles(query)
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Unknown error')))
      .finally(() => setLoading(false))
  }, [query])

  return { data, loading, error }
}
