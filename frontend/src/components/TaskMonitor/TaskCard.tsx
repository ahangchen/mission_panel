import { FiCheckCircle, FiXCircle, FiClock, FiCircle } from 'react-icons/fi'
import ReactMarkdown from 'react-markdown'
import type { Task } from '../../api/types'
import { formatDate, formatDuration } from '../../utils/formatDate'

interface TaskCardProps {
  task: Task
}

const statusConfig = {
  ok: { icon: FiCheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Completed' },
  error: { icon: FiXCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Failed' },
  running: { icon: FiClock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Running' },
  pending: { icon: FiCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Pending' },
}

export default function TaskCard({ task }: TaskCardProps) {
  const config = statusConfig[task.status]
  const StatusIcon = config.icon

  return (
    <div className={`${config.bg} rounded-lg p-4 border border-gray-200`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <StatusIcon className={`w-5 h-5 mt-0.5 ${config.color}`} />
          <div>
            <h3 className="font-medium text-gray-900">{task.task_name || task.job_id}</h3>
            <p className="text-sm text-gray-700 mt-1">
              {formatDate(task.start_time)}
              {task.duration_ms && ` · ${formatDuration(task.duration_ms)}`}
            </p>
          </div>
        </div>
        {task.model && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {task.model}
          </span>
        )}
      </div>
      {task.summary && (
        <div className="mt-3 text-sm text-gray-700 prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-lg font-bold mt-3 mb-2 text-gray-900">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-semibold mt-3 mb-2 text-gray-900">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-semibold mt-2 mb-1 text-gray-900">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-2 text-gray-700 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-2 space-y-1 text-gray-700">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-700">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">{children}</strong>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 text-gray-900 px-1 py-0.5 rounded text-xs">
                  {children}
                </code>
              ),
            }}
          >
            {task.summary}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
