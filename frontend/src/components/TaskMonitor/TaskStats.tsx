import { FiCheckCircle, FiXCircle, FiClock, FiCircle } from 'react-icons/fi'

interface TaskStatsProps {
  days: number
}

import { useTaskStats } from '../../hooks/useTasks'

export default function TaskStats({ days }: TaskStatsProps) {
  const { data } = useTaskStats(days)

  if (!data) return null

  const stats = [
    { label: 'Completed', value: data.completed, icon: FiCheckCircle, color: 'text-green-500' },
    { label: 'Running', value: data.running, icon: FiClock, color: 'text-blue-500' },
    { label: 'Failed', value: data.failed, icon: FiXCircle, color: 'text-red-500' },
    { label: 'Pending', value: data.pending, icon: FiCircle, color: 'text-gray-600' },
  ]

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-bold mt-2 text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
