import { useQuery } from '../../hooks/useTasks'
import { statsAPI } from '../../api/client'
import type { SkillStatsResponse } from '../../api/types'
import Loading from '../common/Loading'

export default function SkillRanking() {
  const { data, loading, error } = useQuery<SkillStatsResponse>(() => statsAPI.getSkillStats())

  if (loading) return <Loading />
  if (error) return <div className="text-red-600">Error: {error.message}</div>
  if (!data) return null

  const maxCount = Math.max(...data.ranking.map(r => r.count))

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-bold text-lg mb-4">Skill Usage Ranking (Last {data.period_days} Days)</h3>
      <div className="space-y-3">
        {data.ranking.map((skill) => (
          <div key={skill.skill_name}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">{skill.rank}. {skill.skill_name}</span>
              <span className="text-gray-500">{skill.count} times</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${(skill.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple useQuery hook for stats
function useQuery<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetcher()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Unknown error')))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

import { useState, useEffect } from 'react'
