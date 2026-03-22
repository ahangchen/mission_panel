import { useTasks } from '../../hooks/useTasks'
import TaskCard from './TaskCard'
import TaskFilter from './TaskFilter'
import { useState } from 'react'

interface TaskListProps {
  days: number
}

export default function TaskList({ days }: TaskListProps) {
  const [status, setStatus] = useState<string | undefined>()
  const { data, loading, error, refetch } = useTasks({ status, days })

  if (error) {
    return (
      <div className="text-red-600 p-4">
        Error loading tasks: {error.message}
        <button onClick={refetch} className="ml-4 text-blue-600 hover:underline">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Filter */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Recent Tasks</h3>
        <TaskFilter 
          status={status} 
          onStatusChange={setStatus} 
          onRefresh={refetch}
        />
      </div>

      {/* Task List */}
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-auto">
        {loading ? (
          <div className="p-4 text-gray-600">Loading...</div>
        ) : !data || data.tasks.length === 0 ? (
          <div className="p-4 text-gray-600">No tasks found</div>
        ) : (
          data.tasks.map((task: any) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  )
}
