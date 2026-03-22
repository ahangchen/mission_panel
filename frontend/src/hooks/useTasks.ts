import { useState, useEffect, useCallback } from 'react'
import { tasksAPI } from '../api/client'
import type { TaskListResponse, TaskStats } from '../api/types'

export function useTasks(filters?: { status?: string }) {
  const [data, setData] = useState<TaskListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await tasksAPI.getWeekTasks(filters?.status)
      if (result) {
        setData(result as TaskListResponse)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [filters?.status])

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
      .then((res: any) => {
        if (res) setData(res)
      })
      .catch((err: any) => setError(err instanceof Error ? err : new Error('Unknown error')))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
