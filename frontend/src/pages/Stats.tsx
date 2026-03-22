import OverviewCards from '../components/StatsPanel/OverviewCards'
import SkillRanking from '../components/StatsPanel/SkillRanking'
import UsageChart from '../components/StatsPanel/UsageChart'
import Header from '../components/common/Header'

export default function Stats() {
  return (
    <div className="space-y-6">
      <Header 
        title="Statistics" 
        subtitle="Task performance and usage analytics" 
      />
      <OverviewCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillRanking />
        <UsageChart />
      </div>
    </div>
  )
}
