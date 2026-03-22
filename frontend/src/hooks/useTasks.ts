import { useState, useEffect, useCallback } from 'react'
import { tasksAPI } from '../api/client'
import type { TaskListResponse, TaskStats } from '../api/types'

export function useTasks(filters?: { status?: string, days?: number }) {
  const [data, setData] = useState<TaskListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await tasksAPI.getWeekTasks(
        filters?.status, 
        1, 
        50, 
        filters?.days || 7
      )
      if (result) {
        setData(result as TaskListResponse)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [filters?.status, filters?.days])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return { data, loading, error, refetch: fetchTasks }
}

export function useTaskStats(days: number = 7) {
  const [data, setData] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    tasksAPI.getTaskStats(days)
      .then((res: any) => {
        if (res) setData(res)
      })
      .catch((err: any) => setError(err instanceof Error ? err : new Error('Unknown error')))
      .finally(() => setLoading(false))
  }, [days])

  return { data, loading, error }
}
