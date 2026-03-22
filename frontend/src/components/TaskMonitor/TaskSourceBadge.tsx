import { FiCalendar, FiMessageCircle, FiMessageSquare } from 'react-icons/fi'
import type { IconType } from 'react-icons'

/**
 * Task source configuration
 */
export const TASK_SOURCES: Record<string, {
  label: string
  icon: IconType
  color: string
  bgColor: string
}> = {
  cron: {
    label: '定时任务',
    icon: FiCalendar,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  feishu: {
    label: '飞书',
    icon: FiMessageCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  qqbot: {
    label: 'QQBot',
    icon: FiMessageSquare,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
}

/**
 * Get task source config
 */
export function getTaskSourceConfig(source: string) {
  return TASK_SOURCES[source] || TASK_SOURCES.cron
}

/**
 * Task Source Badge Component
 */
interface TaskSourceBadgeProps {
  source: string
  size?: 'sm' | 'md'
}

export default function TaskSourceBadge({ source, size = 'md' }: TaskSourceBadgeProps) {
  const config = getTaskSourceConfig(source)
  const Icon = config.icon
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-3 py-1 text-sm'
  
  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full ${config.bgColor} ${config.color} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{config.label}</span>
    </span>
  )
}
