interface PeriodSelectorProps {
  value: number
  onChange: (days: number) => void
}

const PERIOD_OPTIONS = [
  { label: '过去 7 天', value: 7 },
  { label: '过去 30 天', value: 30 },
  { label: '过去 90 天', value: 90 },
]

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-700">统计周期：</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
