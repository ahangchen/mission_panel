import { useState, useEffect, useCallback } from 'react'
import { tasksAPI } from '../api/client'
import type { TaskListResponse, TaskStats } from '../api/types'

interface UseTasksOptions {
  status?: string
  page?: number
  pageSize?: number
}

export function useTasks(options: UseTasksOptions = {}) {
  const [data, setData] = useState<TaskListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await tasksAPI.getWeekTasks(options.status, options.page, options.pageSize)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [options.status, options.page, options.pageSize])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return { data, loading, error, refetch: fetchTasks }
}

export function useTaskStats() {
  const [data, setData] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    tasksAPI.getTaskStats()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Unknown error')))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
