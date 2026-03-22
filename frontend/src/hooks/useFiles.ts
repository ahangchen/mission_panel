import { useState, useEffect, useCallback } from 'react'
import { filesAPI } from '../api/client'
import type { FileListResponse, FileContentResponse } from '../api/types'

// API returns items[], not files[]
interface FileListData {
  path: string
  items: Array<{
    name: string
    path: string
    is_directory: boolean
    size?: number
    modified_time?: number
  }>
}

export function useFiles(path: string = '') {
  const [data, setData] = useState<FileListData | null>(null)
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

export function useFileContent(filePath: string | null) {
  const [data, setData] = useState<FileContentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!filePath) {
      setData(null)
      return
    }

    setLoading(true)
    setError(null)
    filesAPI.readFile(filePath)
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Unknown error')))
      .finally(() => setLoading(false))
  }, [filePath])

  return { data, loading, error }
}

// Alias for compatibility
export const useFileList = useFiles
