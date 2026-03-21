import TaskStats from '../components/TaskMonitor/TaskStats'
import TaskList from '../components/TaskMonitor/TaskList'
import { useTaskStats } from '../hooks/useTasks'
import Header from '../components/common/Header'

export default function Dashboard() {
  const { data: stats } = useTaskStats()

  return (
    <div className="space-y-6">
      <Header title="Dashboard" />
      <TaskStats data={stats} />
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-bold text-lg mb-4">Recent Tasks</h3>
        <TaskList />
      </div>
    </div>
  )
}
