import { statsAPI } from '../../api/client'
import { useState, useEffect } from 'react'
import { FiAward } from 'react-icons/fi'

interface SkillUsage {
  skill_name: string
  count: number
  last_used: string
}

export default function SkillRanking() {
  const [skills, setSkills] = useState<SkillUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    statsAPI.getSkillStats(7, 10)
      .then((data: any) => {
        // Handle different response formats
        const skillList = Array.isArray(data) ? data : (data.skills || [])
        setSkills(skillList)
      })
      .catch(err => setError(err instanceof Error ? err : new Error('Unknown error')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500">Loading...</div>
  if (error) return <div className="text-red-500">Error: {error.message}</div>

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FiAward className="w-5 h-5 text-yellow-500" />
        Top Skills (Past 7 Days)
      </h3>
      
      {skills.length === 0 ? (
        <p className="text-gray-500 text-sm">No skill usage data available yet.</p>
      ) : (
        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div key={skill.skill_name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900">{skill.skill_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((skill.count / (skills[0]?.count || 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{skill.count}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
