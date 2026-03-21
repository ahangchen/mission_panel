import { FiRefreshCw } from 'react-icons/fi'

interface TaskFilterProps {
  status: string | undefined
  onStatusChange: (status: string | undefined) => void
  onRefresh: () => void
}

const statusOptions = [
  { value: undefined, label: 'All' },
  { value: 'ok', label: 'Completed' },
  { value: 'running', label: 'Running' },
  { value: 'error', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
]

export default function TaskFilter({ status, onStatusChange, onRefresh }: TaskFilterProps) {
  return (
    <div className="flex items-center gap-4">
      <select
        value={status || ''}
        onChange={(e) => onStatusChange(e.target.value || undefined)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {statusOptions.map(({ value, label }) => (
          <option key={label} value={value || ''}>
            {label}
          </option>
        ))}
      </select>

      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <FiRefreshCw className="w-4 h-4" />
        <span>Refresh</span>
      </button>
    </div>
  )
}
