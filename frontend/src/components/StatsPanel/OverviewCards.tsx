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
      .then((res: any) => {
        if (res) setData(res)
      })
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
      value: data.skills.total_calls,
      subtext: `${data.skills.unique_count} unique skills`,
      icon: FiDatabase,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      label: 'Success Rate',
      value: `${data.tasks.success_rate.toFixed(1)}%`,
      subtext: 'Last 7 days',
      icon: FiTrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`${card.bg} rounded-lg p-4 border border-gray-200`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{card.label}</span>
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-500 mt-1">{card.subtext}</div>
          </div>
        )
      })}
    </div>
  )
}
