import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [loading, setLoading] = useState(false)  // 改为 false，避免初始加载
  const [error, setError] = useState<Error | null>(null)
  const currentPathRef = useRef<string>('')  // 跟踪当前请求的路径

  const fetchFiles = useCallback(async () => {
    // 如果 path 为空，不加载（避免加载根目录数据到子目录）
    if (!path) {
      return
    }

    setLoading(true)
    setError(null)
    currentPathRef.current = path  // 记录当前请求的路径

    try {
      const result = await filesAPI.listDirectory(path)
      
      // 只有当返回数据的路径与当前请求路径匹配时才更新状态
      if (currentPathRef.current === path) {
        setData(result)
      }
    } catch (err) {
      if (currentPathRef.current === path) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      }
    } finally {
      if (currentPathRef.current === path) {
        setLoading(false)
      }
    }
  }, [path])

  useEffect(() => {
    fetchFiles()
    
    // 清理函数：当 path 改变时，清除旧数据
    return () => {
      currentPathRef.current = ''
    }
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
