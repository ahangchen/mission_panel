import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { tasksAPI } from '../../api/client'
import type { TaskStats } from '../../api/types'

const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#6B7280']

export default function UsageChart() {
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tasksAPI.getTaskStats()
      .then((res: any) => {
        if (res) setStats(res)
      })
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !stats) {
    return <div className="text-gray-700">Loading...</div>
  }

  const statusData = [
    { name: 'Completed', value: stats.completed },
    { name: 'Running', value: stats.running },
    { name: 'Failed', value: stats.failed },
    { name: 'Pending', value: stats.pending },
  ]

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Task Status Distribution</h3>
      
      <div>
        {/* Pie Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any) => [value, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {statusData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-sm text-gray-700 truncate">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
