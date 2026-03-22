import { useState } from 'react'
import Header from '../components/common/Header'
import PeriodSelector from '../components/common/PeriodSelector'
import OverviewCards from '../components/StatsPanel/OverviewCards'
import TaskStats from '../components/TaskMonitor/TaskStats'
import TaskList from '../components/TaskMonitor/TaskList'

export default function Dashboard() {
  const [period, setPeriod] = useState(7) // 默认 7 天

  return (
    <div className="h-full flex flex-col">
      <Header 
        title="Dashboard" 
        subtitle="Mission Panel Overview" 
      />
      
      <div className="flex-1 overflow-auto mt-4 space-y-6">
        {/* Period Selector */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Overview Cards */}
        <OverviewCards days={period} />

        {/* Task Statistics */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Task Statistics (Past {period} Days)
          </h3>
          <TaskStats days={period} />
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Recent Tasks</h3>
          </div>
          <TaskList days={period} />
        </div>
      </div>
    </div>
  )
}
