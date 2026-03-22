import { useState } from 'react'
import Header from '../components/common/Header'
import PeriodSelector from '../components/common/PeriodSelector'
import TaskList from '../components/TaskMonitor/TaskList'
import TaskStats from '../components/TaskMonitor/TaskStats'

export default function Tasks() {
  const [period, setPeriod] = useState(7) // 默认 7 天

  return (
    <div className="h-full flex flex-col">
      <Header 
        title="Task Monitor" 
        subtitle="View and manage your tasks" 
      />
      
      <div className="flex-1 overflow-auto mt-4 space-y-4">
        {/* Period Selector */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Task Statistics */}
        <TaskStats days={period} />

        {/* Task List */}
        <TaskList days={period} />
      </div>
    </div>
  )
}
