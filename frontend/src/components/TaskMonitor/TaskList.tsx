import { useTasks, useTaskStats } from '../../hooks/useTasks'
import TaskCard from './TaskCard'
import TaskStats from './TaskStats'
import TaskFilter from './TaskFilter'
import Loading from '../common/Loading'
import { useState } from 'react'

export default function TaskList() {
  const [status, setStatus] = useState<string | undefined>()
  const { data, loading, error, refetch } = useTasks({ status })
  const { data: stats } = useTaskStats()

  if (error) {
    return (
      <div className="text-red-600 p-4">
        Error loading tasks: {error.message}
        <button onClick={refetch} className="ml-2 underline">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TaskStats data={stats} />
      <TaskFilter status={status} onStatusChange={setStatus} onRefresh={refetch} />

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-3">
          {data?.tasks.length === 0 ? (
            <p className="text-gray-700 text-center py-8">No tasks found</p>
          ) : (
            data?.tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      )}
    </div>
  )
}
