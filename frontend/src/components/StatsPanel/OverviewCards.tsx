import { FiCheckCircle, FiCpu, FiZap } from 'react-icons/fi'
import { statsAPI } from '../../api/client'
import type { OverviewStats } from '../../api/types'
import Loading from '../common/Loading'
import { formatTokens } from '../../utils/formatSize'
import { useState, useEffect } from 'react'

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

  if (loading) return <Loading />
  if (error) return <div className="text-red-600">Error: {error.message}</div>
  if (!data) return null

  const cards = [
    {
      title: 'Tasks Completed',
      value: data.tasks.completed,
      subValue: `${data.tasks.success_rate}% success rate`,
      icon: FiCheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Total Tasks',
      value: data.tasks.total,
      subValue: `Last ${data.period}`,
      icon: FiCpu,
      color: 'bg-blue-500',
    },
    {
      title: 'Tokens Used',
      value: formatTokens(data.tokens.total),
      subValue: `${formatTokens(data.tokens.input)} in / ${formatTokens(data.tokens.output)} out`,
      icon: FiZap,
      color: 'bg-purple-500',
    },
    {
      title: 'Skill Calls',
      value: data.skills.total_calls,
      subValue: `${data.skills.unique_count} unique skills`,
      icon: FiZap,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ title, value, subValue, icon: Icon, color }) => (
        <div key={title} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`${color} p-2 rounded-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{title}</p>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-gray-400">{subValue}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
