import { useState } from 'react'
import Header from '../components/common/Header'
import PeriodSelector from '../components/common/PeriodSelector'
import OverviewCards from '../components/StatsPanel/OverviewCards'
import UsageChart from '../components/StatsPanel/UsageChart'
import SkillRanking from '../components/StatsPanel/SkillRanking'

export default function Stats() {
  const [period, setPeriod] = useState(7) // 默认 7 天

  return (
    <div className="h-full flex flex-col">
      <Header 
        title="Statistics" 
        subtitle="Mission Panel Usage Analytics" 
      />
      
      <div className="flex-1 overflow-auto mt-4 space-y-6">
        {/* Period Selector */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Overview Cards */}
        <OverviewCards days={period} />

        {/* Usage Chart */}
        <UsageChart days={period} />

        {/* Skill Ranking */}
        <SkillRanking />
      </div>
    </div>
  )
}
