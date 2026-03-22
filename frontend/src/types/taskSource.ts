import { FiCalendar, FiMessageCircle, FiMessageSquare } from 'react-icons/fi'

/**
 * Task source configuration
 */
export const TASK_SOURCES = {
  cron: {
    label: '定时任务',
    icon: FiCalendar,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  feishu: {
    label: '飞书',
    icon: FiMessageCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  qqbot: {
    label: 'QQBot',
    icon: FiMessageSquare,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
}

export type TaskSourceType = keyof typeof TASK_SOURCES

/**
 * Get task source config
 */
export function getTaskSourceConfig(source: string) {
  return TASK_SOURCES[source as TaskSourceType] || TASK_SOURCES.cron
}
