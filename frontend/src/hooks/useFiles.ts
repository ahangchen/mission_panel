import { useState, useEffect, useCallback } from 'react'
import { filesAPI } from '../api/client'

// API returns items[], not files[]
interface FileListDataInternal {
  path: string
  items: Array<{
    name: string
    path: string
    is_directory: boolean
    size?: number
    modified_time?: number
  }>
}

interface FileContentResponseInternal {
  path: string
  content: string
  size: number
  type: string
}

export function useFiles(path: string = '') {
  const [data, setData] = useState<FileListDataInternal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await filesAPI.listDirectory(path)
      if (result) {
        setData(result as FileListDataInternal)
      }
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
  const [content, setContent] = useState<FileContentResponseInternal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!filePath) {
      setContent(null)
      return
    }

    setLoading(true)
    setError(null)
    
    filesAPI.readFile(filePath)
      .then((data: any) => {
        if (data) {
          setContent(data as FileContentResponseInternal)
        }
      })
      .catch((err: any) => setError(err instanceof Error ? err : new Error('Unknown error')))
      .finally(() => setLoading(false))
  }, [filePath])

  return { content, loading, error }
}
