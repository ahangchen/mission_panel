import TaskStats from '../components/TaskMonitor/TaskStats'
import TaskList from '../components/TaskMonitor/TaskList'
import { useTaskStats } from '../hooks/useTasks'
import Header from '../components/common/Header'
import OverviewCards from '../components/StatsPanel/OverviewCards'

export default function Dashboard() {
  const { data: stats } = useTaskStats()

  return (
    <div className="space-y-6">
      <Header title="Dashboard" subtitle="Mission Panel Overview" />
      
      {/* Overview Cards */}
      <OverviewCards />
      
      {/* Task Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Task Statistics (Past 7 Days)</h2>
        <TaskStats data={stats} />
      </div>
      
      {/* Recent Tasks */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Tasks</h2>
        <TaskList />
      </div>
    </div>
  )
}
