import { FiCheckCircle, FiXCircle, FiClock, FiCircle } from 'react-icons/fi'
import type { TaskStats } from '../../api/types'

interface TaskStatsProps {
  data: TaskStats | null
}

export default function TaskStats({ data }: TaskStatsProps) {
  if (!data) return null

  const stats = [
    { label: 'Completed', value: data.completed, icon: FiCheckCircle, color: 'text-green-500' },
    { label: 'Running', value: data.running, icon: FiClock, color: 'text-blue-500' },
    { label: 'Failed', value: data.failed, icon: FiXCircle, color: 'text-red-500' },
    { label: 'Pending', value: data.pending, icon: FiCircle, color: 'text-gray-400' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-sm text-gray-500">{label}</span>
          </div>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
      ))}
    </div>
  )
}
