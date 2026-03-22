import { statsAPI } from '../../api/client'
import { useState, useEffect } from 'react'
import type { OverviewStats } from '../../api/types'
import { FiActivity, FiCpu, FiDatabase, FiTrendingUp } from 'react-icons/fi'
import { formatNumber } from '../../utils/formatDate'

export default function OverviewCards() {
  const [data, setData] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    statsAPI.getOverview()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Unknown error')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-700">Loading...</div>
  if (error) return <div className="text-red-500">Error: {error.message}</div>
  if (!data) return null

  const cards = [
    {
      label: 'Tasks Completed',
      value: data.tasks.completed,
      subtext: `${data.tasks.success_rate.toFixed(1)}% success rate`,
      icon: FiActivity,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Tokens',
      value: formatNumber(data.tokens.total),
      subtext: `${formatNumber(data.tokens.input)} in / ${formatNumber(data.tokens.output)} out`,
      icon: FiCpu,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Skills Used',
      value: data.skills.unique_count,
      subtext: `${formatNumber(data.skills.total_calls)} total calls`,
      icon: FiDatabase,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      label: 'Success Rate',
      value: `${data.tasks.success_rate.toFixed(1)}%`,
      subtext: `Last ${data.period}`,
      icon: FiTrendingUp,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, subtext, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">{label}</span>
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-600 mt-1">{subtext}</p>
        </div>
      ))}
    </div>
  )
}
